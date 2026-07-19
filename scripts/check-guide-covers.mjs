#!/usr/bin/env node
/**
 * Fail CI wanneer een published gids-slug in seed SQL geen cover-PNG heeft.
 * Convention: public/images/guides/<slug>.png
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const seedDir = path.join(root, "db", "seed");
const guidesDir = path.join(root, "public", "images", "guides");

function extractArticleSlugs(filePath) {
  const text = readFileSync(filePath, "utf8");
  if (!/insert\s+into\s+content_articles\b/i.test(text)) return [];

  const slugs = [];
  const startRe = /insert\s+into\s+content_articles\b/gi;
  let start;
  while ((start = startRe.exec(text)) !== null) {
    const from = start.index;
    // Stop before ON CONFLICT so body text with ';' cannot truncate the block.
    const onConflict = text.slice(from).search(/\bon\s+conflict\b/i);
    const chunk = onConflict >= 0 ? text.slice(from, from + onConflict) : text.slice(from);
    // ('Title', 'slug',
    const pairRe = /\(\s*'((?:\\'|[^'])*)'\s*,\s*'([a-z0-9]+(?:-[a-z0-9]+)*)'\s*,/g;
    let match;
    while ((match = pairRe.exec(chunk)) !== null) {
      slugs.push(match[2]);
    }
  }
  return slugs;
}

const seedFiles = readdirSync(seedDir).filter((f) => f.endsWith(".sql"));
const slugs = new Set();
for (const file of seedFiles) {
  for (const slug of extractArticleSlugs(path.join(seedDir, file))) {
    slugs.add(slug);
  }
}

if (slugs.size === 0) {
  console.error("check-guide-covers: geen content_articles slugs gevonden in db/seed");
  process.exit(1);
}

const missing = [];
for (const slug of [...slugs].sort()) {
  const file = path.join(guidesDir, `${slug}.png`);
  if (!existsSync(file)) missing.push(slug);
}

if (missing.length > 0) {
  console.error("check-guide-covers: ontbrekende covers (public/images/guides/<slug>.png):");
  for (const slug of missing) console.error(`  - ${slug}`);
  process.exit(1);
}

console.warn(`check-guide-covers: OK (${slugs.size} gidsen met cover)`);
