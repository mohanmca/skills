import json
import os
import re
import argparse

def extract_flashcards(chapters):
    """Identifies 'Concept: Definition' pairs and key facts."""
    flashcards = []
    # Simple regex pattern for concept: definition or concept - definition
    pattern = re.compile(r'^([^:]{3,30})[:\s-]+(.{10,200})$')
    
    for chapter in chapters:
        for section in chapter.get('sections', []):
            for content in section.get('content', []):
                # Check for list items or short paragraphs that look like definitions
                match = pattern.match(content)
                if match:
                    flashcards.append({
                        "id": f"fc-{len(flashcards):03d}",
                        "front": match.group(1).strip(),
                        "back": match.group(2).strip(),
                        "sourceModule": chapter.get('moduleId', 'unknown')
                    })
    return flashcards

def generate_mermaid_logic(chapters):
    """Heuristic to generate Mermaid diagram syntax from structural markers."""
    # This is a simplified version; in practice, it could be more complex
    mermaid_blocks = {}
    for chapter in chapters:
        # Example: if chapter mentions 'Workflow' or 'Architecture', generate a flowchart
        if 'Workflow' in chapter.get('title', '') or 'Process' in chapter.get('title', ''):
            mermaid_blocks[chapter['moduleId']] = "graph TD\n  A[Start] --> B[Process]\n  B --> C[End]"
    return mermaid_blocks

def generate_socratic_hints(quizzes):
    """Adds 3-step progressive hints to each quiz question."""
    for quiz in quizzes:
        for question in quiz.get('questions', []):
            if 'hints' not in question or not question['hints']:
                # Basic template for hints if not provided
                question['hints'] = [
                    "Think about the core concept mentioned in the chapter.",
                    "Look for clues in the wording of the question.",
                    f"The answer relates to {question.get('concept', 'the main topic')}."
                ]
    return quizzes

def main():
    parser = argparse.ArgumentParser(description="Extract extended study artifacts.")
    parser.add_argument("--input-dir", required=True, help="Directory containing chapters.json and quizzes/")
    parser.add_argument("--output-dir", required=True, help="Directory to save extended artifacts")
    args = parser.parse_args()

    chapters_path = os.path.join(args.input_dir, "chapters.json")
    if not os.path.exists(chapters_path):
        print(f"Error: {chapters_path} not found.")
        return

    with open(chapters_path, 'r') as f:
        data = json.load(f)

    # Handle both a list of chapters or a single chapter object
    if isinstance(data, list):
        chapters = data
    elif isinstance(data, dict):
        if 'sections' in data:
            chapters = [data]
        else:
            chapters = [] # Fallback
    else:
        chapters = []

    # 1. Extract Flashcards
    flashcards = extract_flashcards(chapters)
    os.makedirs(os.path.join(args.output_dir, "flashcards"), exist_ok=True)
    with open(os.path.join(args.output_dir, "flashcards", "flashcards.json"), 'w') as f:
        json.dump(flashcards, f, indent=2)

    # 2. Generate Mermaid Logic (and update chapters)
    mermaid_data = generate_mermaid_logic(chapters)
    for chapter in chapters:
        mid = chapter.get('moduleId', 'm1')
        if mid in mermaid_data:
            # Attach mermaid to the first slide or relevant section
            chapter['mermaid'] = mermaid_data[mid]
    
    with open(os.path.join(args.output_dir, "chapters_enriched.json"), 'w') as f:
        json.dump(chapters, f, indent=2)

    print(f"Extended artifacts generated in {args.output_dir}")

if __name__ == "__main__":
    main()
