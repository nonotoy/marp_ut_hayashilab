# Marp Slides — 設計ドキュメント

Claude Code を使って Marp ベースのスライドを半自動で量産するための設計メモ。
このファイルは「ツール選定の判断ログ」と「運用ルール」を一元化する場所であり、
スライド本体（`*.md`）はここに書かない。

最終更新: 2026-05-02 / Author: todai-taro

---

## 1. 目的

- Markdown を編集する Claude Code のループにスライド作成を乗せ、内容に集中できる環境を作る。
- 学会・ゼミ・授業など、繰り返し発生する発表を **テンプレ + 中身の差し替え** で完結させる。
- 同一テーマ・ロゴ規約で複数スライドを横断的に管理する（年度をまたいでも体裁が崩れない）。

## 2. 用途・想定ユースケース（要確定）

優先度は仮置き。実利用に応じて更新する。

| 区分 | 想定 | 出力 | 頻度 |
|------|------|------|------|
| 研究発表（学会・ゼミ） | 数式・図・引用が多め。20〜40分 | PDF | 高 |
| 授業・講義資料 | スライド枚数多め。配布用PDF | PDF | 中 |
| ミーティング・進捗 | 体裁軽め、即興で書ける | PDF/HTML | 中 |
| 講演（外部向け） | デザイン重視。ロゴ規程注意 | PDF/PPTX | 低 |

> **TODO:** 一番最初に作るスライドの題材を決めて、テンプレ検証の対象にする。

## 3. ツール選定

採用: **Marp (Marpit + Marp CLI)**

| 候補 | 採否 | 理由 |
|------|------|------|
| **Marp** | ◎ 採用 | Markdown が源泉。Claude が差分編集しやすい。PDF/PPTX/HTML出力。CSS でテーマ拡張可。CLI で自動化容易。 |
| Slidev | △ 検討外 | 動的演出は強いが、Vue/Node 知識が必要で立ち上げコストが高い。今回の主用途（静的な発表PDF）では過剰。 |
| python-pptx | △ 検討外 | PPTX を完全制御できるが、コードが verbose。スライド単位で素早く書く用途に不向き。 |
| Beamer (LaTeX) | × 不採用 | 数式・引用は強いが、レイアウト調整に時間がかかる。日本語フォント周りの設定も重い。 |
| Google Slides API | × 不採用 | クラウド依存。デザイン規約の徹底が難しい。バージョン管理が弱い。 |

判断軸: **「Claude が自然に編集できる Markdown」「ローカル完結」「PDF/PPTX両対応」「テーマ自作の自由度」** の4点で Marp が最適。

## 4. 出力形式

- **第一形式: PDF**（発表本番・配布の標準）
- 第二形式: HTML（プレビュー・Web公開）
- 第三形式: PPTX（共同編集・差し替え依頼が来た場合のみ）

PPTX は Marp CLI が画像化してパッケージするため、**スライド上で画像をドラッグして動かすことはできなくなる**点に注意（ベクター編集を残したいパーツは Markdown 側に `![]()` で配置する）。

## 5. ディレクトリ構成

```
marp/
├── design.md                  # このファイル
├── README.md                  # ビルド手順 / 使い方（後で追加）
├── package.json               # marp-cli を devDependency で固定
├── .gitignore
├── assets/
│   ├── utokyo_logotype.png    # ../utokyo_logotype.png をコピー
│   └── （図表・写真）
├── themes/
│   └── utokyo.css             # 自作テーマ（東大ロゴ規約準拠）
├── decks/
│   ├── _template/
│   │   └── template.md        # 新規スライドの雛形
│   ├── 2026-05_xxx/
│   │   ├── slides.md
│   │   └── assets/            # そのデッキ専用素材
│   └── ...
└── build/                     # 生成物（git ignore）
```

