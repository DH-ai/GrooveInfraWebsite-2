#!/usr/bin/env bash
#
# Integration checks for the SEO and legal surface: robots.txt, sitemap.xml,
# per-page canonicals, Open Graph and Twitter tags, the generated social preview
# and favicons, indexing directives, and the legal pages.
#
# Requires a running server (BASE, default http://127.0.0.1:3000).
#
# Usage: bash scripts/test-seo.sh
set -uo pipefail

BASE="${BASE:-http://127.0.0.1:3000}"
# The canonical host baked into metadataBase. Overridable so the suite can run
# against a preview deployment where NEXT_PUBLIC_SITE_URL differs.
SITE="${SITE:-https://www.grooveinfra.in}"

PASS=0
FAIL=0

check() {
  local label="$1" expected="$2" actual="$3"
  if [[ "$actual" == "$expected" ]]; then
    printf '  PASS  %-54s %s\n' "$label" "$actual"
    PASS=$((PASS + 1))
  else
    printf '  FAIL  %-54s expected=%s actual=%s\n' "$label" "$expected" "$actual"
    FAIL=$((FAIL + 1))
  fi
}

# Caches each page's HTML so a section can make many assertions with one fetch.
declare -A HTML
html_of() {
  local path="$1"
  if [[ -z "${HTML[$path]:-}" ]]; then
    HTML[$path]="$(curl -s "$BASE$path")"
  fi
  printf '%s' "${HTML[$path]}"
}

# meta_content <path> <property-or-name> -> the content attribute value.
# Matches whichever attribute order Next emits.
meta_content() {
  local path="$1" key="$2"
  html_of "$path" |
    grep -oE "<meta [^>]*(property|name)=\"$key\"[^>]*>" |
    head -1 |
    grep -oE 'content="[^"]*"' |
    head -1 |
    sed -E 's/^content="//; s/"$//'
}

canonical_of() {
  html_of "$1" |
    grep -oE '<link rel="canonical" href="[^"]*"' | head -1 |
    sed -E 's/.*href="//; s/"$//'
}

status_of() { curl -s -o /dev/null -w '%{http_code}' "$BASE$1"; }
has()       { grep -qF "$2" <<<"$1" && echo 1 || echo 0; }

echo "=============================================================="
echo "SEO & legal surface"
echo "base: $BASE   canonical host: $SITE"
echo "=============================================================="

echo
echo "-- robots.txt ---------------------------------------------------"
ROBOTS="$(curl -s "$BASE/robots.txt")"
check "served" 200 "$(status_of /robots.txt)"
check "allows the site root" 1 "$(has "$ROBOTS" 'Allow: /')"
check "declares the sitemap absolutely" 1 "$(has "$ROBOTS" "Sitemap: $SITE/sitemap.xml")"
check "disallows /innovation" 1 "$(has "$ROBOTS" 'Disallow: /innovation')"
check "disallows /admin" 1 "$(has "$ROBOTS" 'Disallow: /admin')"
check "disallows /api/" 1 "$(has "$ROBOTS" 'Disallow: /api/')"

echo
echo "-- sitemap.xml --------------------------------------------------"
SITEMAP="$(curl -s "$BASE/sitemap.xml")"
check "served" 200 "$(status_of /sitemap.xml)"
check "is well-formed XML" 0 \
  "$(python3 -c 'import sys,xml.dom.minidom as m; m.parseString(sys.stdin.read())' <<<"$SITEMAP" >/dev/null 2>&1; echo $?)"

for path in / /projects /about /contact /privacy /terms; do
  check "lists $path" 1 "$(has "$SITEMAP" "<loc>$SITE$path</loc>")"
done

# Anything disallowed in robots.txt must not be advertised here, or the two files
# would contradict each other.
for path in /innovation /admin /api; do
  check "omits $path" 0 "$(has "$SITEMAP" "$SITE$path")"
done

# Project pages come from the database, so at least one real slug must appear.
slug_count=$(grep -c "<loc>$SITE/projects/" <<<"$SITEMAP")
check "includes project detail pages" 1 "$([[ "$slug_count" -ge 1 ]] && echo 1 || echo 0)"

echo
echo "-- Per-page canonicals -----------------------------------------"
# A canonical set only on the root layout is inherited by every child page, which
# would make each page claim the homepage as its canonical URL.
check "/ canonical" "$SITE" "$(canonical_of /)"
for path in /about /contact /projects /privacy /terms /innovation; do
  check "$path canonical" "$SITE$path" "$(canonical_of "$path")"
done

first_slug=$(grep -oE "<loc>$SITE/projects/[^<]+</loc>" <<<"$SITEMAP" | head -1 |
  sed -E "s#<loc>$SITE##; s#</loc>##")
check "$first_slug canonical" "$SITE$first_slug" "$(canonical_of "$first_slug")"

echo
echo "-- Open Graph (home) -------------------------------------------"
check "og:type" 'website' "$(meta_content / 'og:type')"
check "og:site_name" 'Groove Infra' "$(meta_content / 'og:site_name')"
check "og:locale" 'en_IN' "$(meta_content / 'og:locale')"
check "og:url is absolute" "$SITE" "$(meta_content / 'og:url')"
check "og:title present" 1 "$([[ -n "$(meta_content / 'og:title')" ]] && echo 1 || echo 0)"
check "og:description present" 1 \
  "$([[ -n "$(meta_content / 'og:description')" ]] && echo 1 || echo 0)"

