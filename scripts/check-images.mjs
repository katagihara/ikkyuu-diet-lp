/*
 * Home.tsx の ASSETS が参照する画像が client/public/images/ に揃っているか確認する。
 *
 * 以前は画像を外部 CDN にホットリンクしていたため、CDN が配信を止めた時点で
 * LP 上の画像が一斉に表示されなくなった。同じ事故を繰り返さないよう画像はリポジトリに
 * 同梱しているが、置き忘れると同じ見た目の不具合になるのでビルド時に検出する。
 */

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const HOME_TSX = path.join(ROOT, "client/src/pages/Home.tsx");
const IMAGES_DIR = path.join(ROOT, "client/public/images");

const source = await fs.readFile(HOME_TSX, "utf-8");
const block = source.match(
  /const ASSETS: Record<string, string> = \{([\s\S]*?)\n\};/
);
if (!block) throw new Error("ASSETS マップが Home.tsx に見つかりません");

const required = [];
for (const line of block[1].split("\n")) {
  const m = line.match(/^\s*"([^"]+)":\s*`\$\{IMG\}\/([^`]+)`/);
  if (m) required.push({ key: m[1], file: m[2] });
}
if (required.length === 0)
  throw new Error("ASSETS マップからエントリを抽出できませんでした");

const present = new Set(await fs.readdir(IMAGES_DIR).catch(() => []));
const missing = required.filter(({ file }) => !present.has(file));

console.log(
  `${required.length - missing.length}/${required.length} 件の画像が揃っています。`
);
if (missing.length > 0) {
  console.log("\nclient/public/images/ に不足している画像:");
  for (const { key, file } of missing)
    console.log(`  - ${file}  (ASSETS["${key}"])`);
  console.log(
    "\nどの画像を置けばよいかは docs/lp-images.md を参照してください。"
  );
  process.exitCode = 1;
}
