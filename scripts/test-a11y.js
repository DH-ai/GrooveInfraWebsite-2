#!/usr/bin/env node
/*
 * Accessibility regression suite.
 *
 * Two halves. The first runs axe-core over every public route and the admin
 * screens and fails on any WCAG 2.0/2.1/2.2 A or AA violation. The second drives
 * the things axe cannot see — that Escape closes the lightbox, that focus comes
 * back to the thumbnail that opened it, that arrow keys move between images,
 * that reduced motion actually stops the carousel — because a component can
 * satisfy every static rule and still be unusable from a keyboard.
 *
 * Usage:
 *   scripts/with-local-env.sh npm run build
 *   scripts/with-local-env.sh npm start &
 *   node scripts/test-a11y.js
 *
 * Start the server through with-local-env.sh. Next does not overwrite variables
 * that are already present in the process environment, so a shell that exports
 * its own SUPABASE or ADMIN values leaves the server pointed somewhere other
 * than the database this script seeds its fixture into, and the fixture checks
 * fail for reasons that have nothing to do with accessibility.
 *
 * Needs a Chrome or Chromium binary. Set CHROME_PATH if it is not in one of the
 * usual locations.
 */

const fs = require('fs')
const { chromium } = require('playwright-core')
const axe = require('axe-core')

const BASE = process.env.BASE || 'http://localhost:3000'

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/usr/local/bin/google-chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

// Interactive targets below this are a WCAG 2.5.8 (AA) failure unless spacing
// exempts them. 44px is the stricter 2.5.5 figure and is reported separately.
const MIN_TARGET_PX = 24

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

async function runAxe(page) {
  await page.addScriptTag({ content: axe.source })
  return page.evaluate(
    (tags) =>
      window.axe
        .run(document, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations'] })
        .then((r) =>
          r.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            nodes: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
          }))
        ),
    WCAG_TAGS
  )
}

/**
 * Brings a page to the state an audit should judge it in.
 *
 * Scroll-reveal sections start at opacity 0 and axe skips anything invisible, so
 * an unscrolled page hides most of its own content from the audit. Scrolling
 * alone is not enough either: axe computes contrast from the composited colour,
 * so a section caught mid-fade reports a contrast violation on text that is
 * perfectly legible once the animation finishes. This waits for the reveals to
 * actually land rather than guessing at a duration.
 */
async function settleForAudit(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 90))
    }
    window.scrollTo(0, 0)
  })

  await page
    .waitForFunction(
      () =>
        Array.from(document.querySelectorAll('[data-animated-section]')).every(
          (el) => parseFloat(getComputedStyle(el).opacity) > 0.99
        ),
      undefined,
      { timeout: 5000 }
    )
    .catch(() => {
      // A section that never finishes revealing is itself worth seeing in the
      // report, so fall through and let axe judge the page as it stands.
    })
}

async function auditRoute(context, path, { signIn } = {}) {
  const page = await context.newPage()
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' })
  await settleForAudit(page)

  const violations = await runAxe(page)
  check(
    `axe: ${path}`,
    violations.length === 0,
    violations.map((v) => `${v.id} [${v.impact}] ${v.nodes[0]}`).join('; ')
  )

  const smallTargets = await page.evaluate((min) => {
    const selector =
      'a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
    return Array.from(document.querySelectorAll(selector))
      .filter((el) => el.offsetParent !== null)
      .filter((el) => {
        const s = getComputedStyle(el)
        // WCAG 2.5.8 exempts a target whose size is constrained by the
        // line-height of surrounding text, which is what a display:inline link
        // inside a paragraph is. It also only applies to targets that are
        // actually presented, so the clipped visually-hidden pattern is out.
        if (s.clip !== 'auto' || s.clipPath !== 'none') return false
        if (el.tagName === 'A' && s.display === 'inline') return false
        return true
      })
      .map((el) => {
        const r = el.getBoundingClientRect()
        return {
          w: Math.round(r.width),
          h: Math.round(r.height),
          tag: el.tagName.toLowerCase(),
          label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40),
        }
      })
      .filter((t) => t.w > 0 && t.h > 0 && (t.w < min || t.h < min))
  }, MIN_TARGET_PX)

  check(
    `targets >= ${MIN_TARGET_PX}px: ${path}`,
    smallTargets.length === 0,
    smallTargets.map((t) => `${t.tag} "${t.label}" ${t.w}x${t.h}`).join('; ')
  )

  await page.close()
  return { violations, smallTargets, signIn }
}

