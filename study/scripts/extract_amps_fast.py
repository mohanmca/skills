#!/usr/bin/env python3
"""
Fast extraction for large PDFs. Extracts text structure and tables,
skips heavy image extraction.
"""
import argparse
import json
import os
import re
import sys
from pathlib import Path
from datetime import datetime

try:
    import fitz
except ImportError:
    print("pip install pymupdf")
    sys.exit(1)

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

def ensure_dir(path):
    Path(path).mkdir(parents=True, exist_ok=True)

def write_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def write_text(path, text):
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)

def is_likely_heading(text, font_size, avg_size, is_bold=False):
    if not text or not text.strip():
        return False
    text = text.strip()
    if len(text) <= 2:
        return False
    if text.isdigit():
        return False
    if text.startswith(("Chapter", "MODULE", "Unit", "Lesson", "Topic", "Exercise")) and font_size >= avg_size:
        return True
    if font_size >= avg_size * 1.35 and len(text) < 150:
        return True
    if is_bold and font_size >= avg_size * 1.15 and len(text) < 120:
        return True
    return False

def extract_pdf_fast(input_path, output_dir):
    doc = fitz.open(input_path)
    ensure_dir(output_dir)
    assets_dir = os.path.join(output_dir, "assets")
    ensure_dir(assets_dir)

    all_blocks = []
    table_counter = 1
    page_count = len(doc)

    # Pre-open pdfplumber once
    plumber_doc = pdfplumber.open(input_path) if pdfplumber else None

    print(f"Processing {page_count} pages...")

    for page_idx in range(page_count):
        if page_idx % 100 == 0:
            print(f"  Page {page_idx + 1}/{page_count}")

        page = doc.load_page(page_idx)
        page_num = page_idx + 1

        blocks = page.get_text("dict")["blocks"]
        page_blocks = []

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
                line_text = "".join(s["text"] for s in spans).strip()
                if not line_text:
                    continue
                max_size = max(s["size"] for s in spans)
                any_bold = any(
                    bool(s.get("flags", 0) & 16) or "bold" in s["font"].lower()
                    for s in spans
                )
                is_heading = is_likely_heading(line_text, max_size, avg_size, any_bold)
                page_blocks.append({
                    "type": "heading" if is_heading else "paragraph",
                    "text": line_text,
                    "page": page_num,
                    "font_size": round(max_size, 2),
                    "is_bold": any_bold,
                })

        all_blocks.extend(page_blocks)

        # Tables via pdfplumber (single open)
        if plumber_doc and page_idx < len(plumber_doc.pages):
            tables = plumber_doc.pages[page_idx].extract_tables()
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

    doc.close()
    if plumber_doc:
        plumber_doc.close()

    structured = group_blocks_into_sections(all_blocks)
    write_json(os.path.join(output_dir, "chapters.json"), structured)

    report = f"""# Extraction Report

- **Source**: `{input_path}`
- **Date**: {datetime.now().isoformat()}
- **Pages**: {page_count}
- **Images extracted**: 0 (skipped for speed)
- **Tables extracted**: {table_counter - 1}
- **Sections detected**: {len(structured.get('sections', []))}

## Output files

| File | Description |
|------|-------------|
| `chapters.json` | Structured text content grouped by section |
| `assets/` | Table JSON files |
| `extraction-report.md` | This file |
"""
    write_text(os.path.join(output_dir, "extraction-report.md"), report)
    print(f"Done. {page_count} pages, {table_counter - 1} tables, {len(structured.get('sections', []))} sections.")

def merge_short_headings(blocks):
    merged = []
    buffer = []
    for b in blocks:
        if b["type"] == "heading" and len(b["text"]) <= 30:
            buffer.append(b)
        else:
            if buffer:
                total_len = sum(len(x["text"]) for x in buffer)
                if total_len <= 80 and len(buffer) >= 2:
                    merged.append({
                        "type": "heading",
                        "text": " ".join(x["text"] for x in buffer),
                        "page": buffer[0]["page"],
                        "font_size": buffer[0]["font_size"],
                        "is_bold": buffer[0]["is_bold"],
                    })
                else:
                    merged.extend(buffer)
                buffer = []
            merged.append(b)
    if buffer:
        total_len = sum(len(x["text"]) for x in buffer)
        if total_len <= 80 and len(buffer) >= 2:
            merged.append({
                "type": "heading",
                "text": " ".join(x["text"] for x in buffer),
                "page": buffer[0]["page"],
                "font_size": buffer[0]["font_size"],
                "is_bold": buffer[0]["is_bold"],
            })
        else:
            merged.extend(buffer)
    return merged

def filter_noise(blocks):
    text_page_counts = {}
    for b in blocks:
        text = b["text"].strip()
        if len(text) <= 15 and b["type"] == "paragraph":
            text_page_counts[text] = text_page_counts.get(text, 0) + 1
    running_headers = {text for text, count in text_page_counts.items() if count >= 3}

    cleaned = []
    for b in blocks:
        text = b["text"].strip()
        if text.isdigit() and len(text) <= 3:
            continue
        if len(text) <= 2 and b["type"] == "paragraph":
            continue
        if text.lower().startswith("reprint"):
            continue
        if text in running_headers:
            continue
        cleaned.append(b)
    return cleaned

def group_blocks_into_sections(blocks):
    blocks = merge_short_headings(blocks)
    blocks = filter_noise(blocks)
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
            if b["type"] == "table":
                current["assets"].append(b)
            else:
                current["content"].append(b["text"])
        else:
            if not sections:
                sections.append({"title": "Introduction", "page": b["page"], "content": [], "assets": []})
            if b["type"] == "table":
                sections[-1]["assets"].append(b)
            else:
                sections[-1]["content"].append(b["text"])

    if current:
        sections.append(current)

    return {"sections": sections}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output-dir", default="./study-output")
    args = parser.parse_args()
    extract_pdf_fast(args.input, args.output_dir)
