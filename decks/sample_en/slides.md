---
marp: true
theme: utokyo
paginate: true
size: 16:9
logo: true
class: lang-en
---

<!-- _class: title -->

# Marp Slides — Theme Check (EN)

## Inter × University of Tokyo Communication Mark

<div class="meta">
<p class="affil">{{affil_en}}</p>
<p class="name">{{name_en}}</p>
<p class="date">2026-05-02</p>
</div>

<img src="../../assets/utokyo_logotype.png" class="title-logo" alt="" />

---

# Agenda

1. Purpose of this project
2. Why Marp
3. Design rules and logo usage
4. Directory layout
5. Next steps

---

<!-- _class: chapter -->

## Chapter 01

# Purpose of this project

---

# Purpose

- Bring Claude Code-assisted slide generation to a practical level
- Handle recurring talks (conferences, seminars, classes) as template + content swap
- Manage multiple decks under one theme and logo policy, stable across years

> Because Markdown is the source, Claude excels at diff-based editing.

---

<!-- _class: chapter -->

## Chapter 02

# Why Marp

---

<!-- _class: two-col -->

# Tool of choice: Marp

<div class="col">

### Why adopted

- Markdown is the source
- Fully local (no cloud dependency)
- PDF / PPTX / HTML from one source
- Full theme control via CSS

</div>
<div class="col">

### Not adopted

- Slidev: requires Vue/Node knowledge
- python-pptx: verbose per slide
- Beamer: heavy Japanese font handling

</div>

---

# Output formats

| Format | Use | Status |
|--------|-----|--------|
| PDF | Standard for talks and handouts | Primary |
| HTML | Preview and web publishing | Secondary |
| PPTX | Co-editing and handoff requests | Tertiary |

PPTX export rasterizes slides, so drag-editing in PowerPoint is not possible.

---

<!-- _class: chapter -->

## Chapter 03

# Design rules and logo usage

---

# Typography

- Body (English): Inter — high legibility, neutral letterforms
  - Imported from Google Fonts and embedded into the PDF
  - Renders consistently on machines without the font installed
- Fallback: Helvetica Neue / Arial / system-ui
- Code: JetBrains Mono / Menlo

> For Japanese decks the body switches to BIZ UDPGothic (default theme).

---

# Logo policy

| Scene | Placement | Implementation |
|-------|-----------|----------------|
| Title | Large, bottom-right (80px) | `_class: title` |
| Normal | Small, bottom-right (36px) | auto via theme CSS |
| Chapter | None (preserve contrast) | `_class: chapter` |

Prohibited: recoloring, rotation, distortion, margin violation, out-of-spec distribution.

---

<!-- _class: chapter -->

## Chapter 04

# Directory layout and next steps

---

# Directory layout

```
marp/
├── design.md              # decision log and rules
├── package.json           # pins marp-cli
├── profile.yaml           # shared profile (name, affil, ...)
├── assets/                # shared assets (logo, etc.)
├── themes/utokyo.css      # custom theme
└── decks/
    ├── _template/         # skeleton
    ├── sample/slides.md   # Japanese sample
    └── sample_en/slides.md  # ← this deck
```

One talk = one directory under `decks/<date>_<topic>/`.

---

<!-- _class: quote -->

# Just write Markdown — logo and layout fall into place.

— Marp Slides Project, 2026

---

# Next steps

1. Check this deck's appearance, then fine-tune the theme CSS
2. Fill in the TODOs in `design.md` (official color HEX, first real topic)
3. Start a real deck under `decks/2026-05_xxx/`
4. Move to having Claude draft the first version from scratch

---

# Q&A

Thank you for your attention.

- Design doc: `design.md`
- Build: `npm run build -- decks/sample_en`
- Contact: {{email}}
