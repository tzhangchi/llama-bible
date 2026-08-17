#!/usr/bin/env node

import { writeFile } from "node:fs/promises";

const sites = [
  ["LlamaGen", "https://llamagen.ai/"],
  ["Produce.so", "https://produce.so/"],
  ["Videotok", "https://videotok.app/"],
  ["Aura AI", "https://auraai.app/"],
  ["AI Designer", "https://www.aidesigner.ai/"],
  ["Make Design", "https://make.design/"],
  ["Laper", "https://laper.ai/"],
  ["ComicsAI", "https://comicsai.org/"],
  ["Vid.AI", "https://vid.ai/"],
  ["GojiberryAI", "https://gojiberry.ai/"],
  ["Cometly", "https://www.cometly.com/"],
  ["Nutshellapp", "https://nutshellapp.com/"],
  ["GenVideo AI", "https://genvideo.app/"],
];

const outputFlagIndex = process.argv.indexOf("--out");
const outputPath =
  outputFlagIndex >= 0 ? process.argv[outputFlagIndex + 1] : undefined;

const USER_AGENT =
  "Mozilla/5.0 (compatible; LlamaGenSEOResearchBot/1.0; +https://llamagen.ai/)";
const FETCH_TIMEOUT_MS = 15_000;
const MAX_SITEMAPS = 40;
const MAX_SITEMAP_URLS = 20_000;
const MAX_RESPONSE_BYTES = 10_000_000;
const LOCALE_SEGMENTS = new Set([
  "ar",
  "cs",
  "da",
  "de",
  "el",
  "en",
  "en-au",
  "en-ca",
  "en-gb",
  "en-in",
  "es",
  "fr",
  "he",
  "hi",
  "hu",
  "id",
  "it",
  "ja",
  "ko",
  "nb",
  "nl",
  "pl",
  "pt",
  "pt-br",
  "ro",
  "ru",
  "sv",
  "th",
  "tr",
  "uk",
  "vi",
  "zh",
  "zh-cn",
  "zh-tw",
]);

function compactWhitespace(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function decodeEntities(value = "") {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripHtml(value = "") {
  return compactWhitespace(
    decodeEntities(
      value
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " "),
    ),
  );
}

function firstMatch(html, pattern) {
  const match = pattern.exec(html);
  return match ? compactWhitespace(decodeEntities(match[1])) : null;
}

function extractJsonLdTypes(html) {
  const types = new Set();
  const scriptPattern =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  function visit(value) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    const currentType = value["@type"];
    if (Array.isArray(currentType)) currentType.forEach((type) => types.add(type));
    else if (typeof currentType === "string") types.add(currentType);
    Object.values(value).forEach(visit);
  }

  while ((match = scriptPattern.exec(html))) {
    try {
      visit(JSON.parse(decodeEntities(match[1].trim())));
    } catch {
      // Invalid JSON-LD is reported separately by omission from the parsed types.
    }
  }

  return [...types].sort();
}

function extractLinks(html, baseUrl) {
  const links = [];
  const anchorPattern = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>/gi;
  let match;
  while ((match = anchorPattern.exec(html))) {
    try {
      links.push(new URL(decodeEntities(match[1]), baseUrl));
    } catch {
      // Ignore malformed and non-URL href values.
    }
  }
  return links;
}

function normalizeFamily(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  if (!parts.length) return "/";

  const normalized =
    LOCALE_SEGMENTS.has(parts[0].toLowerCase()) && parts.length > 1
      ? parts.slice(1)
      : parts;
  return `/${normalized[0] ?? ""}`;
}

