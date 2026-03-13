import fs from "node:fs";
import path from "node:path";

const inputPath = path.join("src", "data", "cases.tsv");
const outputPath = path.join("src", "data", "cases.generated.ts");
const defaultImagePlaceholder = "https://placehold.co/640x360";

const requiredHeaders = [
  "title",
  "subtitle",
  "roles",
  "copy",
  "youtubeId",
  "href",
  "mediaKind",
  "mediaSrc",
  "mediaAlt",
  "mediaPoster",
  "stripSources",
];

function fail(message) {
  console.error(`cases.tsv: ${message}`);
  process.exit(1);
}

function ensure(condition, message) {
  if (!condition) fail(message);
}

function parseOptionalBoolean(value, label) {
  if (!value) return undefined;
  if (/^(true|1|yes|y)$/i.test(value)) return true;
  if (/^(false|0|no|n)$/i.test(value)) return false;
  fail(`${label} must be true/false.`);
}

function parseOptionalNumber(value, label) {
  if (!value) return undefined;
  const parsed = Number(value);
  ensure(Number.isFinite(parsed), `${label} must be a valid number.`);
  return parsed;
}

function normalizeHeaderName(name) {
  return name.trim().replace(/^\uFEFF/, "").toLowerCase();
}

const raw = fs.readFileSync(inputPath, "utf8");
const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);

ensure(lines.length > 1, "no data rows found.");

const headers = lines[0].split("\t").map((header) => normalizeHeaderName(header));
const headerIndex = Object.fromEntries(headers.map((header, index) => [header, index]));
const aliases = {
  id: ["id_slug", "slugid", "slug_id", "slug", "id"],
  seriesId: ["seriesid", "series_id", "series"],
  sourceHref: ["sourcehref", "source_href"],
  showOnHome: ["showonhome", "show_on_home", "show"],
  homeOrder: ["homeorder", "home_order"],
  videoOrder: ["videoorder", "video_order"],
  publishedAt: ["publishedat", "published_at"],
  vertical: ["vertical", "isvertical", "is_vertical"],
};

const missingHeaders = requiredHeaders.filter(
  (header) => headerIndex[normalizeHeaderName(header)] === undefined,
);
ensure(missingHeaders.length === 0, `missing headers: ${missingHeaders.join(", ")}`);
ensure(
  aliases.id.some((name) => headerIndex[name] !== undefined),
  "missing id column: expected id_slug (or legacy id).",
);

const seenIds = new Set();
const cases = [];

for (let i = 1; i < lines.length; i += 1) {
  const lineNumber = i + 1;
  const cells = lines[i].split("\t", -1);
  const get = (name) => {
    const index = headerIndex[normalizeHeaderName(name)];
    return index === undefined ? "" : (cells[index] ?? "").trim();
  };
  const getAny = (names) => {
    for (const name of names) {
      const value = get(name);
      if (value) return value;
    }
    return "";
  };

  const id = getAny(aliases.id);
  const title = get("title");
  const subtitle = get("subtitle");
  const roles = get("roles");
  const copy = get("copy");
  const youtubeId = get("youtubeId");
  const hrefRaw = get("href");
  const mediaKind = get("mediaKind");
  const mediaSrcRaw = get("mediaSrc");
  const mediaAltRaw = get("mediaAlt");
  const mediaPoster = get("mediaPoster");
  const stripSourcesRaw = get("stripSources");
  const seriesId = getAny(aliases.seriesId);
  const sourceHref = getAny(aliases.sourceHref);
  const showOnHome = parseOptionalBoolean(
    getAny(aliases.showOnHome),
    `line ${lineNumber}: showOnHome`,
  );
  const homeOrder = parseOptionalNumber(
    getAny(aliases.homeOrder),
    `line ${lineNumber}: homeOrder`,
  );
  const videoOrder = parseOptionalNumber(
    getAny(aliases.videoOrder),
    `line ${lineNumber}: videoOrder`,
  );
  const publishedAt = getAny(aliases.publishedAt);
  const vertical = parseOptionalBoolean(
    getAny(aliases.vertical),
    `line ${lineNumber}: vertical`,
  );

  ensure(id, `line ${lineNumber}: id is required.`);
  ensure(!seenIds.has(id), `line ${lineNumber}: duplicate id "${id}".`);
  seenIds.add(id);

  ensure(title, `line ${lineNumber}: title is required.`);
  ensure(roles, `line ${lineNumber}: roles is required.`);
  ensure(mediaKind, `line ${lineNumber}: mediaKind is required.`);
  if (youtubeId) {
    ensure(
      /^[A-Za-z0-9_-]{11}$/.test(youtubeId),
      `line ${lineNumber}: youtubeId must be 11 URL-safe characters.`,
    );
  }

  if (publishedAt) {
    ensure(
      !Number.isNaN(Date.parse(publishedAt)),
      `line ${lineNumber}: publishedAt must be an ISO-compatible date.`,
    );
  }

  const href = hrefRaw || (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : "");

  let media;
  if (mediaKind === "image") {
    const src = mediaSrcRaw || (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : defaultImagePlaceholder);
    const alt = mediaAltRaw || `${title} thumbnail`;
    media = { kind: "image", src, alt };
  } else if (mediaKind === "video") {
    ensure(mediaSrcRaw, `line ${lineNumber}: mediaSrc is required for video.`);
    media = { kind: "video", src: mediaSrcRaw };
    if (mediaPoster) {
      media.poster = mediaPoster;
    }
  } else if (mediaKind === "strip") {
    const sources = stripSourcesRaw
      .split("|")
      .map((source) => source.trim())
      .filter(Boolean);
    ensure(sources.length > 0, `line ${lineNumber}: stripSources is required for strip media.`);
    media = { kind: "strip", sources };
  } else {
    fail(`line ${lineNumber}: unsupported mediaKind "${mediaKind}".`);
  }

  const entry = { id, title, roles, media };

  if (subtitle) entry.subtitle = subtitle;
  if (copy) entry.copy = copy;
  if (youtubeId) entry.youtubeId = youtubeId;
  if (href) entry.href = href;
  if (seriesId) entry.seriesId = seriesId;
  if (sourceHref) entry.sourceHref = sourceHref;
  if (showOnHome !== undefined) entry.showOnHome = showOnHome;
  if (homeOrder !== undefined) entry.homeOrder = homeOrder;
  if (videoOrder !== undefined) entry.videoOrder = videoOrder;
  if (publishedAt) entry.publishedAt = publishedAt;
  if (vertical !== undefined) entry.vertical = vertical;

  cases.push(entry);
}

const output = [
  "// Generated by scripts/gen-cases.mjs. Do not edit directly.",
  'import type { Case } from "./cases";',
  "",
  `export const CASES: Case[] = ${JSON.stringify(cases, null, 2)};`,
  "",
].join("\n");

fs.writeFileSync(outputPath, output, "utf8");