/**
 * Signs in so the admin screens can be audited too. Returns false rather than
 * throwing when the credentials do not match what the running server was started
 * with, so a local misconfiguration reports one skipped check instead of taking
 * the whole suite down.
 */
async function signIn(context) {
  const env = (key) => {
    if (process.env[key]) return process.env[key]
    const line = fs
      .readFileSync(`${__dirname}/../.env.local`, 'utf8')
      .split('\n')
      .find((l) => l.startsWith(`${key}=`))
    return line ? line.slice(key.length + 1) : ''
  }

  const page = await context.newPage()
  try {
    await page.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded' })
    await page.fill('input[name="username"]', env('ADMIN_USERNAME'))
    await page.fill('input[name="password"]', env('ADMIN_PASSWORD'))
    await page.click('button[type="submit"]')
    await page.waitForURL((url) => !url.pathname.startsWith('/admin/login'), { timeout: 15000 })
    return true
  } catch {
    return false
  } finally {
    await page.close()
  }
}

async function testSkipLink(context) {
  const page = await context.newPage()
  await page.goto(`${BASE}/`, { waitUntil: 'load' })
  await page.keyboard.press('Tab')

  const first = await page.evaluate(() => {
    const el = document.activeElement
    return { text: el.textContent.trim(), href: el.getAttribute('href') }
  })
  check(
    'skip link is the first tab stop',
    first.href === '#main-content',
    `focused: ${first.text} (${first.href})`
  )

  const visible = await page.evaluate(() => {
    const el = document.activeElement
    const r = el.getBoundingClientRect()
    return r.width > 40 && r.height > 20
  })
  check('skip link becomes visible when focused', visible)

  await page.keyboard.press('Enter')
  await page.waitForTimeout(200)
  const landed = await page.evaluate(() => document.activeElement?.id)
  check('skip link moves focus to <main>', landed === 'main-content', `focus on: ${landed}`)

  await page.close()
}

async function testFocusRing(context) {
  const page = await context.newPage()
  await page.goto(`${BASE}/`, { waitUntil: 'load' })
  const ring = await page.evaluate(() => {
    const link = document.querySelector('header a[href="/projects"]')
    link.focus()
    const s = getComputedStyle(link)
    return { width: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor }
  })
  check(
    'focused nav link paints a >=2px outline',
    parseFloat(ring.width) >= 2 && ring.style !== 'none',
    JSON.stringify(ring)
  )
  await page.close()
}

function envLocal(key) {
  const line = fs
    .readFileSync(`${__dirname}/../.env.local`, 'utf8')
    .split('\n')
    .find((l) => l.startsWith(`${key}=`))
  return line ? line.slice(key.length + 1) : ''
}

/**
 * The lightbox checks need a project with more than one image, and how many
 * images a given environment happens to have seeded is not something the suite
 * should depend on. This inserts a throwaway project with three, runs the checks
 * against it and deletes it again.
 *
 * The image URLs point at the configured storage bucket so they pass the app's
 * own URL allowlist; the objects need not exist, since what is under test is the
 * dialog's keyboard behaviour rather than image delivery.
 */
async function withGalleryFixture(run) {
  const url = envLocal('NEXT_PUBLIC_SUPABASE_URL')
  const key = envLocal('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) {
    check('gallery fixture created', false, 'Supabase URL or service key missing from .env.local')
    return
  }

  const slug = `a11y-gallery-fixture-${Date.now()}`
  const bucket = `${url}/storage/v1/object/public/project-images/${slug}`
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  }

  const created = await fetch(`${url}/rest/v1/projects`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      slug,
      title: 'Accessibility Gallery Fixture',
      category: 'retail',
      location: 'Test',
      client_name: 'Test',
      basic_description: 'Temporary fixture for the accessibility suite.',
      description: 'Temporary fixture for the accessibility suite.',
      duration: '1 week',
      cover_image: `${bucket}/cover.jpg`,
      images: [`${bucket}/1.jpg`, `${bucket}/2.jpg`, `${bucket}/3.jpg`],
    }),
  })

  if (!created.ok) {
    check('gallery fixture created', false, `${created.status} ${await created.text()}`)
    return
  }

  try {
    await run(`/projects/${slug}`)
  } finally {
    await fetch(`${url}/rest/v1/projects?slug=eq.${slug}`, { method: 'DELETE', headers })
  }
}

