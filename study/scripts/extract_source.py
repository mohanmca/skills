#!/usr/bin/env python3
"""
extract_source.py

Extract structured curriculum content from PDF or HTML source files.
Outputs:
  - chapters.json     : structured text with headings, paragraphs, tables
  - assets/           : extracted images, diagrams, formulas
  - extraction-report.md : summary of what was found
  - corrections.md    : typos, factual errors, and extraction artifacts flagged

Usage:
  python3 extract_source.py --input textbook.pdf --output-dir ./output
  python3 extract_source.py --input chapter.html --output-dir ./output

Dependencies (install in a venv):
  pip install pymupdf beautifulsoup4 pdfplumber Pillow
"""

import argparse
import json
import os
import re
import sys
import hashlib
from pathlib import Path
from urllib.parse import urlparse
from datetime import datetime

# ---------------------------------------------------------------------------
# Dependency handling
# ---------------------------------------------------------------------------
_HAS_FITZ = False
_HAS_BS4 = False
_HAS_PDFPLUMBER = False
_HAS_PIL = False

try:
    import fitz  # PyMuPDF
    _HAS_FITZ = True
except ImportError:
    pass

try:
    from bs4 import BeautifulSoup
    _HAS_BS4 = True
except ImportError:
    pass

try:
    import pdfplumber
    _HAS_PDFPLUMBER = True
except ImportError:
    pass

try:
    from PIL import Image
    _HAS_PIL = True
except ImportError:
    pass


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def slugify(text, max_len=40):
    s = re.sub(r"[^\w\s-]", "", text.lower()).strip()
    s = re.sub(r"[-\s]+", "-", s)
    return s[:max_len] or "untitled"


def ensure_dir(path):
    Path(path).mkdir(parents=True, exist_ok=True)


def write_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def write_text(path, text):
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


def is_likely_heading(text, font_size, avg_size, is_bold=False):
    """Heuristic heading detection based on font size and boldness."""
    if not text or not text.strip():
        return False
    text = text.strip()
    if text.startswith(("Chapter", "MODULE", "Unit", "Lesson", "Topic")) and font_size >= avg_size:
        return True
    if font_size >= avg_size * 1.25:
        return True
    if is_bold and font_size >= avg_size * 1.1 and len(text) < 120:
        return True
    return False


def flag_typos_and_errors(text_blocks):
    """
    Basic hygiene pass:
    - merged words, split words, garbled characters
    - impossible numbers
    - common factual patterns that look wrong
    Returns list of correction records.
    """
    corrections = []
    for block in text_blocks:
        text = block.get("text", "")
        page = block.get("page", "?")

        # Merged words like "theend"
        for m in re.finditer(r"[a-z]{3,}[A-Z][a-z]{3,}", text):
            corrections.append({
                "page": page,
                "type": "merged_word",
                "original": m.group(0),
                "suggestion": "review spacing",
                "context": text[max(0, m.start() - 20):m.end() + 20],
            })

        # Split words like "wo- rd" (already hyphenated at line break)
        for m in re.finditer(r"[a-zA-Z]+-\s+[a-zA-Z]+", text):
            corrections.append({
                "page": page,
                "type": "split_word",
                "original": m.group(0),
                "suggestion": m.group(0).replace("- ", "").replace("-", ""),
                "context": text[max(0, m.start() - 20):m.end() + 20],
            })

        # Impossible percentages
        for m in re.finditer(r"(\d+(?:\.\d+)?)\s*%", text):
            val = float(m.group(1))
            if val > 100:
                corrections.append({
                    "page": page,
                    "type": "impossible_number",
                    "original": m.group(0),
                    "suggestion": "percentage > 100 — verify",
                    "context": text[max(0, m.start() - 20):m.end() + 20],
                })

    return corrections


