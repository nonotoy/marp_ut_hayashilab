# Marp Slides

> この marp-deck は東京大学 大学院総合文化研究科 林研究室の学生による非公式のリポジトリです。研究室外の方の利用により生じた一切のトラブル・損害について、作成者および研究室は責任を負いません。各自の責任でご利用ください。
>
> This marp-deck is an unofficial repository maintained by students of the Hayashi Lab, Graduate School of Arts and Sciences, University of Tokyo. The authors and the laboratory assume no responsibility or liability for any trouble or damage arising from use by anyone outside the laboratory. Use it at your own risk.

Marp ベースのスライド自動化プロジェクト。設計判断・配色・ロゴ運用ルールの詳細は [`design.md`](./design.md) を参照。

## セットアップ

```bash
npm install
```

依存ツールは `@marp-team/marp-cli`（`devDependencies` に固定済み）。

## ビルド

ビルドは marp を直接叩かず、`scripts/build.mjs` を経由する。これが `profile.yaml` を読み込んでプレースホルダを置換し、front-matter の `logo` を解釈してから marp を実行する。

```bash
# 同梱サンプルを PDF に → build/sample.pdf
npm run build:sample

# .md ファイルを直接指定（ファイル名は自由）→ build/<ファイル名>.pdf
npm run build -- decks/<deck>/<name>.md
npm run build -- decks/<deck>/<name>.md pptx
npm run build -- decks/<deck>/<name>.md html

# ディレクトリ指定でもよい（既定は pdf）
npm run build -- decks/<deck>          # build/<deck>.pdf

# ライブプレビュー（http://localhost:8080）
npm run watch
```

第1引数は .md ファイルでもディレクトリでもよい。

- ファイル指定（`decks/<deck>/<name>.md`）: 出力は `build/<name>.<ext>`。ファイル名は自由に付けられる。
- ディレクトリ指定（`decks/<deck>`）: 中の `slides.md` を使う。無ければ単一の `.md` を自動採用（複数あればどれをビルドするか指定を求められる）。出力は `build/<deck>.<ext>`。
- 例外: ファイル名が `slides.md` のときだけ出力名にディレクトリ名を使う（`decks/sample/slides.md` → `build/sample.pdf`）。

配置の制約: 表紙ロゴの相対パス（`../../assets/`）の都合で、デッキは `decks/` の直下にもう1段（`decks/<deck>/<name>.md`）に置く。`decks/` に直接 `.md` を置くとロゴパスが壊れる。

注意: `npm run watch` は marp を直接叩くため、プレースホルダ（`{{name}}` 等）とロゴ切替は処理されない。プレビューでは `{{...}}` が生のまま表示される。最終確認は `npm run build` で行う。

## プロフィール（氏名・所属など）の管理

毎回は変わらない属人情報（氏名・所属・連絡先）は `slides.md` に直書きせず、[`profile.yaml`](./profile.yaml) に集約する。`slides.md` 側には `{{key}}` のプレースホルダを書き、ビルド時に置換される。日付は発表ごとに変わるので profile では持たず、各 `slides.md` に直書きする。

ルートの `profile.yaml`（全デッキ共通のデフォルト）:

```yaml
name: 東大 太郎
affil: 総合文化研究科 言語情報科学専攻 D1
email: todai-taro@example.com

# 英語発表用（{{name_en}} / {{affil_en}} で参照）
name_en: Taro Todai
affil_en: Graduate School of Arts and Sciences, D1
```

`slides.md` 内での参照（日付は直書き）:

```markdown
<div class="meta">
<p class="affil">{{affil}}</p>
<p class="name">{{name}}</p>
<p class="date">2026-05-02</p>
</div>
```

- デッキ個別に上書きしたいときは `decks/<deck>/profile.yaml` を置く。ルート → デッキの順でマージされ、デッキ側が優先される。
- `profile.yaml` に無いキーを `{{...}}` で参照すると、警告を出して元の文字列のまま残す。
- タイトル・サブタイトル・本文など、その発表固有で毎回変わるものは `slides.md` に直書きでよい（プレースホルダ不要）。日付も発表専用なら直書きで構わない。

## 表紙のロゴを出す/出さない

東京大学コミュニケーションマークは表紙にだけ載るので、`slides.md` 冒頭の front-matter で ON/OFF する。