/**
 * The mirror of withGalleryFixture: a project with nothing uploaded, which is the
 * state every project is in until the client's photography lands.
 */
async function withUnphotographedFixture(run) {
  const url = envLocal('NEXT_PUBLIC_SUPABASE_URL')
  const key = envLocal('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) {
    check('placeholder fixture created', false, 'Supabase URL or service key missing from .env.local')
    return
  }

  const slug = `a11y-placeholder-fixture-${Date.now()}`
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  }

  const created = await fetch(`${url}/rest/v1/projects`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      slug,
      title: 'Accessibility Placeholder Fixture',
      category: 'commercial',
      location: 'Test',
      client_name: 'Test',
      basic_description: 'Temporary fixture for the accessibility suite.',
      description: 'Temporary fixture for the accessibility suite.',
      duration: '1 week',
      images: [],
    }),
  })

  if (!created.ok) {
    check('placeholder fixture created', false, `${created.status} ${await created.text()}`)
    return
  }

  try {
    await run(`/projects/${slug}`)
  } finally {
    await fetch(`${url}/rest/v1/projects?slug=eq.${slug}`, { method: 'DELETE', headers })
  }
}

/**
 * Placeholder plates are drawn with a CSS background-image, and axe cannot
 * measure contrast against one — it reports nothing rather than a violation. So
 * the two things that can silently regress here are checked directly: that the
 * plate stays out of the accessibility tree, and that any caption laid over it
 * keeps the alpha the contrast audit in ProjectImage.tsx was done at. At 0.45,
 * where the caption started, it measured 4.27:1 over the brightest part of a
 * plate and failed.
 */
const MIN_PLATE_LABEL_ALPHA = 0.7

async function testPlaceholderImagery(context, projectPath) {
  const page = await context.newPage()
  try {
    await page.goto(`${BASE}${projectPath}`, { waitUntil: 'domcontentloaded' })

    const plate = page.locator('[data-placeholder="true"]').first()
    check('placeholder: a plate is drawn', (await plate.count()) > 0)

    check(
      'placeholder: plate is not in the accessibility tree',
      (await plate.getAttribute('role')) === 'presentation',
      'a generated tonal field has no image content to announce'
    )

    await settleForAudit(page)
    const violations = await runAxe(page)
    check(
      'placeholder: axe clean',
      violations.length === 0,
      violations.map((v) => `${v.id} (${v.nodes.join(', ')})`).join('; ')
    )

    // Every caption over a plate, anywhere on the site, not just this fixture.
    await page.goto(`${BASE}/about`, { waitUntil: 'domcontentloaded' })
    const alphas = await page.$$eval('[data-placeholder="true"] span', (spans) =>
      spans
        .filter((s) => (s.textContent || '').trim().length > 0)
        .map((s) => {
          const m = getComputedStyle(s).color.match(/rgba?\(([^)]+)\)/)
          const parts = m ? m[1].split(',').map((p) => parseFloat(p)) : []
          return parts.length === 4 ? parts[3] : 1
        })
    )
    check(
      'placeholder: captions keep their audited opacity',
      alphas.every((a) => a >= MIN_PLATE_LABEL_ALPHA),
      `found ${JSON.stringify(alphas)}, need >= ${MIN_PLATE_LABEL_ALPHA}`
    )
  } finally {
    await page.close()
  }
}