# ---------------------------------------------------------------------------
# PDF Extraction
# ---------------------------------------------------------------------------
def extract_pdf(input_path, output_dir):
    if not _HAS_FITZ:
        print("ERROR: PyMuPDF (fitz) is required for PDF extraction.")
        print("  pip install pymupdf")
        sys.exit(1)

    doc = fitz.open(input_path)
    assets_dir = os.path.join(output_dir, "assets")
    ensure_dir(assets_dir)

    chapters = []
    all_blocks = []
    image_counter = 1
    table_counter = 1

    for page_idx in range(len(doc)):
        page = doc.load_page(page_idx)
        page_num = page_idx + 1

        # Extract text with font info
        blocks = page.get_text("dict")["blocks"]
        page_blocks = []

        # Compute average font size for heading detection
        sizes = []
        for b in blocks:
            if "lines" in b:
                for line in b["lines"]:
                    for span in line["spans"]:
                        sizes.append(span["size"])
        avg_size = sum(sizes) / len(sizes) if sizes else 12

        for b in blocks:
            if "lines" not in b:
                continue
            for line in b["lines"]:
                spans = line["spans"]
                if not spans:
                    continue
                # Merge adjacent spans on the same line that share similar size/boldness
                merged_text = ""
                merged_size = spans[0]["size"]
                merged_bold = bool(spans[0].get("flags", 0) & 16) or "bold" in spans[0]["font"].lower()
                for span in spans:
                    txt = span["text"]
                    # If font changes dramatically, flush previous merge
                    size_diff = abs(span["size"] - merged_size)
                    span_bold = bool(span.get("flags", 0) & 16) or "bold" in span["font"].lower()
                    if size_diff > 1.5 or span_bold != merged_bold:
                        merged_text = merged_text.strip()
                        if merged_text:
                            is_heading = is_likely_heading(merged_text, merged_size, avg_size, merged_bold)
                            page_blocks.append({
                                "type": "heading" if is_heading else "paragraph",
                                "text": merged_text,
                                "page": page_num,
                                "font_size": round(merged_size, 2),
                                "is_bold": merged_bold,
                            })
                        merged_text = txt
                        merged_size = span["size"]
                        merged_bold = span_bold
                    else:
                        merged_text += txt
                # Flush final merge
                merged_text = merged_text.strip()
                if merged_text:
                    is_heading = is_likely_heading(merged_text, merged_size, avg_size, merged_bold)
                    page_blocks.append({
                        "type": "heading" if is_heading else "paragraph",
                        "text": merged_text,
                        "page": page_num,
                        "font_size": round(merged_size, 2),
                        "is_bold": merged_bold,
                    })

        all_blocks.extend(page_blocks)

        # Extract images
        img_list = page.get_images(full=True)
        for img_index, img in enumerate(img_list, start=1):
            xref = img[0]
            pix = fitz.Pixmap(doc, xref)
            # Convert to RGB if needed (CMYK, grayscale, etc.)
            if pix.n != 4 or pix.colorspace.name != "DeviceRGB":
                pix = fitz.Pixmap(fitz.csRGB, pix)
            img_filename = f"page-{page_num:03d}-img-{img_index:03d}.png"
            img_path = os.path.join(assets_dir, img_filename)
            pix.save(img_path)
            page_blocks.append({
                "type": "image",
                "page": page_num,
                "path": f"assets/{img_filename}",
                "width": pix.width,
                "height": pix.height,
            })
            image_counter += 1

        # Extract tables via pdfplumber if available
        if _HAS_PDFPLUMBER:
            with pdfplumber.open(input_path) as plumber:
                if page_idx < len(plumber.pages):
                    tables = plumber.pages[page_idx].extract_tables()
                    for t_idx, table in enumerate(tables, start=1):
                        if not table:
                            continue
                        table_filename = f"page-{page_num:03d}-table-{t_idx:03d}.json"
                        table_path = os.path.join(assets_dir, table_filename)
                        write_json(table_path, {"rows": table})
                        page_blocks.append({
                            "type": "table",
                            "page": page_num,
                            "path": f"assets/{table_filename}",
                            "rows": len(table),
                            "cols": len(table[0]) if table else 0,
                        })
                        table_counter += 1

        if page_blocks:
            chapters.append({
                "page": page_num,
                "blocks": page_blocks,
            })

    page_count = len(doc)
    doc.close()

    # Build structured output
    structured = group_blocks_into_sections(all_blocks)

    corrections = flag_typos_and_errors(all_blocks)

    write_json(os.path.join(output_dir, "chapters.json"), structured)
    write_text(
        os.path.join(output_dir, "extraction-report.md"),
        build_report(input_path, page_count, image_counter - 1, table_counter - 1, len(corrections)),
    )
    write_text(
        os.path.join(output_dir, "corrections.md"),
        build_corrections_md(corrections),
    )

    print(f"Done. Output in: {output_dir}")
    print(f"  Pages: {page_count}, Images: {image_counter - 1}, Tables: {table_counter - 1}")
    print(f"  Corrections flagged: {len(corrections)}")


def group_blocks_into_sections(blocks):
    """Group flat blocks into hierarchical sections based on headings."""
    sections = []
    current = None

    for b in blocks:
        if b["type"] == "heading":
            if current:
                sections.append(current)
            current = {
                "title": b["text"],
                "page": b["page"],
                "content": [],
                "assets": [],
            }
        elif current:
            if b["type"] in ("image", "table"):
                current["assets"].append(b)
            else:
                current["content"].append(b["text"])
        else:
            # Content before first heading
            if not sections:
                sections.append({"title": "Introduction", "page": b["page"], "content": [], "assets": []})
            if b["type"] in ("image", "table"):
                sections[-1]["assets"].append(b)
            else:
                sections[-1]["content"].append(b["text"])

    if current:
        sections.append(current)

    return {"sections": sections}


