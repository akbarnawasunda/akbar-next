#!/usr/bin/env bash
# Production smoke checks for the Next.js migration. All page assertions are
# against raw server HTML; no browser JavaScript is executed.
set -euo pipefail
BASE="${BASE:-http://localhost:4101}"
BASE="${BASE%/}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
PASS=0
FAIL=0

fail() {
  echo "[FAIL] $*"
  FAIL=$((FAIL + 1))
}
pass() {
  echo "[PASS] $*"
  PASS=$((PASS + 1))
}

check_page() {
  local path="$1" lang="$2" title="$3"
  local status html_file
  html_file="$TMP/page.html"
  status="$(curl -sS --max-time 20 -o "$html_file" -w '%{http_code}' "$BASE$path")"
  if [[ "$status" != "200" ]]; then
    fail "$path status=$status"
    return
  fi
  if ! grep -q "<html lang=\"$lang\"" "$html_file"; then
    fail "$path lang=$lang missing"
    return
  fi
  if ! grep -q '<title>' "$html_file" || ! grep -q "$title" "$html_file"; then
    fail "$path title missing ($title)"
    return
  fi
  if [[ "$(grep -o '<title>' "$html_file" | wc -l | tr -d ' ')" != "1" ]]; then
    fail "$path has duplicate titles"
    return
  fi
  if [[ "$(grep -o 'rel=\"canonical\"' "$html_file" | wc -l | tr -d ' ')" != "1" ]]; then
    fail "$path canonical missing or duplicated"
    return
  fi
  if ! grep -q 'property="og:title"' "$html_file" || ! grep -q 'name="twitter:card"' "$html_file"; then
    fail "$path social metadata missing"
    return
  fi
  if ! grep -q 'type="application/ld+json"' "$html_file"; then
    fail "$path server JSON-LD missing"
    return
  fi
  if ! grep -q '<main' "$html_file" || ! grep -q '<h1' "$html_file"; then
    fail "$path has no server-rendered page content"
    return
  fi
  pass "$path raw SSR + locale + metadata + body content"
}

check_page "/" "id" "Akbar Nawasunda"
check_page "/music" "id" "Music by Akbar Nawasunda"
check_page "/visuals" "id" "Videos by Akbar Nawasunda"
check_page "/live" "id" "Live Dates | Akbar Nawasunda"
check_page "/universe" "id" "About the Work | Akbar Nawasunda"
check_page "/about" "id" "About the Artist | Akbar Nawasunda"
check_page "/epk" "id" "Press & Booking EPK | Akbar Nawasunda"
check_page "/inquire" "id" "Inquire | Akbar Nawasunda"
check_page "/licensing" "id" "Music Licensing | Akbar Nawasunda"
check_page "/privacy" "id" "Privacy Policy | Akbar Nawasunda"
check_page "/en" "en" "Akbar Nawasunda"
check_page "/en/music" "en" "Music by Akbar Nawasunda"
check_page "/en/visuals" "en" "Videos by Akbar Nawasunda"
check_page "/en/live" "en" "Live Dates | Akbar Nawasunda"
check_page "/en/universe" "en" "About the Work | Akbar Nawasunda"
check_page "/en/about" "en" "About the Artist | Akbar Nawasunda"
check_page "/en/epk" "en" "Press & Booking EPK | Akbar Nawasunda"
check_page "/en/inquire" "en" "Inquire | Akbar Nawasunda"
check_page "/en/licensing" "en" "Music Licensing | Akbar Nawasunda"
check_page "/en/privacy" "en" "Privacy Policy | Akbar Nawasunda"
check_page "/game/jedag-run" "id" "JEDAG RUN"
check_page "/en/game/jedag-run" "en" "JEDAG RUN"
check_page "/music/masih-mencintainya-papinka" "id" "Masih Mencintainya"
check_page "/en/music/masih-mencintainya-papinka" "en" "Masih Mencintainya"

check_loading_copy() {
  local path="$1" expected="$2"
  local status
  status="$(curl -sS --max-time 20 -o "$TMP/loading.html" -w '%{http_code}' "$BASE$path")"
  if [[ "$status" == "200" ]] && grep -Fq "$expected" "$TMP/loading.html" \
    && grep -q 'aria-live="polite"' "$TMP/loading.html" \
    && grep -Fq '<link rel="preload" href="/assets/js/preloader.js" as="script"' "$TMP/loading.html" \
    && grep -Fq 'push(["/assets/js/preloader.js",{}])' "$TMP/loading.html"; then
    pass "$path has accessible loading copy and pre-hydration splash script"
  else
    fail "$path loading copy/script missing (status=$status)"
  fi
}

check_loading_copy "/" "Memuat halaman · Produser"
check_loading_copy "/en" "Loading page · Producer"

check_brand_media() {
  local path="$1" fallback="$2" status fallback_status
  : > "$TMP/media.headers"
  status="$(curl -sS --max-time 20 -D "$TMP/media.headers" -o /dev/null -w '%{http_code}' "$BASE$path")"
  if [[ "$status" == "200" ]] && grep -qi '^content-type: image/' "$TMP/media.headers"; then
    pass "$path serves an image from the upstream media source"
    return
  fi
  if [[ "$status" == "302" ]] && grep -Fqi "$fallback" "$TMP/media.headers"; then
    fallback_status="$(curl -sS --max-time 20 -o /dev/null -w '%{http_code}' "$BASE$fallback")"
    if [[ "$fallback_status" == "200" ]]; then
      pass "$path falls back to its local image when upstream media is unavailable"
      return
    fi
  fi
  fail "$path must serve an image or redirect to the local fallback (status=$status)"
}

