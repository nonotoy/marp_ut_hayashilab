# Marp Slides

Marp ベースのスライド自動化プロジェクト。設計判断・配色・ロゴ運用ルールの詳細は [`design.md`](./design.md) を参照。

## セットアップ

```bash
npm install
```

依存ツールは `@marp-team/marp-cli`（`devDependencies` に固定済み）。

## ビルド

```bash
# 同梱サンプルを PDF に
npm run build:sample

# 任意のデッキを PDF に
npm run build:pdf -- decks/<deck>/slides.md -o build/<name>.pdf

# PPTX 出力
npm run build:pptx -- decks/<deck>/slides.md -o build/<name>.pptx

# HTML 出力
npm run build:html -- decks/<deck>/slides.md -o build/<name>.html

# ライブプレビュー（http://localhost:8080 を自動オープン）
npm run watch
```

## 新しい発表を作る

1. テンプレを複製:
   ```bash
   cp -r decks/_template decks/2026-05_topic
   ```
2. `decks/2026-05_topic/slides.md` を編集
3. ビルド:
   ```bash
   npm run build:pdf -- decks/2026-05_topic/slides.md -o build/2026-05_topic.pdf
   ```

`decks/<日付>_<トピック>/` で 1 発表 = 1 ディレクトリ運用。デッキ固有の図表は `decks/<deck>/assets/` に置く。

## 表紙のロゴを出す/出さない

東京大学コミュニケーションマークは、デッキごとに切り替え可能。**`<img class="title-logo">`** を表紙に置くと右下に出る、置かないと出ない、というのが基本。短期/長期で切り替えたい場合は以下の3パターンから選ぶ。

### 方法 A: Markdown から `<img>` を消す（一番シンプル）

`decks/<deck>/slides.md` の表紙にある画像タグを削除（またはコメントアウト）するだけ:

```markdown
<!-- _class: title -->

# タイトル

## サブタイトル

<div class="meta">
<p class="affil">…</p>
<p class="name">…</p>
<p class="date">YYYY-MM-DD</p>
</div>

<!-- ロゴを出すなら↓を残す。出さないなら削除 or コメントアウト -->
<img src="../../assets/utokyo_logotype.png" class="title-logo" alt="" />
```

ロゴを使う予定がそもそも無いデッキ向け。

### 方法 B: フロントマターでデッキ全体オフ

`decks/<deck>/slides.md` の冒頭に `class: nologo` を追加するとロゴが消える（CSS の `section.nologo .title-logo { display: none }` で抑止）。`<img>` タグはそのまま残してOK。

```yaml
---
marp: true
theme: utokyo
paginate: true
size: 16:9
class: nologo      # ← これを足すとロゴ非表示
---
```

学会用に「ロゴ無し」、内部発表用に「ロゴ有り」など、**1 行コメントアウトで切り替えたい**ケースに最適。

```yaml
# class: nologo    # 内部発表時はコメントアウト → ロゴ有り
class: nologo      # 学会提出時はこの行を有効化 → ロゴ無し
```

### 方法 C: 表紙だけ個別オフ

特定の表紙スライドだけロゴを消すなら `_class:` に `nologo` を追加:

```markdown
<!-- _class: title nologo -->

# タイトル
...
```

複数の表紙スライドを使い分けたいケース（プロローグ・章扉的な扱い）向け。実用上は A か B でほぼ事足りる。

### 推奨

| シーン | 方法 |
|---|---|
| 学会・査読・対外発表（ロゴ規程の関係でロゴを出さない） | **B**（フロントマター切替） |
| 学内ゼミ・授業・進捗報告（ロゴ常時表示） | デフォルト（何もしない） |
| ロゴを完全に使わないデッキ | **A**（`<img>` タグごと削除） |
| 表紙が複数あって個別制御 | **C**（`_class:` で個別） |

## カスタムクラス一覧

スライド冒頭に `<!-- _class: <名前> -->` を書いてレイアウトを切り替える。

| クラス | 用途 |
|---|---|
| `title` | 表紙。h1/h2 が左上、所属/氏名が左下、ロゴが右下。 |
| `chapter` | 章扉。薄青背景、中央寄せ。 |
| `two-col` | 2 カラム本文。各カラムを `<div class="col">…</div>` で囲む。 |
| `quote` | 引用・キャッチコピー。中央寄せ大文字。 |
| (指定なし) | 通常スライド。固定ヘッダー (h1) + 本文は上から順。 |
| `nologo` | （表紙と組み合わせて）表紙のロゴだけ非表示にする。 |

## ディレクトリ構成

```
marp/
├── README.md              # このファイル
├── design.md              # 設計・配色・ロゴ運用ルール
├── package.json           # marp-cli 固定
├── package-lock.json
├── assets/
│   └── utokyo_logotype.png
├── themes/
│   └── utokyo.css         # 自作テーマ
├── decks/
│   ├── _template/
│   │   └── template.md    # 新規デッキの雛形
│   └── sample/
│       └── slides.md      # テンプレ検証用サンプル
└── build/                 # 生成物（git 管理外）
```

## ノート

- iCloud Drive 配下に置いている関係で **git 管理は現状していない**。バージョン管理を入れたい場合は別の場所（`~/Code/` など）にコピーしてから `git init` する想定。
- フォントは BIZ UDPゴシック を Google Fonts から `@import` で取得し、PDF にフォント埋め込み。学外PCでも見た目が崩れない。
- ロゴは `<img>` 要素として配置（`::after` 経由ではないので Marpit の content 後処理に巻き込まれない）。サイズ・位置の微調整は `themes/utokyo.css` の `section.title .title-logo {…}` で行う。
