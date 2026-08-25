/*
 * Home.tsx の ASSETS マップに書かれた外部 CDN 画像を client/public/images/ に取り込む。
 * LP の画像は Manus の CloudFront にホットリンクされているだけなので、
 * CDN が落ちるとページ上の画像が一斉に表示されなくなる。これを一度だけ実行して
 * 画像をリポジトリに同梱し、以降は自前ホスティングに切り替える。
 */

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const HOME_TSX = path.join(ROOT, "client/src/pages/Home.tsx");
const OUT_DIR = path.join(ROOT, "client/public/images");

/** Home.tsx の ASSETS リテラルから key -> URL を取り出す */
async function readAssetMap() {
  const source = await fs.readFile(HOME_TSX, "utf-8");

  const cdn = source.match(/^const CDN = "([^"]+)";/m)?.[1];
  if (!cdn) throw new Error("CDN 定数が Home.tsx に見つかりません");

  const block = source.match(/const ASSETS: Record<string, string> = \{([\s\S]*?)\n\};/);
  if (!block) throw new Error("ASSETS マップが Home.tsx に見つかりません");

  const entries = [];
  for (const line of block[1].split("\n")) {
    const m = line.match(/^\s*"([^"]+)":\s*`([^`]+)`/);
    if (!m) continue;
    entries.push([m[1], m[2].replace("${CDN}", cdn)]);
  }
  if (entries.length === 0) throw new Error("ASSETS マップからエントリを抽出できませんでした");
  return entries;
}

const EXT_BY_TYPE = {
  "image/webp": ".webp",
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
};

/** key と元 URL から ASCII のみの保存ファイル名を決める（日本語ファイル名を避ける） */
function localName(key, url, contentType) {
  const urlExt = path.extname(new URL(url).pathname).toLowerCase();
  const ext = EXT_BY_TYPE[contentType?.split(";")[0].trim()] ?? (urlExt || ".bin");
  return `${key.replace(/[^A-Za-z0-9._-]/g, "-")}${ext}`;
}

const TIMEOUT_MS = 15_000;

async function download(url) {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const body = Buffer.from(await res.arrayBuffer());
      if (body.length === 0) throw new Error("空のレスポンス");
      return { body, contentType: res.headers.get("content-type") };
    } catch (e) {
      lastError = e;
      if (attempt < 2) await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw lastError;
}

/** 全件流す前に1件だけ試して、CDN 自体が死んでいる場合は早く失敗させる */
async function probe([key, url]) {
  try {
    await download(url);
    console.log(`疎通確認 OK: ${key}`);
  } catch (e) {
    throw new Error(
      `CDN に到達できません (${url}): ${e.message ?? e}\n` +
        "画像のホスト元である Manus の CDN が配信を停止している可能性があります。",
    );
  }
}

/** limit 件ずつ並行で走らせる */
async function mapWithConcurrency(items, limit, fn) {
  const results = [];
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

const assets = await readAssetMap();
await fs.mkdir(OUT_DIR, { recursive: true });

await probe(assets[0]);

const manifest = {};
const failures = [];

await mapWithConcurrency(assets, 8, async ([key, url]) => {
  try {
    const { body, contentType } = await download(url);
    const name = localName(key, url, contentType);
    await fs.writeFile(path.join(OUT_DIR, name), body);
    manifest[key] = name;
    console.log(`OK   ${key.padEnd(12)} ${(body.length / 1024).toFixed(1)}KB -> images/${name}`);
  } catch (e) {
    failures.push({ key, url, reason: String(e.message ?? e) });
    console.log(`FAIL ${key.padEnd(12)} ${url}\n     ${e.message ?? e}`);
  }
});

await fs.writeFile(
  path.join(OUT_DIR, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf-8",
);

console.log(`\n${assets.length - failures.length}/${assets.length} 件を取得しました。`);
if (failures.length > 0) {
  console.log("取得できなかったアセット:");
  for (const f of failures) console.log(`  - ${f.key}: ${f.reason} (${f.url})`);
  process.exitCode = 1;
}
