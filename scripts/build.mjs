#!/usr/bin/env node
// profile.yaml を読み、slides.md 内の {{key}} を置換してから marp でビルドする。
//
// 使い方:
//   node scripts/build.mjs <deckDir> [format]
//   format: pdf (既定) | pptx | html
// 例:
//   node scripts/build.mjs decks/sample          -> build/sample.pdf
//   node scripts/build.mjs decks/sample pptx      -> build/sample.pptx
//
// プロフィールの優先順位: <deckDir>/profile.yaml が ルート profile.yaml を上書き。

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, statSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, basename, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// --- 引数 ---------------------------------------------------------------
// 第1引数は .md ファイルでも、デッキのディレクトリでもよい。
//   - ファイル指定:        decks/aaa/presentation.md
//   - ディレクトリ指定:    decks/aaa   (中の slides.md → 無ければ単一の .md を採用)
const [deckArg, formatArg = 'pdf'] = process.argv.slice(2);
if (!deckArg) {
  console.error('使い方: node scripts/build.mjs <deck.md | deckDir> [pdf|pptx|html]');
  process.exit(1);
}
const FORMATS = { pdf: '--pdf', pptx: '--pptx', html: '--html' };
if (!FORMATS[formatArg]) {
  console.error(`未知の format: ${formatArg} (pdf|pptx|html のいずれか)`);
  process.exit(1);
}

const target = resolve(ROOT, deckArg);
if (!existsSync(target)) {
  console.error(`見つかりません: ${target}`);
  process.exit(1);
}

let srcMd;
if (statSync(target).isDirectory()) {
  const slides = join(target, 'slides.md');
  if (existsSync(slides)) {
    srcMd = slides;
  } else {
    const mds = readdirSync(target).filter((f) => f.endsWith('.md') && !f.startsWith('.generated'));
    if (mds.length === 1) {
      srcMd = join(target, mds[0]);
    } else {
      console.error(
        `${target} に slides.md が無く、.md が ${mds.length} 個あります。ビルドする .md を直接指定してください。`,
      );
      process.exit(1);
    }
  }
} else {
  srcMd = target;
}
const deckDir = dirname(srcMd);

// --- 簡易フラット YAML パーサ (key: value のみ対応) ----------------------
function parseYaml(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf(':');
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    const val = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    out[key] = val;
  }
  return out;
}

function loadProfile(path) {
  return existsSync(path) ? parseYaml(readFileSync(path, 'utf8')) : {};
}

// ルート + deck 個別をマージ (deck が優先)
const profile = {
  ...loadProfile(join(ROOT, 'profile.yaml')),
  ...loadProfile(join(deckDir, 'profile.yaml')),
};

let md = readFileSync(srcMd, 'utf8');

// --- front-matter から独自ディレクティブ logo を取り出す ----------------
// logo: false なら表紙のロゴ (class="title-logo") を出力しない。
// marp は logo キーを知らないので、marp へ渡す前に front-matter から除去する。
let logo = true;
const fmMatch = md.match(/^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n?)/);
if (fmMatch) {
  const [, open, body, close] = fmMatch;
  const kept = [];
  for (const line of body.split(/\r?\n/)) {
    const m = line.match(/^\s*logo\s*:\s*(.+?)\s*$/);
    if (m) {
      const v = m[1].replace(/\s+#.*$/, '').replace(/^["']|["']$/g, '').trim();
      logo = !/^(false|no|off|0)$/i.test(v);
      continue; // logo 行は marp に渡さない
    }
    kept.push(line);
  }
  md = open + kept.join('\n') + close + md.slice(fmMatch[0].length);
}

if (!logo) {
  // class="title-logo" を含む行を丸ごと削除
  md = md.replace(/^.*class="title-logo".*$\r?\n?/gm, '');
}

// --- プレースホルダ置換 -------------------------------------------------
md = md.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (m, key) => {
  if (key in profile) return profile[key];
  console.warn(`警告: {{${key}}} に対応する値が profile.yaml にありません`);
  return m;
});

// --- 生成 md を deck と同じ場所に書く (相対パスを保つため) ---------------
const stem = basename(srcMd).replace(/\.md$/, '');
const genMd = join(deckDir, `.generated.${stem}.md`);
writeFileSync(genMd, md, 'utf8');

// --- marp 実行 ----------------------------------------------------------
// 出力名: ファイル名が汎用の slides ならディレクトリ名を、それ以外はファイル名を使う。
const outName = stem === 'slides' ? basename(deckDir) : stem;
const outDir = join(ROOT, 'build');
mkdirSync(outDir, { recursive: true });
const ext = formatArg;
const outFile = join(outDir, `${outName}.${ext}`);

const marpBin = join(ROOT, 'node_modules/.bin/marp');
const res = spawnSync(
  marpBin,
  ['--theme-set', 'themes', '--allow-local-files', FORMATS[formatArg], genMd, '-o', outFile],
  { cwd: ROOT, stdio: 'inherit' },
);

// 生成物を残さない
rmSync(genMd, { force: true });

if (res.status !== 0) {
  console.error('marp ビルド失敗');
  process.exit(res.status ?? 1);
}
console.log(`生成: ${outFile}`);