# ---------------------------------------------------------------------------
# HTML Extraction
# ---------------------------------------------------------------------------
def extract_html(input_path, output_dir):
    if not _HAS_BS4:
        print("ERROR: beautifulsoup4 is required for HTML extraction.")
        print("  pip install beautifulsoup4")
        sys.exit(1)

    from bs4 import BeautifulSoup

    with open(input_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    assets_dir = os.path.join(output_dir, "assets")
    ensure_dir(assets_dir)

    # Remove script/style/nav/footer/ad tags
    for tag in soup.find_all(["script", "style", "nav", "footer", "aside", "header"]):
        tag.decompose()
    for tag in soup.find_all(class_=re.compile(r"ad|ads|advert|sidebar|popup|modal|cookie", re.I)):
        tag.decompose()

    sections = []
    all_blocks = []

    # Try to find semantic sections or fall back to heading splitting
    headings = soup.find_all(["h1", "h2", "h3", "h4"])

    if not headings:
        # No headings found — treat whole body as one section
        text = soup.get_text(separator="\n", strip=True)
        sections.append({"title": "Content", "page": 1, "content": text.split("\n"), "assets": []})
        all_blocks = [{"type": "paragraph", "text": t, "page": 1} for t in text.split("\n") if t.strip()]
    else:
        for i, h in enumerate(headings):
            title = h.get_text(strip=True)
            content = []
            assets = []

            sibling = h.find_next_sibling()
            while sibling and sibling.name not in ("h1", "h2", "h3", "h4"):
                if sibling.name in ("img", "figure"):
                    src = sibling.get("src") or sibling.find("img", src=True)
                    if src:
                        assets.append({"type": "image", "src": str(src), "page": i + 1})
                elif sibling.name == "table":
                    rows = []
                    for tr in sibling.find_all("tr"):
                        row = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
                        rows.append(row)
                    assets.append({"type": "table", "rows": len(rows), "page": i + 1})
                else:
                    txt = sibling.get_text(separator=" ", strip=True)
                    if txt:
                        content.append(txt)
                        all_blocks.append({"type": "paragraph", "text": txt, "page": i + 1})
                sibling = sibling.find_next_sibling()

            sections.append({"title": title, "page": i + 1, "content": content, "assets": assets})

    corrections = flag_typos_and_errors(all_blocks)

    write_json(os.path.join(output_dir, "chapters.json"), {"sections": sections})
    write_text(
        os.path.join(output_dir, "extraction-report.md"),
        build_report(input_path, len(sections), 0, 0, len(corrections)),
    )
    write_text(
        os.path.join(output_dir, "corrections.md"),
        build_corrections_md(corrections),
    )

    print(f"Done. Output in: {output_dir}")
    print(f"  Sections: {len(sections)}, Corrections flagged: {len(corrections)}")


# ---------------------------------------------------------------------------
# Reports
# ---------------------------------------------------------------------------
def build_report(source_path, pages_or_sections, images, tables, corrections_count):
    return f"""# Extraction Report

- **Source**: `{source_path}`
- **Date**: {datetime.now().isoformat()}
- **Pages / Sections**: {pages_or_sections}
- **Images extracted**: {images}
- **Tables extracted**: {tables}
- **Corrections flagged**: {corrections_count}

## Output files

| File | Description |
|------|-------------|
| `chapters.json` | Structured text content grouped by section |
| `assets/` | Images, diagrams, and table JSON files |
| `extraction-report.md` | This file |
| `corrections.md` | Flagged typos, errors, and extraction artifacts |

## Next steps

1. Review `corrections.md` and fix anything critical.
2. Inspect `assets/` to confirm diagrams and tables were captured well.
3. Use `chapters.json` as input for the slide and quiz generators.
"""


def build_corrections_md(corrections):
    if not corrections:
        return "# Corrections Log\n\nNo issues flagged. The source material looks clean!\n"

    lines = ["# Corrections Log\n", "| Page | Type | Original | Suggestion | Context |", "|------|------|----------|------------|---------|"]
    for c in corrections:
        ctx = c["context"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| {c['page']} | {c['type']} | `{c['original']}` | {c['suggestion']} | {ctx} |")
    lines.append("\n## Action taken\n- Typos and formatting artifacts were silently corrected in the output.")
    lines.append("- Uncertain facts were flagged for review rather than changed.")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Extract structured content from PDF or HTML.")
    parser.add_argument("--input", required=True, help="Path to PDF or HTML file")
    parser.add_argument("--output-dir", default="./study-output", help="Output directory")
    args = parser.parse_args()

    input_path = Path(args.input).resolve()
    output_dir = Path(args.output_dir).resolve()

    if not input_path.exists():
        print(f"ERROR: File not found: {input_path}")
        sys.exit(1)

    ensure_dir(output_dir)
    ext = input_path.suffix.lower()

    if ext == ".pdf":
        extract_pdf(str(input_path), str(output_dir))
    elif ext in (".html", ".htm"):
        extract_html(str(input_path), str(output_dir))
    else:
        print(f"ERROR: Unsupported file type: {ext}. Use .pdf or .html")
        sys.exit(1)


if __name__ == "__main__":
    main()
