#!/usr/bin/env node
/*
 * Placeholder-imagery fallback suite.
 *
 * What it is protecting: a project with no uploaded photography must still render
 * a complete page, uploading photography must supersede the placeholder with no
 * code change, and nothing that claims to be the client's work — the homepage
 * carousel, a social card — may ever be filled with a placeholder.
 *
 * The interesting cases are all about which of the two states a surface is in, so
 * the suite drives them by actually moving a project between the states through
 * the admin API and re-reading the rendered HTML.
 *
 * Usage:
 *   scripts/with-local-env.sh npm run build
 *   scripts/with-local-env.sh npm start &
 *   node scripts/test-image-fallback.js
 *
 * Start the server through with-local-env.sh: Next never overwrites a variable
 * already present in process.env, so a shell exporting its own SUPABASE or ADMIN
 * values leaves the server talking to a different database than the one this
 * script seeds, and every fixture check fails for unrelated reasons.
 */

const fs = require('fs')

const BASE = process.env.BASE || 'http://localhost:3000'

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

function envLocal(key) {
  if (process.env[key]) return process.env[key]
  const line = fs
    .readFileSync(`${__dirname}/../.env.local`, 'utf8')
    .split('\n')
    .find((l) => l.startsWith(`${key}=`))
  return line ? line.slice(key.length + 1).trim() : ''
}

const SUPABASE_URL = envLocal('NEXT_PUBLIC_SUPABASE_URL')
const SERVICE_KEY = envLocal('SUPABASE_SERVICE_ROLE_KEY')
const STORAGE_PREFIX = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/project-images/`

const restHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
}

/**
 * Each run uses its own IPs. The login route and the contact route are rate
 * limited per client address, and a suite that reuses one address collides with
 * whatever ran before it.
 */
const RUN_ID = Date.now().toString().slice(-6)
let ipCounter = 0
function nextIp() {
  ipCounter += 1
  return `203.0.113.${(Number(RUN_ID.slice(-2)) + ipCounter) % 254 + 1}`
}

async function getHtml(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'X-Forwarded-For': nextIp() },
  })
  return { status: res.status, html: await res.text(), headers: res.headers }
}

async function insertRow(row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/projects`, {
    method: 'POST',
    headers: { ...restHeaders, Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  })
  if (!res.ok) throw new Error(`insert ${row.slug} failed: ${res.status} ${await res.text()}`)
}

async function deleteRow(slug) {
  await fetch(`${SUPABASE_URL}/rest/v1/projects?slug=eq.${slug}`, {
    method: 'DELETE',
    headers: restHeaders,
  })
}

/** An 8x8 JPEG. Real bytes, because the point is that a real file survives. */
const TINY_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAgAAAQABAAD//gAQTGF2YzYwLjMxLjEwMgD/2wBDAAgEBAQEBAUFBQUFBQYGBgYGBgYGBgYGBgYHBwcICAgHBwcGBgcHCAgICAkJCQgICAgJCQoKCgwMCwsODg4RERT/xABLAAEBAAAAAAAAAAAAAAAAAAAABwEBAAAAAAAAAAAAAAAAAAAAABABAAAAAAAAAAAAAAAAAAAAABEBAAAAAAAAAAAAAAAAAAAAAP/AABEIAAgACAMBIgACEQADEQD/2gAMAwEAAhEDEQA/AIyAD//Z',
  'base64'
)

async function putObject(path, bytes) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/project-images/${path}`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'image/jpeg',
      'x-upsert': 'true',
    },
    body: bytes,
  })
  if (!res.ok) throw new Error(`upload ${path} failed: ${res.status} ${await res.text()}`)
}

async function objectExists(path) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/public/project-images/${path}`, {
    method: 'HEAD',
  })
  return res.ok
}

async function removeObjects(prefix) {
  const list = await fetch(`${SUPABASE_URL}/storage/v1/object/list/project-images`, {
    method: 'POST',
    headers: restHeaders,
    body: JSON.stringify({ prefix, limit: 100 }),
  })
  if (!list.ok) return
  const names = (await list.json()).map((entry) => `${prefix}/${entry.name}`)
  if (names.length === 0) return
  await fetch(`${SUPABASE_URL}/storage/v1/object/project-images`, {
    method: 'DELETE',
    headers: restHeaders,
    body: JSON.stringify({ prefixes: names }),
  })
}

/**
 * Signs in with the admin credentials and returns the session cookie header. The
 * login route takes a form post and answers with a redirect, so the redirect is
 * left unfollowed and the cookie read off the 3xx itself.
 */
