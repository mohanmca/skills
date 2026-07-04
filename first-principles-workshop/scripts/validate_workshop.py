#!/usr/bin/env python3
"""Validate a generated first-principles workshop HTML file."""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
from pathlib import Path


def extract_data(text: str) -> tuple[dict | None, list[str]]:
    warnings: list[str] = []
    match = re.search(
        r'<script[^>]+id=["\']workshop-data["\'][^>]*>(.*?)</script>',
        text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if not match:
        warnings.append("No <script id=\"workshop-data\" type=\"application/json\"> block found.")
        return None, warnings
    payload = html.unescape(match.group(1)).strip()
    try:
        return json.loads(payload), warnings
    except json.JSONDecodeError as exc:
        warnings.append(f"Workshop data JSON did not parse: {exc}")
        return None, warnings


def has_any_key(item: dict, keys: tuple[str, ...]) -> bool:
    return any(bool(item.get(key)) for key in keys)


def validate_data(data: dict) -> tuple[list[str], list[str]]:
    failures: list[str] = []
    warnings: list[str] = []
    modules = data.get("modules")
    if not isinstance(modules, list) or not modules:
        failures.append("Workshop data must contain a non-empty modules array.")
        return failures, warnings

    final_question_count = 0
    for module_index, module in enumerate(modules, start=1):
        label = module.get("id") or f"module-{module_index:02d}"
        slides = module.get("slides")
        if not isinstance(slides, list):
            failures.append(f"{label}: slides must be an array.")
            slides = []
        if len(slides) < 12 or len(slides) > 15:
            failures.append(f"{label}: expected 12-15 teaching slides, found {len(slides)}.")

        diagram_count = 0
        for slide_index, slide in enumerate(slides, start=1):
            slide_label = f"{label} slide {slide_index}"
            if not slide.get("title"):
                failures.append(f"{slide_label}: missing title.")
            if not slide.get("why"):
                failures.append(f"{slide_label}: missing why.")
            if not has_any_key(slide, ("principle", "firstPrinciple", "first_principle")):
                failures.append(f"{slide_label}: missing first-principles teaching point.")
            if not has_any_key(slide, ("memoryHook", "memory_hook", "hook")):
                failures.append(f"{slide_label}: missing memory hook.")
            diagram = slide.get("diagramSvg") or slide.get("diagram_svg") or ""
            if "<svg" in str(diagram).lower():
                diagram_count += 1
        if diagram_count == 0:
            warnings.append(f"{label}: no inline SVG diagrams found in slides.")

        quiz = module.get("quiz") or {}
        questions = quiz.get("questions")
        if not isinstance(questions, list) or not questions:
            failures.append(f"{label}: module quiz must contain questions.")
            questions = []
        final_question_count += len(questions)
        for question_index, question in enumerate(questions, start=1):
            question_label = f"{label} quiz question {question_index}"
            options = question.get("options")
            if not question.get("prompt") and not question.get("question"):
                failures.append(f"{question_label}: missing prompt.")
            if not isinstance(options, list) or len(options) < 2:
                failures.append(f"{question_label}: needs at least two answer options.")
                continue
            if all(isinstance(option, str) for option in options):
                if question.get("answer") != 0:
                    failures.append(f"{question_label}: canonical quiz format must store the correct answer with answer: 0.")
                if len(options) != 4:
                    warnings.append(f"{question_label}: expected 4 answer options, found {len(options)}.")
            elif all(isinstance(option, dict) for option in options):
                correct_count = sum(1 for option in options if option.get("correct") is True)
                if correct_count != 1:
                    failures.append(f"{question_label}: expected exactly one correct option, found {correct_count}.")
                warnings.append(f"{question_label}: uses legacy correct:true option format; prefer options as strings with answer: 0.")
            else:
                failures.append(f"{question_label}: options must be all strings or all option objects.")
            if not question.get("explanation"):
                failures.append(f"{question_label}: missing explanation.")
    if final_question_count == 0:
        failures.append("Final exam cannot be built because module quizzes contain no questions.")
    return failures, warnings


def validate_static(text: str) -> tuple[list[str], list[str]]:
    lower = text.lower()
    failures: list[str] = []
    warnings: list[str] = []
    required = [
        ("keyboard navigation", "addeventlistener(\"keydown" in lower or "onkeydown" in lower),
        ("print CSS", "@media print" in lower),
        ("final exam control", "final exam" in lower),
        ("module quiz control", "module quiz" in lower or "quiz" in lower),
        ("inline SVG", "<svg" in lower),
        ("answer randomization", "shuffle(" in lower or "math.random" in lower),
        ("print trigger", "window.print" in lower),
        ("light theme declaration", "color-scheme: light" in lower),
        ("page number display", "page" in lower and "pagenumber" in lower),
        ("table of contents", "table of contents" in lower or "toc" in lower),
        ("progress persistence", "localstorage" in lower and "store_key" in lower),
        ("retry missed questions", "retry missed" in lower or "failedquestion" in lower),
        ("speaker notes", "speaker notes" in lower or "notespanel" in lower),
        ("fullscreen toggle", "requestfullscreen" in lower),
    ]
    for name, ok in required:
        if not ok:
            failures.append(f"Missing {name}.")
    if "alert(" in lower or "confirm(" in lower or "prompt(" in lower:
        warnings.append("Avoid alert(), confirm(), and prompt(); use inline feedback.")
    return failures, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("html_file", type=Path)
    parser.add_argument("--strict", action="store_true", help="Treat warnings as failures.")
    args = parser.parse_args()

    if not args.html_file.exists():
        print(f"FAIL: {args.html_file} does not exist.", file=sys.stderr)
        return 1

    text = args.html_file.read_text(encoding="utf-8")
    failures, warnings = validate_static(text)
    data, data_warnings = extract_data(text)
    warnings.extend(data_warnings)
    if data is not None:
        data_failures, data_warnings = validate_data(data)
        failures.extend(data_failures)
        warnings.extend(data_warnings)

    for warning in warnings:
        print(f"WARN: {warning}")
    for failure in failures:
        print(f"FAIL: {failure}")

    if failures or (args.strict and warnings):
        print("Workshop validation failed.")
        return 1
    print("Workshop validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
