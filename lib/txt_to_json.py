import os
import json
import re

def txt_to_json(laws_txt_file, laws_json_file, pdf_title):
    """
    Convert a TXT file of laws into structured JSON.
    """
    # Step 1: Read text file
    if not os.path.exists(laws_txt_file):
        raise FileNotFoundError(f"{laws_txt_file} not found")
    
    with open(laws_txt_file, "r", encoding="utf-8") as f:
        full_text = f.read()
    
    # Step 2: Clean text (normalize spaces, remove weird line breaks)
    cleaned_text = re.sub(r'\s+', ' ', full_text).strip()
    
    # Step 3: Split into sections/articles
    # Split on SECTION, Section, or numbered points (like (1), (11), 1.)
    pattern = r'(SECTION\s+\d+|Section\s+\d+|\(\d+\)|\d+\.)'
    chunks = re.split(f'({pattern})', cleaned_text)
    
    # Step 4: Build structured JSON
    entries = []
    current_section = None
    article_number = None
    
    for chunk in chunks:
        chunk = chunk.strip()
        if not chunk:
            continue

        # Detect new Section
        if re.match(r'(SECTION\s+\d+|Section\s+\d+)', chunk, re.IGNORECASE):
            current_section = chunk
            article_number = chunk.split()[-1]
        
        # Detect numbered article/point
        elif re.match(r'^\(?\d+\)?\.?$', chunk):
            article_number = chunk.strip("().")
        
        else:
            entry = {
                "kb": pdf_title,
                "article number": article_number,
                "type": "section" if current_section else "article",
                "section": current_section,
                "text": chunk,
                "word count": len(chunk.split())
            }
            entries.append(entry)
    
    # Step 5: Save JSON
    os.makedirs(os.path.dirname(laws_json_file), exist_ok=True)
    with open(laws_json_file, "w", encoding="utf-8") as f:
        json.dump(entries, f, indent=4, ensure_ascii=False)
    
    print(f"✅ Extracted {len(entries)} entries and saved to {laws_json_file}")
    return entries

# Example usage
laws_txt_file = "laws_pdf_file/Reporting_requirements_of_providers.txt"
laws_json_file = "laws_json_file/Reporting_requirements_of_providers.json"

txt_to_json(laws_txt_file, laws_json_file, "Reporting_requirements_of_providers")
