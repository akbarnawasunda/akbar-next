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
check_page "/en" "en" "Akbar Nawasunda"
check_page "/en/music" "en" "Music by Akbar Nawasunda"
check_page "/game/jedag-run" "id" "JEDAG RUN"
check_page "/music/masih-mencintainya-papinka" "id" "Masih Mencintainya"
check_page "/en/music/masih-mencintainya-papinka" "en" "Masih Mencintainya"

check_loading_copy() {
  local path="$1" expected="$2"
  local status
  status="$(curl -sS --max-time 20 -o "$TMP/loading.html" -w '%{http_code}' "$BASE$path")"
  if [[ "$status" == "200" ]] && grep -Fq "$expected" "$TMP/loading.html" \
    && grep -q 'aria-live="polite"' "$TMP/loading.html" \
    && grep -q 'defer="" src="/assets/js/preloader.js"' "$TMP/loading.html"; then
    pass "$path has clear, accessible loading copy and deferred splash script"
  else
    fail "$path loading copy/script missing (status=$status)"
  fi
}

check_loading_copy "/" "Memuat halaman · Produser"
check_loading_copy "/en" "Loading page · Producer"

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

redirect_status="$(curl -sS -o /dev/null -w '%{http_code}' "$BASE/index.html")"
if [[ "$redirect_status" == "308" ]]; then
  pass "/index.html permanently redirects to /"
else
  fail "/index.html expected 308 redirect (status=$redirect_status)"
fi

if [[ "$FAIL" -gt 0 ]]; then
  echo "Next.js smoke checks: $PASS passed, $FAIL failed"
  exit 1
fi
echo "Next.js smoke checks: $PASS passed"
