#!/usr/bin/env node
/*
 * Contrast of white hero type against the photograph behind it.
 *
 * axe reports "incomplete" for text over an image and moves on, because it
 * cannot know what the pixels behind a glyph actually are. That is exactly the
 * case the homepage and every project page now depend on: the hero is a
 * full-bleed cover photograph, chosen by whoever uploads it, with white type
 * over its lower half. A scrim tuned by eye against one image is a guess about
 * every future image, and the first version of it left the homepage headline at
 * 2.9:1 where it crossed a window.
 *
 * So this measures the real thing. For each hero it records where the type sits,
 * makes the glyphs transparent, screenshots the exact region each block
 * occupied, and takes the worst contrast any pixel in that region would give
 * white text. Pixels are read back through a canvas in the page, so nothing
 * outside playwright-core is needed to decode the screenshot.
 *
 * Usage:
 *   scripts/with-local-env.sh npm run build
 *   scripts/with-local-env.sh npm start &
 *   node scripts/test-hero-contrast.js
 */

const fs = require('fs')
const { chromium } = require('playwright-core')

const BASE = process.env.BASE || 'http://localhost:3000'

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/usr/local/bin/google-chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)

/** WCAG 1.4.3 for normal-size text. The display headline clears 1.4.6 anyway. */
const MIN_RATIO = 4.5

/*
 * A tablet is not a smaller desktop here. The headline wraps to one more line at
 * this width, which lifts its first line into the part of the scrim that has
 * already started to release, and the mobile scrim that compensates for exactly
 * that only applies below 640px.
 */
const VIEWPORTS = [
  ['desktop', 1440, 900],
  ['tablet', 1024, 768],
  ['mobile', 390, 844],
]

let passes = 0
const failures = []

function check(label, ok, detail) {
  if (ok) {
    passes += 1
    console.log(`  ok   ${label}`)
  } else {
    failures.push(label)
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

function resolveChrome() {
  const found = CHROME_CANDIDATES.find((p) => fs.existsSync(p))
  if (!found) {
    console.error(`No Chrome binary found. Tried:\n  ${CHROME_CANDIDATES.join('\n  ')}`)
    process.exit(1)
  }
  return found
}

/**
 * Every project with photography, so the suite measures against the covers that
 * actually exist rather than one hand-picked image. A bright shopfront is a much
 * harder test than a dark restaurant and there is no telling which is uploaded
 * next.
 */
async function heroRoutes(context) {
  const page = await context.newPage()
  await page.goto(`${BASE}/projects`, { waitUntil: 'domcontentloaded' })
  const hrefs = await page.$$eval('a[href^="/projects/"]', (links) =>
    Array.from(new Set(links.map((l) => l.getAttribute('href'))))
  )
  await page.close()
  return ['/', ...hrefs]
}

/** Worst contrast that white text could have against any pixel of a PNG. */
async function worstContrast(page, pngBuffer) {
  return page.evaluate(async (dataUrl) => {
    const channel = (c) => {
      const s = c / 255
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    }

    const image = new Image()
    await new Promise((resolve, reject) => {
      image.onload = resolve
      image.onerror = reject
      image.src = dataUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0)
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)

    let worst = Infinity
    for (let i = 0; i < data.length; i += 4) {
      const lum =
        0.2126 * channel(data[i]) + 0.7152 * channel(data[i + 1]) + 0.0722 * channel(data[i + 2])
      const ratio = 1.05 / (lum + 0.05)
      if (ratio < worst) worst = ratio
    }
    return worst
  }, `data:image/png;base64,${pngBuffer.toString('base64')}`)
}

async function measureHero(context, route, [label, width, height]) {
  const page = await context.newPage()
  await page.setViewportSize({ width, height })
  await page.goto(BASE + route, { waitUntil: 'load' })
  await page
    .waitForFunction(() => Array.from(document.images).every((i) => i.complete), null, {
      timeout: 20000,
    })
    .catch(() => {})
  await page.waitForTimeout(600)

  // The block that owns the h1 is the hero, on the homepage and a project page
  // alike. Only text inside it sits over a photograph.
  const blocks = await page.evaluate(() => {
    const scope = document.querySelector('h1')?.closest('section, header')
    if (!scope) return []
    return Array.from(scope.querySelectorAll('h1, p'))
      .map((node) => {
        const r = node.getBoundingClientRect()
        return {
          tag: node.tagName.toLowerCase(),
          text: node.innerText.trim().slice(0, 28),
          box: { x: r.x, y: r.y, width: r.width, height: r.height },
        }
      })
      .filter((b) => b.box.width >= 4 && b.box.height >= 4)
  })

  if (blocks.length === 0) {
    check(`${route} @ ${label}: hero type found`, false, 'no h1 with text blocks')
    await page.close()
    return
  }

  // Hide the glyphs themselves, descendants included — a span carrying its own
  // text-white beats a colour inherited from its parent, and a white glyph left
  // in the clip reads as a 1:1 pixel and fails every hero.
  await page.addStyleTag({
    content: `h1, h1 *, header p, header p *, section p, section p * { color: transparent !important; }`,
  })
  await page.waitForTimeout(200)

  let worstOnPage = Infinity
  for (const block of blocks) {
    const clip = {
      x: Math.max(0, block.box.x),
      y: Math.max(0, block.box.y),
      width: Math.min(block.box.width, width - Math.max(0, block.box.x)),
      height: Math.min(block.box.height, height - Math.max(0, block.box.y)),
    }
    if (clip.width < 4 || clip.height < 4 || clip.y >= height) continue

    const shot = await page.screenshot({ clip })
    const ratio = await worstContrast(page, shot)
    worstOnPage = Math.min(worstOnPage, ratio)
  }

  check(
    `${route} @ ${label}: hero type clears ${MIN_RATIO}:1`,
    worstOnPage >= MIN_RATIO,
    `worst pixel gives ${worstOnPage.toFixed(2)}:1`
  )
  console.log(`         worst ${worstOnPage.toFixed(2)}:1 across ${blocks.length} block(s)`)
  await page.close()
}

async function main() {
  const browser = await chromium.launch({
    executablePath: resolveChrome(),
    args: ['--no-sandbox'],
  })
  const context = await browser.newContext()

  // A route substring can be passed to narrow the run while iterating on one hero.
  const filter = process.argv[2]
  const routes = (await heroRoutes(context)).filter((r) => !filter || r.includes(filter))
  console.log(`\n-- hero type over photography (${routes.length} route(s)) ----------------`)

  for (const route of routes) {
    for (const viewport of VIEWPORTS) {
      await measureHero(context, route, viewport)
    }
  }

  await browser.close()

  console.log(`\n${passes} passed, ${failures.length} failed`)
  if (failures.length) {
    console.log(failures.map((f) => `  - ${f}`).join('\n'))
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