OG_IMAGE="$(meta_content / 'og:image')"
check "og:image is absolute" 1 "$([[ "$OG_IMAGE" == https://* ]] && echo 1 || echo 0)"
check "og:image width" 1200 "$(meta_content / 'og:image:width')"
check "og:image height" 630 "$(meta_content / 'og:image:height')"
check "og:image has alt text" 1 \
  "$([[ -n "$(meta_content / 'og:image:alt')" ]] && echo 1 || echo 0)"

echo
echo "-- Twitter card (home) -----------------------------------------"
check "twitter:card" 'summary_large_image' "$(meta_content / 'twitter:card')"
check "twitter:title present" 1 \
  "$([[ -n "$(meta_content / 'twitter:title')" ]] && echo 1 || echo 0)"
check "twitter:image present" 1 \
  "$([[ -n "$(meta_content / 'twitter:image')" ]] && echo 1 || echo 0)"

echo
echo "-- Generated images --------------------------------------------"
# Fetch by local path; the tags point at the production host, which is not
# resolvable from here.
og_path="/${OG_IMAGE#"$SITE/"}"
check "social preview served" 200 "$(status_of "$og_path")"
check "  is a PNG" 'image/png' \
  "$(curl -s -o /dev/null -w '%{content_type}' "$BASE$og_path")"
check "  is 1200x630" '1200x630' \
  "$(curl -s "$BASE$og_path" -o /tmp/seo_og.png && python3 -c "
import struct
with open('/tmp/seo_og.png','rb') as f:
    head = f.read(24)
w, h = struct.unpack('>II', head[16:24])
print(f'{w}x{h}')
")"

check "favicon served" 200 "$(status_of /icon)"
check "  is a PNG" 'image/png' "$(curl -s -o /dev/null -w '%{content_type}' "$BASE/icon")"
check "apple icon served" 200 "$(status_of /apple-icon)"

echo
echo "-- Indexing directives -----------------------------------------"
check "home is indexable" 0 \
  "$(has "$(meta_content / 'robots')" 'noindex')"
check "home allows large image previews" 1 \
  "$(has "$(meta_content / 'googlebot')" 'max-image-preview:large')"
# robots.txt alone cannot remove a page already in an index; the tag can.
check "/innovation is noindex" 1 "$(has "$(meta_content /innovation 'robots')" 'noindex')"
check "/admin/login is noindex" 1 "$(has "$(meta_content /admin/login 'robots')" 'noindex')"

echo
echo "-- Structured data ---------------------------------------------"
LD=$(html_of / | python3 -c "
import re, sys
m = re.search(r'<script type=\"application/ld\+json\">(.*?)</script>', sys.stdin.read(), re.S)
print(m.group(1) if m else '')
")
check "JSON-LD block present" 1 "$([[ -n "$LD" ]] && echo 1 || echo 0)"
check "  parses as JSON" 0 \
  "$(python3 -c 'import sys,json; json.loads(sys.stdin.read())' <<<"$LD" >/dev/null 2>&1; echo $?)"
check "  @type" 'GeneralContractor' \
  "$(python3 -c 'import sys,json; print(json.loads(sys.stdin.read()).get("@type",""))' <<<"$LD")"
check "  url is the canonical host" "$SITE" \
  "$(python3 -c 'import sys,json; print(json.loads(sys.stdin.read()).get("url",""))' <<<"$LD")"
check "  has a postal address" 'New Delhi' \
  "$(python3 -c 'import sys,json; print(json.loads(sys.stdin.read()).get("address",{}).get("addressLocality",""))' <<<"$LD")"

echo
echo "-- Legal pages -------------------------------------------------"
check "/privacy served" 200 "$(status_of /privacy)"
check "/terms served" 200 "$(status_of /terms)"
check "privacy has a title" 1 "$(has "$(html_of /privacy)" 'Privacy Policy')"
check "terms has a title" 1 "$(has "$(html_of /terms)" 'Terms &amp; Conditions')"
check "privacy names its processors" 1 "$(has "$(html_of /privacy)" 'Supabase')"
check "privacy states the retention position" 1 \
  "$(has "$(html_of /privacy)" 'How long we keep it')"
check "terms sets governing law" 1 "$(has "$(html_of /terms)" 'laws of India')"
# The copy has not been through legal review, so the pages must say so.
check "privacy is marked draft" 1 "$(has "$(html_of /privacy)" 'pending legal review')"
check "terms is marked draft" 1 "$(has "$(html_of /terms)" 'pending legal review')"
check "footer links to /privacy" 1 "$(has "$(html_of /)" 'href="/privacy"')"
check "footer links to /terms" 1 "$(has "$(html_of /)" 'href="/terms"')"

echo
echo "=============================================================="
printf 'passed: %d   failed: %d\n' "$PASS" "$FAIL"
echo "=============================================================="
[[ "$FAIL" -eq 0 ]]
