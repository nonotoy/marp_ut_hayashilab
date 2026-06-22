---
marp: true
theme: utokyo
paginate: true
size: 16:9
logo: true   # false にすると表紙のロゴを非表示
---

<!-- _class: title -->

# Marp Slides — テンプレート検証

## BIZ UDPゴシック × 東京大学コミュニケーションマーク

<div class="meta">
<p class="affil">{{affil}}</p>
<p class="name">{{name}}</p>
<p class="date">2026-05-02</p>
</div>

<img src="../../assets/utokyo_logotype.png" class="title-logo" alt="" />

---

# アジェンダ

1. このプロジェクトの目的
2. なぜ Marp なのか
3. デザイン規約とロゴ運用
4. ディレクトリ構成
5. 次の一歩

---

<!-- _class: chapter -->

## Chapter 01

# このプロジェクトの目的

---

# 目的

- Claude Code を活用した **スライドの半自動生成** を実用ラインに乗せる
- 学会・ゼミ・授業など、繰り返し発生する発表を **テンプレ + 中身の差し替え** で完結
- 同一テーマ・ロゴ規約で **複数スライドを横断管理**（年度をまたいでも崩れない）

> Markdown が源泉なので、Claude が差分編集で本領を発揮する。

---

<!-- _class: chapter -->

## Chapter 02

# なぜ Marp なのか

---

<!-- _class: two-col -->

# 採用ツール: Marp

<div class="col">

### 採用理由

- Markdown が源泉
- ローカル完結（クラウド非依存）
- PDF / PPTX / HTML を同一ソースから出力
- CSS でテーマを完全制御

</div>
<div class="col">

### 不採用

- **Slidev**: Vue/Node の前提知識が必要
- **python-pptx**: 1スライドの記述が冗長
- **Beamer**: 日本語フォント運用が重い

</div>

---

# 出力形式

| 形式 | 用途 | 採否 |
|------|------|------|
| **PDF** | 発表本番・配布の標準 | 第一形式 |
| HTML | プレビュー・Web 公開 | 第二形式 |
| PPTX | 共同編集・差し替え依頼時 | 第三形式 |

PPTX 出力では Marp CLI がスライドを画像化するため、 PowerPoint 上でのドラッグ編集はできない点に注意。

---

<!-- _class: chapter -->

## Chapter 03

# デザイン規約とロゴ運用

---

# フォント

- **メイン: BIZ UDPゴシック**（Universal Design Proportional）
  - Google Fonts から `@import` で取得し、PDF に埋め込み
  - 学外PCでも見た目が再現される
- フォールバック: ヒラギノ角ゴ ProN / Yu Gothic / Noto Sans JP
- コード: `JetBrains Mono` / `Menlo`

> 可読性が高く、OFL ライセンスで配布制限がない点が決め手。

---

# ロゴ運用ルール

| シーン | 配置 | 実装 |
|------|------|------|
| タイトル | 右下に大（高さ 80px） | `_class: title` |
| 通常 | 右下に小（高さ 36px） | テーマCSSで自動付与 |
| 章扉 | 配置しない（コントラスト確保） | `_class: chapter` |

**禁止事項**: 単色化・回転・歪み・最小余白侵害・規程外配布。

---

<!-- _class: chapter -->

## Chapter 04

# ディレクトリ構成と次の一歩

---

# ディレクトリ構成

```
marp/
├── design.md              # 判断ログ・運用ルール
├── package.json           # marp-cli を固定
├── assets/                # 共通素材（ロゴ等）
├── themes/utokyo.css      # 自作テーマ
└── decks/
    ├── _template/         # 雛形
    └── sample/slides.md   # ← このスライド
```

`decks/<日付>_<トピック>/` で1発表=1ディレクトリ。

---

<!-- _class: quote -->

# Markdown を書くだけで、 ロゴも体裁も整う。

— Marp Slides Project, 2026

---

# 次の一歩

1. このスライドの見栄えをチェック → テーマCSSを微調整
2. `design.md` の TODO を埋める（公式色 HEX、最初の本番題材）
3. 本番スライドを `decks/2026-05_xxx/` で起票
4. Claude にゼロから初稿を書かせる運用に移行

---

# Q&A

ご清聴ありがとうございました。

- 設計ドキュメント: `design.md`
- ビルド: `npm run build:sample`
- 連絡先: todai-taro@example.com