function summarizeUrlFamilies(urls) {
  const counts = new Map();
  const localeCounts = new Map();

  for (const value of urls) {
    try {
      const url = new URL(value);
      const family = normalizeFamily(url.pathname);
      counts.set(family, (counts.get(family) ?? 0) + 1);

      const firstPart = url.pathname.split("/").filter(Boolean)[0];
      if (firstPart && LOCALE_SEGMENTS.has(firstPart.toLowerCase())) {
        const locale = firstPart.toLowerCase();
        localeCounts.set(locale, (localeCounts.get(locale) ?? 0) + 1);
      }
    } catch {
      // Ignore malformed sitemap URLs.
    }
  }

  return {
    pageFamilies: [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([family, count]) => ({ family, count })),
    locales: [...localeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([locale, count]) => ({ locale, count })),
  };
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        accept: "text/html,application/xml,text/xml,text/plain;q=0.9,*/*;q=0.8",
        "user-agent": USER_AGENT,
      },
      signal: controller.signal,
    });
    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      finalUrl: response.url,
      contentType: response.headers.get("content-type"),
      text: text.slice(0, MAX_RESPONSE_BYTES),
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      finalUrl: url,
      contentType: null,
      text: "",
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function crawlSitemaps(homepageUrl, robotsText) {
  const origin = new URL(homepageUrl).origin;
  const robotsSitemaps = [...robotsText.matchAll(/^sitemap:\s*(.+)$/gim)].map(
    (match) => match[1].trim(),
  );
  const seeds = [
    ...robotsSitemaps,
    new URL("/sitemap.xml", origin).href,
    new URL("/sitemap_index.xml", origin).href,
  ];

  const queue = [...new Set(seeds)];
  const seen = new Set();
  const pageUrls = new Set();
  const sitemapResults = [];

  while (
    queue.length &&
    seen.size < MAX_SITEMAPS &&
    pageUrls.size < MAX_SITEMAP_URLS
  ) {
    const sitemapUrl = queue.shift();
    if (!sitemapUrl || seen.has(sitemapUrl)) continue;
    seen.add(sitemapUrl);

    const response = await fetchText(sitemapUrl);
    const locs = [...response.text.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map(
      (match) => decodeEntities(match[1].trim()),
    );
    sitemapResults.push({
      url: sitemapUrl,
      status: response.status,
      finalUrl: response.finalUrl,
      locCount: locs.length,
    });

    for (const loc of locs) {
      let parsed;
      try {
        parsed = new URL(loc);
      } catch {
        continue;
      }
      const looksLikeSitemap =
        /\.xml(?:\.gz)?$/i.test(parsed.pathname) ||
        /sitemap/i.test(parsed.pathname) && locs.every((item) => /\.xml/i.test(item));
      if (looksLikeSitemap) {
        if (!seen.has(parsed.href) && queue.length < MAX_SITEMAPS * 2) {
          queue.push(parsed.href);
        }
      } else if (pageUrls.size < MAX_SITEMAP_URLS) {
        pageUrls.add(parsed.href);
      }
    }
  }

  return {
    robotsSitemaps,
    sitemapResults,
    urls: [...pageUrls],
    truncated:
      seen.size >= MAX_SITEMAPS || pageUrls.size >= MAX_SITEMAP_URLS,
  };
}

async function crawlSite([name, homepage]) {
  const homepageResponse = await fetchText(homepage);
  const html = homepageResponse.text;
  const finalHomepage = homepageResponse.finalUrl || homepage;
  const finalOrigin = new URL(finalHomepage).origin;

  const robotsUrl = new URL("/robots.txt", finalOrigin).href;
  const robots = await fetchText(robotsUrl);
  const sitemapData = await crawlSitemaps(finalHomepage, robots.text);
  const links = extractLinks(html, finalHomepage);
  const internalLinks = links.filter(
    (link) => link.hostname === new URL(finalHomepage).hostname,
  );
  const externalLinks = links.filter(
    (link) => link.hostname !== new URL(finalHomepage).hostname,
  );
  const externalHosts = [...new Set(externalLinks.map((link) => link.hostname))]
    .sort()
    .slice(0, 40);

  const h1s = [
    ...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi),
  ].map((match) => stripHtml(match[1]));
  const title = firstMatch(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const description =
    firstMatch(
      html,
      /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i,
    ) ??
    firstMatch(
      html,
      /<meta\b[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i,
    );
  const canonical =
    firstMatch(
      html,
      /<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i,
    ) ??
    firstMatch(
      html,
      /<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i,
    );

  const llms = await fetchText(new URL("/llms.txt", finalOrigin).href);
  const aiTxt = await fetchText(new URL("/ai.txt", finalOrigin).href);
  const urlSummary = summarizeUrlFamilies(sitemapData.urls);

  return {
    name,
    requestedHomepage: homepage,
    homepage: {
      status: homepageResponse.status,
      finalUrl: finalHomepage,
      title,
      description,
      canonical,
      h1s: h1s.slice(0, 10),
      h1Count: h1s.length,
      jsonLdTypes: extractJsonLdTypes(html),
      internalLinkCount: internalLinks.length,
      uniqueInternalLinkCount: new Set(internalLinks.map((link) => link.href)).size,
      externalLinkCount: externalLinks.length,
      externalHosts,
    },
    robots: {
      url: robotsUrl,
      status: robots.status,
      sitemapDirectives: sitemapData.robotsSitemaps,
    },
    sitemap: {
      discoveredSitemaps: sitemapData.sitemapResults,
      urlCount: sitemapData.urls.length,
      truncated: sitemapData.truncated,
      pageFamilies: urlSummary.pageFamilies,
      locales: urlSummary.locales,
      samples: sitemapData.urls.slice(0, 20),
    },
    aiDiscovery: {
      llmsTxtStatus: llms.status,
      llmsTxtBytes: llms.text.length,
      aiTxtStatus: aiTxt.status,
      aiTxtBytes: aiTxt.text.length,
    },
  };
}

const startedAt = new Date().toISOString();
const results = [];
for (const site of sites) {
  results.push(await crawlSite(site));
}

const report = {
  generatedAt: new Date().toISOString(),
  startedAt,
  methodology: {
    userAgent: USER_AGENT,
    maxSitemapsPerSite: MAX_SITEMAPS,
    maxSitemapUrlsPerSite: MAX_SITEMAP_URLS,
    note: "Public, unauthenticated crawl of homepage, robots.txt, sitemap files, llms.txt, and ai.txt. Homepage outbound links are not inbound backlink data.",
  },
  results,
};

const serialized = `${JSON.stringify(report, null, 2)}\n`;
if (outputPath) {
  await writeFile(outputPath, serialized, "utf8");
  console.log(`Wrote ${outputPath}`);
} else {
  process.stdout.write(serialized);
}
