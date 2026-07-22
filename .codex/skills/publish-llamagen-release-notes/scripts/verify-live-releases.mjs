#!/usr/bin/env node

const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/ai-comic-generator-comic/obcddklbppihbimomfdlafpefpdbhdik";
const PROHIBITED_PLATFORM_PATTERN =
  /\b(iOS|iPhone|iPad|Android app|mobile app|mobile studio|mobile creation|mobile comic|native app|App Store|TestFlight)\b/i;

function parseArgs(argv) {
  const args = new Map();
  for (const raw of argv) {
    if (!raw.startsWith("--")) continue;
    const separator = raw.indexOf("=");
    if (separator < 0) {
      args.set(raw.slice(2), true);
      continue;
    }
    args.set(raw.slice(2, separator), raw.slice(separator + 1));
  }
  return args;
}

function stringArg(args, key, fallback = "") {
  const value = args.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function numberArg(args, key, fallback) {
  const value = Number(stringArg(args, key));
  return Number.isFinite(value) ? value : fallback;
}

function splitList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function markdownImageUrls(markdown) {
  return Array.from(
    String(markdown || "").matchAll(/!\[[^\]]*\]\((https:\/\/[^)\s]+)(?:\s+["'][^)]*["'])?\)/g),
    (match) => match[1],
  );
}

async function fetchText(url) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
    redirect: "follow",
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}`);
  }
  return response.text();
}

async function fetchJson(url) {
  return JSON.parse(await fetchText(url));
}

function releaseRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  throw new Error("Release list did not contain an array in data or items.");
}

function releaseText(row) {
  return [row.title, row.description, ...(row.features || []), row.markdown]
    .filter(Boolean)
    .join("\n");
}

function inspectRelease(row, expectedBodyImages, cdnBase) {
  const bodyImages = [...new Set(markdownImageUrls(row.markdown))];
  const featureImages = [...new Set(Object.values(row.featureImages || {}).filter(Boolean))];
  const allImages = [...new Set([row.cover, ...bodyImages].filter(Boolean))];
  const issues = [];

  if (!String(row.cover || "").startsWith(`${cdnBase}/`)) {
    issues.push("cover is missing or is not hosted on the configured CDN");
  }
  if (bodyImages.length < expectedBodyImages) {
    issues.push(`expected at least ${expectedBodyImages} body images, found ${bodyImages.length}`);
  }
  if (allImages.length < expectedBodyImages + 1) {
    issues.push(`expected at least ${expectedBodyImages + 1} distinct total images, found ${allImages.length}`);
  }
  if (featureImages.length < expectedBodyImages) {
    issues.push(`expected at least ${expectedBodyImages} featureImages, found ${featureImages.length}`);
  }
  if ([...bodyImages, ...featureImages].some((url) => !String(url).startsWith(`${cdnBase}/`))) {
    issues.push("one or more body images are not hosted on the configured CDN");
  }

  const bodySet = new Set(bodyImages);
  const featureSet = new Set(featureImages);
  if (bodyImages.some((url) => !featureSet.has(url)) || featureImages.some((url) => !bodySet.has(url))) {
    issues.push("Markdown body images and featureImages do not map one-to-one");
  }

  const copy = releaseText(row);
  if (PROHIBITED_PLATFORM_PATTERN.test(copy)) {
    issues.push("release contains a prohibited app-platform claim");
  }
  if (/\bChrome\b/i.test(copy) && !copy.includes(CHROME_STORE_URL)) {
    issues.push("Chrome is mentioned without the required Chrome Web Store URL");
  }

  return { bodyImages, featureImages, allImages, issues };
}

function releasePageBase(siteBase, locale) {
  return locale === "en" ? `${siteBase}/releases` : `${siteBase}/${locale}/releases`;
}

async function verifyPage(row, inspection, siteBase, locale) {
  const url = `${releasePageBase(siteBase, locale)}/${row.date}`;
  const html = await fetchText(url);
  const expectedImages = [row.cover, ...inspection.bodyImages];
  const issues = [];

  if (!html.includes(String(row.version))) issues.push("version is missing from page HTML");
  if (!html.includes(String(row.date))) issues.push("date is missing from page HTML");
  for (const imageUrl of expectedImages) {
    if (!html.includes(imageUrl)) issues.push(`page HTML is missing image ${imageUrl}`);
  }

  return { url, issues };
}

async function verifyHomepage(latest, siteBase, locale) {
  const url = releasePageBase(siteBase, locale);
  let html = await fetchText(url);
  if (!html.includes(String(latest.version)) || !html.includes(String(latest.date))) {
    await new Promise((resolve) => setTimeout(resolve, 1_500));
    html = await fetchText(url);
  }
  const issues = [];
  if (!html.includes(String(latest.version))) issues.push(`latest version ${latest.version} is missing`);
  if (!html.includes(String(latest.date))) issues.push(`latest date ${latest.date} is missing`);
  if (!html.includes(String(latest.cover))) issues.push("latest cover is missing");
  return { url, issues };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dates = splitList(stringArg(args, "dates"));
  if (dates.length === 0) {
    throw new Error("Pass one or more release dates with --dates=YYYY-MM-DD,YYYY-MM-DD.");
  }

  const locale = stringArg(args, "locale", "en");
  const expectedBodyImages = Math.max(3, numberArg(args, "expected-body-images", 3));
  const cdnBase = stringArg(args, "cdn-base", "https://cdn.llamagen.ai").replace(/\/$/, "");
  const siteBase = stringArg(args, "site-base", "https://llamagen.ai").replace(/\/$/, "");
  const listUrl = `${cdnBase}/cms-data/${locale}/releases.json?verify=${Date.now()}`;
  const rows = releaseRows(await fetchJson(listUrl));
  const failures = [];

  for (const date of dates) {
    const row = rows.find((item) => String(item.date).slice(0, 10) === date);
    if (!row) {
      failures.push(`${date}: missing from ${locale} release list`);
      continue;
    }

    const inspection = inspectRelease(row, expectedBodyImages, cdnBase);
    const page = await verifyPage(row, inspection, siteBase, locale);
    const issues = [...inspection.issues, ...page.issues];
    console.log(
      `${date} v${row.version}: cover=1 body=${inspection.bodyImages.length} total=${inspection.allImages.length} featureImages=${inspection.featureImages.length} page=${issues.length === 0 ? "ok" : "failed"}`,
    );
    failures.push(...issues.map((issue) => `${date}: ${issue}`));
  }

  const latest = [...rows]
    .filter((row) => row?.date)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
  if (!latest) {
    failures.push("release list has no latest row");
  } else {
    const homepage = await verifyHomepage(latest, siteBase, locale);
    failures.push(...homepage.issues.map((issue) => `homepage: ${issue}`));
    console.log(`homepage: latest=v${latest.version} ${latest.date} ${homepage.issues.length === 0 ? "ok" : "failed"}`);
  }

  if (failures.length > 0) {
    console.error("\nVerification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log(`\nVerified ${dates.length} live release(s) for locale ${locale}.`);
}

main().catch((error) => {
  console.error(`Verification failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