check_brand_media "/media/portrait/neon-portrait.jpg" "/assets/akbar-nawasunda-official-portrait.webp"
check_brand_media "/media/portrait/kx07-portrait.jpg" "/assets/akbar-nawasunda-official-portrait.webp"
check_brand_media "/media/portrait/official-portrait.jpg" "/assets/akbar-nawasunda-official-portrait.webp"
check_brand_media "/media/brand/rmx-mark.jpg" "/assets/akbar-rmx-mark.webp"

unknown_media_status="$(curl -sS --max-time 20 -o /dev/null -w '%{http_code}' "$BASE/media/unknown.jpg")"
if [[ "$unknown_media_status" == "404" ]]; then
  pass "unknown media paths are denied"
else
  fail "unknown media path expected 404 (status=$unknown_media_status)"
fi

check_legacy_redirect() {
  local path="$1" destination="$2" status location
  : > "$TMP/redirect.headers"
  status="$(curl -sS --max-time 20 -D "$TMP/redirect.headers" -o /dev/null -w '%{http_code}' "$BASE$path")"
  location="$(awk 'tolower($1) == "location:" { sub(/\r$/, "", $2); print $2; exit }' "$TMP/redirect.headers")"
  if [[ "$status" == "308" && "$location" == *"$destination" ]]; then
    pass "$path permanently redirects to $destination"
  else
    fail "$path expected permanent redirect to $destination (status=$status location=$location)"
  fi
}

check_legacy_redirect "/legacy" "/"
check_legacy_redirect "/legacy/index.html" "/"
check_legacy_redirect "/legacy/epk.html" "/epk"
check_legacy_redirect "/legacy/privacy.html" "/privacy"
check_legacy_redirect "/legacy/404.html" "/404"
check_legacy_redirect "/api/brand/rmx-mark" "/media/brand/rmx-mark.jpg"

for path in /legacy/style.css /assets/js/app.js /assets/js/audio.js; do
  status="$(curl -sS --max-time 20 -o /dev/null -w '%{http_code}' "$BASE$path")"
  if [[ "$status" == "404" ]]; then
    pass "$path no longer serves a parallel legacy app asset"
  else
    fail "$path should not serve a legacy app asset (status=$status)"
  fi
done

for path in /assets/js/preloader.js /sw.js; do
  status="$(curl -sS --max-time 20 -o /dev/null -w '%{http_code}' "$BASE$path")"
  if [[ "$status" == "200" ]]; then
    pass "$path is available to the active Next.js site"
  else
    fail "$path is required by Next.js (status=$status)"
  fi
done

for path in /studio /admin /assets; do
  status="$(curl -sS --max-time 20 -o "$TMP/private.html" -w '%{http_code}' "$BASE$path")"
  if [[ "$status" == "200" ]] && grep -qi 'name="robots" content="noindex' "$TMP/private.html"; then
    pass "$path is noindex"
  else
    fail "$path expected 200 + robots noindex (status=$status)"
  fi
done

status="$(curl -sS --max-time 20 -o "$TMP/404.html" -w '%{http_code}' "$BASE/route-that-does-not-exist")"
if [[ "$status" == "404" ]] && grep -qi 'name="robots" content="noindex' "$TMP/404.html" && grep -q '<main' "$TMP/404.html" && grep -q '<h1' "$TMP/404.html"; then
  pass "unknown route returns a rendered, index-safe HTTP 404"
else
  fail "unknown route expected rendered 404 + noindex (status=$status)"
fi

for path in /music/nonexistent-release /en/music/nonexistent-release; do
  status="$(curl -sS --max-time 20 -o "$TMP/missing-release.html" -w '%{http_code}' "$BASE$path")"
  if [[ "$status" == "404" ]] && grep -qi 'name="robots" content="noindex' "$TMP/missing-release.html"; then
    pass "$path returns an index-safe HTTP 404"
  else
    fail "$path expected 404 + noindex (status=$status)"
  fi
done

trpc_status="$(curl -sS --max-time 20 -o "$TMP/trpc.json" -w '%{http_code}' "$BASE/api/trpc/system.health?input=%7B%22json%22%3A%7B%22timestamp%22%3A1%7D%7D")"
if [[ "$trpc_status" == "200" ]] && grep -q '"ok":true' "$TMP/trpc.json"; then
  pass "Next tRPC route handler responds"
else
  fail "tRPC health expected 200 + ok=true (status=$trpc_status)"
fi

for path in /index.html /privacy.html; do
  redirect_status="$(curl -sS -o /dev/null -w '%{http_code}' "$BASE$path")"
  if [[ "$redirect_status" == "308" ]]; then
    pass "$path permanently redirects to its canonical route"
  else
    fail "$path expected 308 redirect (status=$redirect_status)"
  fi
done

if [[ "$FAIL" -gt 0 ]]; then
  echo "Next.js smoke checks: $PASS passed, $FAIL failed"
  exit 1
fi
echo "Next.js smoke checks: $PASS passed"