```yaml
---
marp: true
theme: utokyo
paginate: true
size: 16:9
logo: true     # false にすると表紙のロゴを非表示
---
```

`logo: false` のとき、ビルドスクリプトが表紙の `<img class="title-logo">` 行を出力から取り除く。`logo` キー自体は marp に渡す前に除去されるため、marp 側には影響しない。未指定（キーが無い）の場合はロゴ表示（既定 true）。

学会提出はロゴ無し・学内発表はロゴ有り、のような切替は 1 行（`true`/`false`）で済む。

## 英語発表（フォントを Inter に切替）

英語デッキは本文フォントを Inter に切り替える。front-matter に `class: lang-en` を 1 行足すだけ:

```yaml
---
marp: true
theme: utokyo
paginate: true
size: 16:9
logo: true
class: lang-en     # 本文を Inter に（日本語デッキは無指定で BIZ UDPゴシック）
---
```

- 切替は `themes/utokyo.css` の `section.lang-en` で実装（Inter を `@import`、コードは monospace のまま）。
- 氏名・所属の英語表記は `profile.yaml` の `name_en` / `affil_en` を `{{name_en}}` / `{{affil_en}}` で参照する。
- 動くサンプルは [`decks/sample_en/slides.md`](./decks/sample_en/slides.md)（`npm run build -- decks/sample_en`）。

## 新しい発表を作る

1. テンプレを複製（ファイル名は自由。`slides.md` でなくてよい）:
   ```bash
   cp -r decks/_template decks/2026-05_topic
   mv decks/2026-05_topic/template.md decks/2026-05_topic/talk.md
   ```
2. `decks/2026-05_topic/talk.md` を編集（タイトル・本文・`logo` の true/false）
3. 必要なら `decks/2026-05_topic/profile.yaml` で属人情報を上書き
4. ビルド:
   ```bash
   npm run build -- decks/2026-05_topic/talk.md
   ```

`decks/<日付>_<トピック>/` で 1 発表 = 1 ディレクトリ運用。デッキ固有の図表は `decks/<deck>/assets/` に置く。ディレクトリ内の .md が1つだけなら `npm run build -- decks/2026-05_topic`（ディレクトリ指定）でもビルドできる。

## カスタムクラス一覧

スライド冒頭に `<!-- _class: <名前> -->` を書いてレイアウトを切り替える。

| クラス | 用途 |
|---|---|
| `title` | 表紙。h1/h2 が左上、所属/氏名が左下、ロゴが右下。 |
| `chapter` | 章扉。薄青背景、中央寄せ。 |
| `two-col` | 2 カラム本文。各カラムを `<div class="col">…</div>` で囲む。 |
| `quote` | 引用・キャッチコピー。中央寄せ大文字。 |
| (指定なし) | 通常スライド。固定ヘッダー (h1) + 本文は上から順。 |

## ディレクトリ構成

```
marp/
├── README.md              # このファイル
├── design.md              # 設計・配色・ロゴ運用ルール
├── profile.yaml           # 氏名・所属など共通プロフィール
├── package.json           # marp-cli 固定 / npm scripts
├── package-lock.json
├── scripts/
│   └── build.mjs          # profile 置換 + logo 切替 + marp 実行
├── assets/
│   └── utokyo_logotype.png
├── themes/
│   └── utokyo.css         # 自作テーマ
├── decks/
│   ├── _template/
│   │   └── template.md    # 新規デッキの雛形
│   ├── sample/
│   │   └── slides.md      # テンプレ検証用サンプル（日本語）
│   └── sample_en/
│       └── slides.md      # 英語サンプル（class: lang-en / Inter）
└── build/                 # 生成物（git 管理外）
```

## ノート

- フォントは BIZ UDPゴシック を Google Fonts から `@import` で取得し、PDF にフォント埋め込み。学外PCでも見た目が崩れない。
- ロゴは `<img>` 要素として配置（`::after` 経由ではないので Marpit の content 後処理に巻き込まれない）。サイズ・位置の微調整は `themes/utokyo.css` の `section.title .title-logo {…}` で行う。
- ビルド時に `decks/<deck>/.generated.slides.md` を一時生成して marp に渡し、ビルド後に削除する（git 管理外）。