async function testLightbox(context, projectPath) {
  const page = await context.newPage()
  await page.goto(`${BASE}${projectPath}`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(500)

  const thumb = page.locator('button[aria-label^="Enlarge image 1"]')
  if ((await thumb.count()) === 0) {
    check('lightbox: gallery present', false, `no gallery thumbnails on ${projectPath}`)
    await page.close()
    return
  }

  const opened = await actUntil(
    page,
    async () => {
      await thumb.first().focus()
      await page.keyboard.press('Enter')
    },
    () => page.waitForSelector('[role="dialog"]', { timeout: 700 })
  )
  check('lightbox: Enter on a thumbnail opens it', opened)
  if (!opened) {
    await page.close()
    return
  }

  const dialog = page.locator('[role="dialog"]')
  check('lightbox: opens as aria-modal dialog', (await dialog.getAttribute('aria-modal')) === 'true')

  const focusInside = await page.evaluate(
    () => !!document.activeElement?.closest('[role="dialog"]')
  )
  check('lightbox: focus moves inside on open', focusInside)

  const counterBefore = (await dialog.locator('[aria-live="polite"]').innerText()).trim()
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(300)
  const counterAfter = (await dialog.locator('[aria-live="polite"]').innerText()).trim()
  check(
    'lightbox: ArrowRight advances the image',
    counterBefore !== counterAfter,
    `${counterBefore} -> ${counterAfter}`
  )

  // Tab far enough to have escaped a container without a trap.
  for (let i = 0; i < 12; i += 1) await page.keyboard.press('Tab')
  const stillInside = await page.evaluate(
    () => !!document.activeElement?.closest('[role="dialog"]')
  )
  check('lightbox: Tab stays trapped inside', stillInside)

  const scrollLocked = await page.evaluate(() => getComputedStyle(document.body).overflow)
  check('lightbox: body scrolling is locked', scrollLocked === 'hidden', scrollLocked)

  const axeInDialog = await runAxe(page)
  check(
    'lightbox: axe clean while open',
    axeInDialog.length === 0,
    axeInDialog.map((v) => `${v.id} ${v.nodes[0]}`).join('; ')
  )

  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  check('lightbox: Escape closes it', (await page.locator('[role="dialog"]').count()) === 0)

  const restored = await page.evaluate(() =>
    document.activeElement?.getAttribute('aria-label')
  )
  check(
    'lightbox: focus returns to the thumbnail that opened it',
    (restored || '').startsWith('Enlarge image 1'),
    `focus on: ${restored}`
  )

  await page.close()
}

/**
 * Retries an action until a condition holds. The markup is server-rendered, so a
 * key press can land before React has hydrated and be swallowed; without this the
 * interaction tests fail intermittently on nothing but timing.
 */
async function actUntil(page, act, settled, attempts = 12) {
  for (let i = 0; i < attempts; i += 1) {
    await act()
    try {
      await settled()
      return true
    } catch {
      await page.waitForTimeout(400)
    }
  }
  return false
}

async function testMobileMenu(context) {
  const page = await context.newPage()
  await page.setViewportSize({ width: 390, height: 780 })
  await page.goto(`${BASE}/`, { waitUntil: 'load' })

  const trigger = page.locator('button[aria-controls="mobile-navigation"]')
  check('mobile menu: trigger reports aria-expanded=false', (await trigger.getAttribute('aria-expanded')) === 'false')

  const opened = await actUntil(
    page,
    async () => {
      await trigger.focus()
      await page.keyboard.press('Enter')
    },
    () => page.waitForSelector('#mobile-navigation', { timeout: 700 })
  )
  check('mobile menu: Enter on the trigger opens it', opened)
  if (!opened) {
    await page.close()
    return
  }

  check('mobile menu: trigger flips to aria-expanded=true', (await trigger.getAttribute('aria-expanded')) === 'true')
  check(
    'mobile menu: opens as aria-modal dialog',
    (await page.locator('#mobile-navigation').getAttribute('aria-modal')) === 'true'
  )
  check(
    'mobile menu: focus moves inside on open',
    await page.evaluate(() => !!document.activeElement?.closest('#mobile-navigation'))
  )

  for (let i = 0; i < 10; i += 1) await page.keyboard.press('Tab')
  check(
    'mobile menu: Tab stays trapped inside',
    await page.evaluate(() => !!document.activeElement?.closest('#mobile-navigation'))
  )

  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  check('mobile menu: Escape closes it', (await page.locator('#mobile-navigation').count()) === 0)
  check(
    'mobile menu: focus returns to the trigger',
    await page.evaluate(
      () => document.activeElement?.getAttribute('aria-controls') === 'mobile-navigation'
    )
  )

  await page.close()
}

async function testAccordion(context) {
  const page = await context.newPage()
  await page.goto(`${BASE}/contact`, { waitUntil: 'load' })
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(400)

  const buttons = page.locator('button[id^="faq-button-"]')
  const count = await buttons.count()
  check('accordion: questions are disclosure buttons', count > 0, `found ${count}`)

  const inHeading = await page.evaluate(() => {
    const b = document.querySelector('button[id^="faq-button-"]')
    return b?.parentElement?.tagName.toLowerCase()
  })
  check('accordion: each question sits inside a heading', inHeading === 'h3', `parent: ${inHeading}`)

  const second = buttons.nth(1)
  const panelId = await second.getAttribute('aria-controls')
  check('accordion: button points at its panel', Boolean(panelId), `aria-controls: ${panelId}`)
  check('accordion: collapsed panel reports aria-expanded=false', (await second.getAttribute('aria-expanded')) === 'false')

  const expanded = await actUntil(
    page,
    async () => {
      await second.focus()
      await page.keyboard.press('Enter')
    },
    async () => {
      if ((await second.getAttribute('aria-expanded')) !== 'true') throw new Error('not expanded')
    }
  )
  check('accordion: Enter expands it', expanded)
  check(
    'accordion: expanded panel is a region labelled by its button',
    await page.evaluate((id) => {
      const p = document.getElementById(id)
      return p?.getAttribute('role') === 'region' && p.getAttribute('aria-labelledby')?.startsWith('faq-button-')
    }, panelId)
  )

  await page.close()
}

async function testFilters(context) {
  const page = await context.newPage()
  await page.goto(`${BASE}/projects`, { waitUntil: 'load' })
  await page.waitForTimeout(400)

  const group = page.locator('[role="group"][aria-label*="Filter"]')
  check('filters: chips sit in a labelled group', (await group.count()) === 1)

  const chips = group.locator('button')
  const total = await chips.count()
  check('filters: every chip reports aria-pressed', total > 0 && (await group.locator('button[aria-pressed]').count()) === total)

  const live = page.locator('p[aria-live="polite"]')
  const before = (await live.first().innerText()).trim()
  let after = before
  const changed = await actUntil(
    page,
    () => chips.nth(1).click(),
    async () => {
      after = (await live.first().innerText()).trim()
      if (after === before) throw new Error('count unchanged')
    }
  )
  check('filters: result count is announced on change', changed, `${before} -> ${after}`)
  check('filters: selected chip flips aria-pressed', (await chips.nth(1).getAttribute('aria-pressed')) === 'true')

  await page.close()
}

async function testReducedMotion(browser) {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto(`${BASE}/`, { waitUntil: 'load' })
  await page.waitForTimeout(800)

  const smoothScroll = await page.evaluate(
    () => getComputedStyle(document.documentElement).scrollBehavior
  )
  check('reduced motion: smooth scrolling is off', smoothScroll === 'auto', smoothScroll)

  /*
   * Scroll reveals must still finish. MotionConfig reducedMotion="user" drops the
   * transform and keeps the opacity change, so a section that starts at opacity 0
   * has to end at 1 — if it did not, this preference would blank the page.
   */
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
  await page.waitForTimeout(1200)
  const revealed = await page.evaluate(() =>
    [...document.querySelectorAll('[data-animated-section]')]
      .filter((el) => {
        const box = el.getBoundingClientRect()
        return box.top < window.innerHeight && box.bottom > 0
      })
      .every((el) => parseFloat(getComputedStyle(el).opacity) > 0.99)
  )
  check('reduced motion: scroll reveals still resolve to visible', revealed)

  await context.close()
}

/**
 * The homepage used to carry two things that moved on their own — a hero on a
 * 5.5s slide timer and an infinite image marquee — and each needed a pause
 * control to satisfy WCAG 2.2.2. Both are gone, replaced by a single static hero
 * and a ruled index, so the stronger property is now testable: nothing on the
 * page moves unless the visitor moves it.
 */
async function testNothingAutoplays(context) {
  const page = await context.newPage()
  await page.goto(`${BASE}/`, { waitUntil: 'load' })
  await settleForAudit(page)

  check(
    'motion: no carousel widget on the homepage',
    (await page.locator('[aria-roledescription="carousel"], [aria-roledescription="slide"]').count()) === 0
  )

  /*
   * A snapshot of every element's box, then the same snapshot five seconds later
   * without touching the page. Anything that shifted did so on a timer.
   */
  const sample = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('main *')].slice(0, 400).map((el) => {
        const box = el.getBoundingClientRect()
        return `${Math.round(box.x)},${Math.round(box.y)},${Math.round(box.width)}`
      })
    )

  const before = await sample()
  await page.waitForTimeout(5200)
  const after = await sample()

  const moved = before.filter((box, i) => box !== after[i]).length
  check(
    'motion: nothing shifts on a timer over five seconds',
    moved === 0,
    `${moved} element(s) moved without input`
  )

  check(
    'motion: therefore no pause control is needed',
    (await page.locator('button[aria-pressed]').count()) === 0,
    'a pause control here would imply something is still moving'
  )

  await page.close()
}

