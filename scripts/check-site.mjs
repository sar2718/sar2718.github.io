import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function normalizeText(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

async function hasExactPath(relativePath) {
  const segments = relativePath.split("/").filter(Boolean);
  let current = root;

  for (const segment of segments) {
    const entries = await readdir(current);
    if (!entries.includes(segment)) return false;
    current = path.join(current, segment);
  }

  try {
    await access(current);
    return true;
  } catch {
    return false;
  }
}

function extractAttribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? null;
}

function imageDimensions(buffer) {
  if (buffer.subarray(1, 4).toString("ascii") === "PNG") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    const startOfFrameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

    while (offset + 8 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }

      const marker = buffer[offset + 1];
      offset += 2;
      if (marker === 0xd8 || marker === 0xd9) continue;

      const blockLength = buffer.readUInt16BE(offset);
      if (startOfFrameMarkers.has(marker)) {
        return { height: buffer.readUInt16BE(offset + 3), width: buffer.readUInt16BE(offset + 5) };
      }
      offset += blockLength;
    }
  }

  return null;
}

async function validateDocument(filename) {
  const html = await readFile(path.join(root, filename), "utf8");
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  check(duplicateIds.length === 0, `${filename}: duplicate ids: ${[...new Set(duplicateIds)].join(", ")}`);

  for (const fragment of [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1])) {
    check(ids.includes(fragment), `${filename}: missing fragment target #${fragment}`);
  }

  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const value = decodeHtml(match[1]);
    if (/^(?:https?:|mailto:|tel:|data:|#)/.test(value)) continue;

    const cleanPath = value.split(/[?#]/, 1)[0];
    const relativePath = cleanPath === "/" ? "index.html" : cleanPath.replace(/^\//, "");
    check(await hasExactPath(relativePath), `${filename}: missing local file or wrong path case: ${relativePath}`);
  }

  for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    const rel = (extractAttribute(match[0], "rel") ?? "").split(/\s+/);
    check(rel.includes("noopener") && rel.includes("noreferrer"), `${filename}: target=_blank link must use noopener noreferrer`);
  }

  for (const match of html.matchAll(/<(?:a|img|link|script)\b[^>]*(?:href|src)="[^"]*&[^"]*"[^>]*>/g)) {
    check(!/(?:href|src)="[^"]*&(?!amp;)/.test(match[0]), `${filename}: URL attributes must escape & as &amp;`);
  }

  return html;
}

const indexHtml = await validateDocument("index.html");
const notFoundHtml = await validateDocument("404.html");
const scriptSource = await readFile(path.join(root, "script.js"), "utf8");
const stylesSource = await readFile(path.join(root, "styles.css"), "utf8");
const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
const robots = await readFile(path.join(root, "robots.txt"), "utf8");

const structuralCss = stylesSource
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, "");
let cssDepth = 0;
for (const character of structuralCss) {
  if (character === "{") cssDepth += 1;
  if (character === "}") cssDepth -= 1;
  check(cssDepth >= 0, "styles.css: unexpected closing brace");
}
check(cssDepth === 0, "styles.css: unbalanced braces");

const dictionaryEnd = scriptSource.indexOf("const languageButtons");
check(dictionaryEnd > 0, "script.js: translation dictionary boundary was not found");
const dictionarySource = scriptSource.slice(0, dictionaryEnd).replace("const translations =", "globalThis.translations =");
const dictionaryContext = {};
vm.runInNewContext(dictionarySource, dictionaryContext);
const translations = dictionaryContext.translations;
const englishKeys = Object.keys(translations.en).sort();
const russianKeys = Object.keys(translations.ru).sort();
check(JSON.stringify(englishKeys) === JSON.stringify(russianKeys), "script.js: EN and RU translation keys differ");

const usedTranslationKeys = [...indexHtml.matchAll(/data-i18n(?:-aria-label|-alt)?="([^"]+)"/g)].map((match) => match[1]);
for (const key of usedTranslationKeys) {
  check(Object.hasOwn(translations.en, key), `index.html: missing EN translation for ${key}`);
  check(Object.hasOwn(translations.ru, key), `index.html: missing RU translation for ${key}`);
}