設計上の決め事:
- **`decks/<日付>_<トピック>/`** で1発表=1ディレクトリ。横展開がしやすい。
- 共通アセットは `assets/`、デッキ固有は `decks/.../assets/` に分離。
- `themes/utokyo.css` を全デッキが共有。テーマを直接編集すると全スライドに波及するため、修正は要レビュー。

## 6. デザイン規約

### 6.1 フォント

- **メイン（日本語・欧文兼用）: BIZ UDPゴシック**（Universal Design Proportional / Regular 400, Bold 700）
  - 配布: SIL Open Font License。Google Fonts に登録あり。
  - PDF への埋め込み: `themes/utokyo.css` 内で `@import url('https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&display=swap')` を指定。Marp CLI は Chromium 経由で Web フォントを取得し、PDF に埋め込むので、閲覧側に未インストールでも崩れない。
  - ローカル表示用（編集中のプレビュー精度向上）: `brew install --cask font-biz-udpgothic` または Google Fonts からダウンロードして OS にインストール。
- 欠字・記号フォールバック: ヒラギノ角ゴ ProN / Yu Gothic / system-ui
- コード: JetBrains Mono / Menlo

> **判断ログ:** BIZ UDPゴシック採用の理由は、UD（ユニバーサルデザイン）系で可読性が高く、OSS（OFL）で配布制限がなく、Google Fonts 経由で再現性のあるビルドができるため。Chromium のフォントレンダリングは OS 依存だが、`@import url()` で Web フォントとして取得すれば学内/学外PCを問わず同じ見た目になる。

### 6.2 配色（東大コミュニケーションマーク準拠の色を補完色として使用）

- アクセント青: `#0072BC`（ロゴの青に近い）
- アクセント黄: `#EFAA00`（イチョウの黄）
- 文字: `#222222` / 補助テキスト `#666666`
- 背景: `#FFFFFF`（標準）/ `#0F1A2C`（ダーク用、章扉）

> **要確認:** 上記の HEX は仮。東大コミュニケーションマークの公式ガイドラインで指定色がある場合はそちらを優先する。

### 6.3 ロゴ運用ルール（重要）

**素材**:
- 公式ロゴ（コミュニケーションマーク）: `assets/utokyo_logotype.png`
  - 元ファイル: `../utokyo_logotype.png`（プロジェクト初回セットアップ時にコピー）

**配置パターン（表紙のみに集約する方針）**:

| 用途 | 配置 | 実装 |
|------|------|------|
| **表紙（タイトルスライド）** | **左下**に幅 220px・高さ 60px。直上に所属・氏名・日付を配置 | `<!-- _class: title -->` + `<div class="meta">` |
| 通常スライド | **配置しない** | （理由: 表紙に集約することで本文の視認性と情報密度を最大化） |
| 章扉スライド | 配置しない | `<!-- _class: chapter -->` |
| 印刷時の余白 | ロゴが断ち落としに被らない位置（左端から 96px 以上） | テーマCSS で `left: 96px; bottom: 80px;` |

**所属・氏名の標準表記**（表紙の `.meta` ブロック）:

```
所属: 総合文化研究科 言語情報科学専攻 D1
氏名: 東大太郎
日付: YYYY-MM-DD
```

**禁止事項（公式ガイドライン準拠）**:
- ロゴの色変更・回転・歪み・分解（青と黄の比率を維持）
- 背景色とのコントラストが取れない位置への配置
- ロゴ周囲の余白（最小余白 = ロゴの「学」の字の高さ相当）を侵すレイアウト
- 商用・対外配布用途で、東京大学コミュニケーションマーク使用規程に基づく事前申請なしの使用

**運用方針**:
- **学内発表（ゼミ・授業・学内シンポ）**: 自由に使用可。`themes/utokyo.css` のデフォルトを利用。
- **学会発表（査読・本会議）**: 所属表記は東京大学だが、ロゴはタイトルスライドのみに留めるのが慣例。本文スライドにはロゴを出さない別テーマ `themes/utokyo-conf.css` を将来追加する。
- **外部公開・商用**: 規程に従い事前申請。本プロジェクトの初期スコープ外。

