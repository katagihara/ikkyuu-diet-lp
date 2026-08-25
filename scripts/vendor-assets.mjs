/*
 * Home.tsx の ASSETS マップに書かれた外部画像を client/public/images/ に取り込む。
 *
 * LP の画像は Manus の CloudFront にホットリンクされているだけでリポジトリには 1 枚も無い。
 * その CDN が配信を止めるとページ上の画像が一斉に表示されなくなるため、
 * 画像を取得してリポジトリに同梱し、自前ホスティングへ切り替える。
 *
 * CDN 側の応答が 403 になるケースがあるので、取得方法を複数用意して
 * 通るものを自動で選ぶ。--diagnose を付けると先頭 1 件で各方法の結果だけを出力する。
 */

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const HOME_TSX = path.join(ROOT, "client/src/pages/Home.tsx");
const OUT_DIR = path.join(ROOT, "client/public/images");
const DIAGNOSE_ONLY = process.argv.includes("--diagnose");
const TIMEOUT_MS = 20_000;

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/** 取得方法の候補。上から順に試し、最初に成功したものを全件に使う。 */
const STRATEGIES = [
  {
    name: "direct",
    label: "CDN へそのまま取得",
    build: (url) => ({ url, headers: {} }),
  },
  {
    name: "browser-ua",
    label: "ブラウザ相当の User-Agent 付き",
    build: (url) => ({ url, headers: { "User-Agent": BROWSER_UA, Accept: "image/webp,image/*,*/*;q=0.8" } }),
  },
  {
    name: "referer",
    label: "公開中の LP を Referer に指定",
    build: (url) => ({
      url,
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "image/webp,image/*,*/*;q=0.8",
        Referer: "https://vi-vari.github.io/ikkyuu_diet-lp/",
      },
    }),
  },
  {
    name: "wayback",
    label: "Wayback Machine のアーカイブから取得",
    build: (url) => ({
      url: `https://web.archive.org/web/2id_/${url}`,
      headers: { "User-Agent": BROWSER_UA },
    }),
  },
];

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

async function fetchOnce(strategy, sourceUrl) {
  const { url, headers } = strategy.build(sourceUrl);
  const res = await fetch(url, { headers, redirect: "follow", signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const body = Buffer.from(await res.arrayBuffer());
  if (body.length === 0) throw new Error("空のレスポンス");
  const contentType = res.headers.get("content-type");
  if (contentType && !contentType.startsWith("image/")) {
    throw new Error(`画像ではありません (content-type: ${contentType})`);
  }
  return { body, contentType };
}

async function download(strategy, url) {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      return await fetchOnce(strategy, url);
    } catch (e) {
      lastError = e;
      if (attempt < 2) await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw lastError;
}

/** 先頭 1 件で各方法を試し、通ったものを返す（--diagnose なら結果を出すだけ） */
async function pickStrategy([key, url]) {
  console.log(`取得方法の判定に ${key} (${url}) を使います\n`);
  let chosen = null;
  for (const strategy of STRATEGIES) {
    try {
      const { body } = await fetchOnce(strategy, url);
      console.log(`  OK   ${strategy.name.padEnd(10)} ${strategy.label} — ${(body.length / 1024).toFixed(1)}KB`);
      chosen ??= strategy;
      if (!DIAGNOSE_ONLY) break;
    } catch (e) {
      console.log(`  NG   ${strategy.name.padEnd(10)} ${strategy.label} — ${e.message ?? e}`);
    }
  }
  console.log("");
  return chosen;
}

/** limit 件ずつ並行で走らせる */
async function mapWithConcurrency(items, limit, fn) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) await fn(items[cursor++]);
  });
  await Promise.all(workers);
}

const assets = await readAssetMap();
const strategy = await pickStrategy(assets[0]);

if (!strategy) {
  console.error(
    "どの方法でも画像を取得できませんでした。\n" +
      "画像のホスト元である Manus の CDN が配信を停止しており、アーカイブにも残っていません。\n" +
      "元の画像ファイルを client/public/images/ に配置してください。",
  );
  process.exit(1);
}

if (DIAGNOSE_ONLY) {
  console.log(`診断のみで終了します（使える方法: ${strategy.name}）。`);
  process.exit(0);
}

console.log(`取得方法「${strategy.label}」で ${assets.length} 件を取得します。\n`);
await fs.mkdir(OUT_DIR, { recursive: true });

const manifest = {};
const failures = [];

await mapWithConcurrency(assets, 8, async ([key, url]) => {
  try {
    const { body, contentType } = await download(strategy, url);
    const name = localName(key, url, contentType);
    await fs.writeFile(path.join(OUT_DIR, name), body);
    manifest[key] = name;
    console.log(`OK   ${key.padEnd(12)} ${(body.length / 1024).toFixed(1)}KB -> images/${name}`);
  } catch (e) {
    failures.push({ key, url, reason: String(e.message ?? e) });
    console.log(`FAIL ${key.padEnd(12)} ${url}\n     ${e.message ?? e}`);
  }
});

await fs.writeFile(path.join(OUT_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");

console.log(`\n${assets.length - failures.length}/${assets.length} 件を取得しました。`);
if (failures.length > 0) {
  console.log("取得できなかったアセット:");
  for (const f of failures) console.log(`  - ${f.key}: ${f.reason} (${f.url})`);
  process.exitCode = 1;
}