async function adminCookie() {
  const form = new URLSearchParams({
    username: envLocal('ADMIN_USERNAME'),
    password: envLocal('ADMIN_PASSWORD'),
  })

  const res = await fetch(`${BASE}/api/admin/login`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Forwarded-For': nextIp() },
    body: form,
  })

  const location = res.headers.get('location') || ''
  if (location.includes('/admin/login')) {
    throw new Error(`admin login rejected: ${location}`)
  }

  const cookie = (res.headers.getSetCookie?.() ?? [])
    .map((c) => c.split(';')[0])
    .join('; ')
  if (!cookie) throw new Error(`admin login returned no cookie (status ${res.status})`)
  return cookie
}

const baseRow = (slug, title) => ({
  slug,
  title,
  category: 'retail',
  location: 'Gurgaon, Haryana',
  client_name: 'Fallback Fixture Client',
  basic_description: 'Fixture for the placeholder imagery suite.',
  description: 'Fixture for the placeholder imagery suite. Created and removed by the test run.',
  year: 2025,
  area: '4,200 sq ft',
  duration: '9 weeks',
})

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.')
    process.exit(1)
  }

  const emptySlug = `fallback-empty-${RUN_ID}`
  const stockSlug = `fallback-stock-${RUN_ID}`
  const created = []
  const uploadedPrefixes = []

  try {
    // ---------------------------------------------------------------- fixtures
    /*
     * Two ways a project ends up with no usable photography: nothing was ever
     * uploaded, and the row still holds the third-party stock URLs the site used
     * to be seeded with. Both must resolve to a placeholder, and the second is
     * the reason the check is "is this URL in our bucket" rather than "is this
     * URL one of three known stock hostnames".
     */
    await insertRow({ ...baseRow(emptySlug, 'Fallback Empty Fixture'), images: [] })
    created.push(emptySlug)

    await insertRow({
      ...baseRow(stockSlug, 'Fallback Stock Fixture'),
      cover_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
      images: ['https://picsum.photos/seed/legacy/1200/800'],
    })
    created.push(stockSlug)

    // ------------------------------------------------- placeholder state, empty
    console.log('\nProject with nothing uploaded')
    const empty = await getHtml(`/projects/${emptySlug}`)
    check('detail page renders', empty.status === 200, `status ${empty.status}`)
    check('a placeholder plate is drawn', empty.html.includes('data-placeholder="true"'))
    check(
      'no gallery section is offered',
      !empty.html.includes('>Gallery<'),
      'a grid of plates behind a "Gallery" heading promises photographs and delivers a dead lightbox'
    )
    check(
      'no social card image is claimed',
      !empty.html.includes(`og:image" content="${STORAGE_PREFIX}`),
      'a placeholder must not be advertised as a photograph of the work'
    )

    // ------------------------------------------------- placeholder state, stock
    console.log('\nProject still holding legacy third-party stock URLs')
    const stock = await getHtml(`/projects/${stockSlug}`)
    check('detail page renders', stock.status === 200, `status ${stock.status}`)
    check('a placeholder plate is drawn', stock.html.includes('data-placeholder="true"'))
    check(
      'the stock URL is not rendered',
      !stock.html.includes('images.unsplash.com') && !stock.html.includes('picsum.photos'),
      'legacy rows must be ignored on read, without a migration'
    )

    // ------------------------------------------------------------ determinism
    console.log('\nPlate selection')
    const motifOf = (html) => (html.match(/data-motif="([a-z]+)"/) || [])[1]
    const repeat = await getHtml(`/projects/${emptySlug}`)
    check(
      'the same project draws the same plate every time',
      motifOf(empty.html) !== undefined && motifOf(empty.html) === motifOf(repeat.html),
      `${motifOf(empty.html)} then ${motifOf(repeat.html)}`
    )
    check(
      'different projects draw from the motif set',
      ['plan', 'section', 'hatch', 'reveal'].includes(motifOf(stock.html)),
      `got ${motifOf(stock.html)}`
    )

    // ------------------------------------------------------ the upload takeover
    console.log('\nUploading photography supersedes the placeholder')
    const cookie = await adminCookie()
    const uploaded = [`${STORAGE_PREFIX}${emptySlug}/image-01.jpg`, `${STORAGE_PREFIX}${emptySlug}/image-02.jpg`]

    const update = await fetch(`${BASE}/api/admin/projects/${emptySlug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie, 'X-Forwarded-For': nextIp() },
      body: JSON.stringify({
        ...baseRow(emptySlug, 'Fallback Empty Fixture'),
        images: uploaded,
        cover_image: uploaded[0],
        replace_gallery: true,
      }),
    })
    check('admin update accepted', update.ok, `status ${update.status} ${await update.text()}`)

    const swapped = await getHtml(`/projects/${emptySlug}`)
    check(
      'the plate is gone',
      !swapped.html.includes('data-placeholder="true"'),
      'the swap must need no code change and no cache wait — the admin route revalidates'
    )
    check(
      'the uploaded photography is rendered',
      swapped.html.includes('%2Fproject-images%2F') || swapped.html.includes('/project-images/'),
      'expected an optimised next/image URL pointing at our bucket'
    )
    check('the gallery section appears', swapped.html.includes('>Gallery<'))
    check(
      'the social card now claims the photograph',
      swapped.html.includes('og:image'),
      'once the work is photographed the card should show it'
    )

    // ------------------------------------- the new cover survives its own save
    /*
     * The browser uploads to the bucket first and submits the resulting URL
     * second, and the replacement is named cover.<ext> exactly like the file it
     * replaces. So the sweep that clears the old cover has to exclude the new
     * one by name. When it did not, every cover uploaded through the admin form
     * was deleted by the request that recorded it, and the project fell back to
     * a plate with a broken image behind it.
     */
    console.log('\nReplacing a cover keeps the file it was handed')
    const coverSlug = `fallback-cover-${RUN_ID}`
    await insertRow({ ...baseRow(coverSlug, 'Fallback Cover Fixture'), images: [] })
    created.push(coverSlug)
    uploadedPrefixes.push(coverSlug)

    await putObject(`${coverSlug}/cover.jpg`, TINY_JPEG)
    check('the cover file is in the bucket before saving', await objectExists(`${coverSlug}/cover.jpg`))

    const coverUrl = `${STORAGE_PREFIX}${coverSlug}/cover.jpg`
    const coverSave = await fetch(`${BASE}/api/admin/projects/${coverSlug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie, 'X-Forwarded-For': nextIp() },
      body: JSON.stringify({
        ...baseRow(coverSlug, 'Fallback Cover Fixture'),
        images: [coverUrl],
        cover_image: coverUrl,
        replace_gallery: true,
      }),
    })
    check('admin save accepted', coverSave.ok, `status ${coverSave.status}`)
    check(
      'the cover file is still in the bucket after saving',
      await objectExists(`${coverSlug}/cover.jpg`),
      'the sweep of superseded covers deleted the replacement it was given'
    )

    const coverPage = await getHtml(`/projects/${coverSlug}`)
    check(
      'the detail page shows the cover, not a plate',
      !coverPage.html.includes('data-placeholder="true"'),
      'a recorded cover whose file no longer exists is worse than a plate'
    )

    // ------------------------------------------- placeholders stay out of proof
    console.log('\nSurfaces that must never show a placeholder')
    const home = await getHtml('/')
    check('homepage renders', home.status === 200, `status ${home.status}`)
    /*
     * The hero and the "Our Work" strip are the site's loudest claims about the
     * portfolio. getProjectsForCarousel filters to owned photography, so the
     * strip may be short but must never be padded.
     */
    const strip = home.html.split('Spaces We&#x27;ve Crafted')[1] ?? ''
    check(
      'the Our Work strip contains no plates',
      !strip.includes('data-placeholder="true"'),
      'the carousel is a portfolio claim; a drawn plate does not belong in it'
    )

    // ------------------------------------------------------- no stock anywhere
    console.log('\nThird-party image hosts')
    const routes = ['/', '/projects', '/about', '/contact']
    const stockHosts = ['images.unsplash.com', 'plus.unsplash.com', 'picsum.photos', 'media.licdn.com']
    for (const route of routes) {
      const { html } = await getHtml(route)
      const found = stockHosts.filter((host) => html.includes(host))
      check(`${route} references no third-party image host`, found.length === 0, found.join(', '))
    }

    const csp = home.headers.get('content-security-policy') || ''
    const imgSrc = (csp.match(/img-src ([^;]*)/) || [])[1] || ''
    check(
      "img-src no longer allows every https host",
      imgSrc.length > 0 && !/\bhttps:(\s|$)/.test(imgSrc),
      `img-src ${imgSrc}`
    )

    // ------------------------------------------------------------- admin flags
    console.log('\nAdmin visibility')
    const admin = await fetch(`${BASE}/admin`, {
      headers: { cookie, 'X-Forwarded-For': nextIp() },
    })
    const adminHtml = await admin.text()
    check('admin page renders', admin.ok, `status ${admin.status}`)
    check(
      'projects awaiting photography are counted',
      adminHtml.includes('awaiting-photography-summary'),
      'without this the only way to audit the swap is to open every project page'
    )
    check('projects awaiting photography are badged', adminHtml.includes('placeholder-badge'))
    check(
      'photographed projects show their image count',
      /\d+ photos?</.test(adminHtml),
      'expected a photo count badge on at least one project'
    )
  } finally {
    for (const slug of created) await deleteRow(slug)
    for (const prefix of uploadedPrefixes) await removeObjects(prefix)
    console.log(`\nremoved ${created.length} fixture project(s)`)
  }

  console.log(`\n${passes} passed, ${failures.length} failed`)
  if (failures.length) {
    console.log(failures.map((f) => `  - ${f}`).join('\n'))
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