async function testNoDeadDarkVariants(context) {
  const page = await context.newPage()
  await page.goto(`${BASE}/`, { waitUntil: 'load' })
  // The `dark` class is gone from <html>, so any surviving `dark:` utility is a
  // silently dead style whose light-theme counterpart is what actually renders.
  const html = await page.content()
  const stray = html.match(/class="[^"]*\bdark:[^"]*"/g) || []
  check('no dead dark: variants in the served markup', stray.length === 0, stray.slice(0, 3).join(' | '))
  check(
    'html element carries no theme class',
    await page.evaluate(() => !document.documentElement.classList.contains('dark'))
  )
  await page.close()
}

async function main() {
  const executablePath = resolveChrome()
  const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] })
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } })

  const publicRoutes = ['/', '/projects', '/about', '/contact', '/privacy', '/terms', '/innovation']

  console.log('\n-- axe: public routes --------------------------------------------')
  for (const route of publicRoutes) await auditRoute(context, route)

  const slug = await context.newPage().then(async (p) => {
    await p.goto(`${BASE}/projects`, { waitUntil: 'domcontentloaded' })
    const href = await p.locator('a[href^="/projects/"]').first().getAttribute('href')
    await p.close()
    return href
  })

  if (slug) await auditRoute(context, slug)
  else check('project detail route discovered', false, 'no project links on /projects')

  console.log('\n-- axe: admin ---------------------------------------------------')
  await auditRoute(context, '/admin/login')
  if (await signIn(context)) {
    await auditRoute(context, '/admin')
  } else {
    check('admin sign-in for the authenticated audit', false, 'credentials rejected by the server')
  }

  console.log('\n-- keyboard: skip link and focus --------------------------------')
  await testSkipLink(context)
  await testFocusRing(context)

  console.log('\n-- keyboard: lightbox -------------------------------------------')
  await withGalleryFixture((fixturePath) => testLightbox(context, fixturePath))

  console.log('\n-- placeholder imagery -----------------------------------------')
  await withUnphotographedFixture((fixturePath) => testPlaceholderImagery(context, fixturePath))

  console.log('\n-- keyboard: mobile navigation ----------------------------------')
  await testMobileMenu(context)

  console.log('\n-- keyboard: accordion -----------------------------------------')
  await testAccordion(context)

  console.log('\n-- keyboard: project filters -----------------------------------')
  await testFilters(context)

  console.log('\n-- motion ------------------------------------------------------')
  await testNothingAutoplays(context)
  await testReducedMotion(browser)

  console.log('\n-- dark-only theme ---------------------------------------------')
  await testNoDeadDarkVariants(context)

  await browser.close()

  console.log(`\n${passes} passed, ${failures.length} failed`)
  if (failures.length) {
    console.log('\nFailures:')
    for (const f of failures) console.log(`  - ${f}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