> **TODO:** コミュニケーションマーク使用規程の最新版URLを確認して、本ドキュメントにリンクを追加する（学内ポータル経由）。

## 7. テンプレート方針

`decks/_template/template.md` に以下のクラスを用意する。

- `title`（表紙）: タイトル / サブタイトル / 著者 / 所属 / 日付 / 大きいロゴ
- `agenda`（目次）: 章リスト
- `chapter`（章扉）: 大文字の章番号 + タイトル（背景濃色）
- 通常スライド（class指定なし）: 上タイトル + 本文 + 右下小ロゴ
- `two-col`: 左右2カラム（図 vs 文）
- `quote`: 引用大きめ
- `qa`（Q&Aクロージング）: 連絡先 / 引用文献

クラス指定は Marpit の `<!-- _class: title -->` 構文を使う。

## 8. ビルド・運用フロー

### 8.1 セットアップ（初回のみ）

```bash
cd "<this dir>"
npm init -y
npm i -D @marp-team/marp-cli
cp ../utokyo_logotype.png assets/utokyo_logotype.png
```

`package.json` に scripts を追加:

```json
{
  "scripts": {
    "build:pdf":  "marp --theme themes/utokyo.css --allow-local-files --pdf",
    "build:pptx": "marp --theme themes/utokyo.css --allow-local-files --pptx",
    "watch":      "marp --theme themes/utokyo.css --allow-local-files -w -s decks/"
  }
}
```

### 8.2 新規スライド作成

```bash
cp -r decks/_template decks/2026-05_topic
# slides.md を編集
npm run watch        # ローカルプレビュー（http://localhost:8080）
npm run build:pdf -- decks/2026-05_topic/slides.md -o build/2026-05_topic.pdf
```

### 8.3 Claude Code の使い方（学習ロードマップとセット）

- **Lv.1**: 既存テンプレに対して章立てと本文の Markdown を Claude に書かせる。
- **Lv.2**: 図表（Mermaid）の生成、引用フォーマットの整形、参考文献リスト化を頼む。
- **Lv.3**: 過去スライドや論文ドラフトを材料に、初稿を Claude にゼロから起こさせる。
- **Lv.4**: テーマCSSの調整（章扉カラー、ロゴ位置、フォント）を会話で進める。
- **Lv.5**: ビルド〜PDF生成までを Claude に任せて、最終確認だけ自分でやる運用にする。

## 9. 学習ロードマップ（実作業の進め方）

1. このdesign.mdを確定（用途・配色・ロゴ運用の TODO を埋める）
2. プロジェクトのひな形（`package.json` / `themes/utokyo.css` / `decks/_template/`）を作成
3. ロゴを `assets/` にコピー
4. **最小スライド1本**（5〜10枚）をゼロから書いて PDF 出力。テーマと運用が機能するか検証
5. 検証で出た不満点を `themes/utokyo.css` と `_template/` に反映
6. README.md にビルド手順をまとめる
7. 実発表で1回使う → 振り返り → このdesign.mdを更新

## 10. 未確定事項 / TODO

- [ ] 最初の題材スライドを決める（学習用のドッグフード対象）
- [ ] 公式コミュニケーションマーク色の正確な HEX を確認
- [ ] 学会発表用テーマ（ロゴ控えめ版）の必要性をいつ判断するか
- [ ] 数式の描画方式: KaTeX（Marp標準）で十分か、別途検討
- [ ] 図表生成: Mermaid 埋め込み / 外部画像 / TikZ→PNG のどれを主にするか
- [ ] バージョン管理: このプロジェクトを git 化するか（iCloud 同期との競合に注意）
- [ ] フォント embed の手順（学外PCでもビルドが崩れないように）
