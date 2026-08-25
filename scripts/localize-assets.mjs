/*
 * vendor-assets.mjs が書き出した manifest.json をもとに、Home.tsx の ASSETS マップを
 * 外部 CDN の URL から自前ホスティング（client/public/images/）のパスに書き換える。
 * ベースパスは Vite の import.meta.env.BASE_URL を使うので、
 * ローカル開発でも GitHub Pages のサブパス配信でも同じコードで動く。
 */

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const HOME_TSX = path.join(ROOT, "client/src/pages/Home.tsx");
const MANIFEST = path.join(ROOT, "client/public/images/manifest.json");

const manifest = JSON.parse(await fs.readFile(MANIFEST, "utf-8"));
const source = await fs.readFile(HOME_TSX, "utf-8");

const block = source.match(/const CDN = "[^"]+";\n\nconst ASSETS: Record<string, string> = \{[\s\S]*?\n\};/);
if (!block) throw new Error("CDN 定数と ASSETS マップの並びが想定と違います");

const missing = [];
const lines = [];
for (const line of block[0].split("\n")) {
  const entry = line.match(/^(\s*)"([^"]+)":\s*`[^`]+`,(.*)$/);
  if (!entry) {
    // コメント行や波括弧はそのまま残す（CDN 定数の行だけ後で差し替える）
    if (!/^const CDN = /.test(line)) lines.push(line);
    continue;
  }
  const [, indent, key, trailing] = entry;
  const file = manifest[key];
  if (!file) {
    missing.push(key);
    lines.push(line);
    continue;
  }
  lines.push(`${indent}"${key}":${" ".repeat(Math.max(1, 10 - key.length))}\`\${IMG}/${file}\`,${trailing}`);
}

if (missing.length > 0) {
  throw new Error(`manifest.json に無いキーがあります: ${missing.join(", ")}`);
}

const header = [
  "// 画像は client/public/images/ に同梱している。",
  "// 外部 CDN へのホットリンクだと配信が止まった時点で全画像が表示されなくなるため、",
  "// ベースパス込みの自前ホスティングに切り替えている（GitHub Pages のサブパス配信にも対応）。",
  "const IMG = `${import.meta.env.BASE_URL}images`;",
  "",
].join("\n");

await fs.writeFile(HOME_TSX, source.replace(block[0], header + lines.join("\n")), "utf-8");
console.log(`ASSETS の ${Object.keys(manifest).length} 件をローカルパスに書き換えました。`);