for (const match of indexHtml.matchAll(/<([a-z][a-z0-9]*)\b[^>]*data-i18n="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/gi)) {
  const [, , key, content] = match;
  check(normalizeText(content) === translations.en[key], `index.html: English fallback differs from translations.en.${key}`);
}

for (const match of indexHtml.matchAll(/<[a-z][a-z0-9]*\b[^>]*data-i18n-aria-label="([^"]+)"[^>]*>/gi)) {
  const key = match[1];
  check(decodeHtml(extractAttribute(match[0], "aria-label") ?? "") === translations.en[key], `index.html: aria-label fallback differs from translations.en.${key}`);
}

for (const match of indexHtml.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
  try {
    JSON.parse(match[1]);
  } catch (error) {
    failures.push(`index.html: invalid JSON-LD: ${error.message}`);
  }
}

const canonical = indexHtml.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
const openGraphUrl = indexHtml.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
check(Boolean(canonical), "index.html: canonical URL is missing");
check(canonical === openGraphUrl, "index.html: canonical and og:url differ");
check(sitemap.includes(`<loc>${canonical}</loc>`), "sitemap.xml: canonical URL is missing");
check(robots.includes(`Sitemap: ${new URL("sitemap.xml", canonical).href}`), "robots.txt: sitemap URL differs from canonical origin");

const socialUrl = indexHtml.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
const socialWidth = Number(indexHtml.match(/<meta property="og:image:width" content="(\d+)"/)?.[1]);
const socialHeight = Number(indexHtml.match(/<meta property="og:image:height" content="(\d+)"/)?.[1]);
check(Boolean(socialUrl), "index.html: og:image is missing");

if (socialUrl) {
  const socialPath = new URL(socialUrl).pathname.replace(/^\//, "");
  check(await hasExactPath(socialPath), `index.html: missing social image ${socialPath}`);
  if (await hasExactPath(socialPath)) {
    const socialBuffer = await readFile(path.join(root, socialPath));
    const dimensions = imageDimensions(socialBuffer);
    check(Boolean(dimensions), `${socialPath}: unsupported image format`);
    check(dimensions?.width === socialWidth && dimensions?.height === socialHeight, `${socialPath}: dimensions do not match Open Graph metadata`);
    check(socialBuffer.length <= 500_000, `${socialPath}: social image exceeds 500 KB`);
  }
}

check(!/<img\b[^>]*src="https?:/i.test(indexHtml), "index.html: runtime images must be local");
check(!/<link\b[^>]*rel="icon"[^>]*href="https?:/i.test(indexHtml), "index.html: favicon must be local");
check(!indexHtml.includes("classList.add(\"js\")"), "index.html: do not enable JS-only hiding before script readiness");
check(stylesSource.includes(".nav-ready .site-nav"), "styles.css: mobile navigation readiness fallback is missing");
check(stylesSource.includes(".reveal-ready .reveal"), "styles.css: reveal readiness fallback is missing");
check(scriptSource.includes('(max-width: 900px)') && stylesSource.includes("@media (max-width: 900px)"), "responsive navigation breakpoints differ between CSS and JS");
check(notFoundHtml.includes('lang="ru"'), "404.html: Russian fallback is missing");

for (const filename of [
  "index.html",
  "404.html",
  "styles.css",
  "script.js",
  "robots.txt",
  "sitemap.xml",
  "README.md",
  "package.json",
  ".gitattributes",
  ".gitignore",
  ".github/workflows/site-checks.yml",
  "scripts/check-site.mjs",
  "scripts/serve.mjs"
]) {
  const content = await readFile(path.join(root, filename), "utf8");
  check(content.endsWith("\n"), `${filename}: file must end with a newline`);
  check(!/[ \t]+$/m.test(content), `${filename}: trailing whitespace found`);
}

const socialStats = await stat(path.join(root, new URL(socialUrl).pathname.replace(/^\//, "")));

if (failures.length > 0) {
  console.error(`Site checks failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Site checks passed: ${usedTranslationKeys.length} translated fields, social image ${(socialStats.size / 1024).toFixed(1)} KB.`);
}
