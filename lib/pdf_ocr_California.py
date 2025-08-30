import os
import re
import json
from pdf2image import convert_from_path
import pytesseract

def pdf_to_json(pdf_file, json_file, doc_title):
    """
    Convert a law PDF into structured JSON using OCR.
    Each JSON entry corresponds to one section marker (a, b, 1, 2, i, ii...).
    """
    # Step 1: Convert PDF to images
    pages = convert_from_path(pdf_file)

    # Step 2: OCR each page
    full_text = ""
    for page in pages:
        text = pytesseract.image_to_string(page)
        full_text += text + "\n"

    # Step 3: Clean and normalize spaces
    full_text = re.sub(r'\s+', ' ', full_text).strip()

    # Step 4: Ignore everything before enactment phrase
    enactment_phrase = "The people of the State of California do enact as follows"
    if enactment_phrase in full_text:
        full_text = full_text.split(enactment_phrase, 1)[1].strip()

    # Step 5: Split by sections (SEC. 1, SEC. 2, Section 1...)
    section_pattern = r'(SEC\.?\s*\d+|Section\s+\d+|SECTION\s+\d+)'
    raw_sections = re.split(f'({section_pattern})', full_text)

    entries = []
    current_section = None

    for chunk in raw_sections:
        chunk = chunk.strip()
        if not chunk:
            continue

        # If it's a section header (SEC. 1 etc.)
        if re.match(section_pattern, chunk, re.IGNORECASE):
            current_section = chunk
            continue

        # Inside section → split by markers (a), (b), (1), (i), (ii)
        # But we don’t split again if markers appear inside one section
        marker_pattern = r'\(([a-z]+|\d+|i{1,3}|iv|v|vi{0,3})\)'  # matches (a), (b), (1), (i)...
        parts = re.split(f'({marker_pattern})', chunk)

        current_article = None
        buffer = ""

        for part in parts:
            part = part.strip()
            if not part:
                continue

            # If part is a marker (like (a), (1))
            if re.match(marker_pattern, part):
                # Save previous buffer as entry
                if buffer and current_article:
                    entry = {
                        "kb": doc_title,
                        "article_number": current_article,
                        "type": current_section,
                        "text": buffer.strip(),
                        "word_count": len(buffer.split())
                    }
                    entries.append(entry)
                    buffer = ""

                # Update current marker
                current_article = part.strip("()")
            else:
                buffer += " " + part

        # Save last buffer
        if buffer and current_article:
            entry = {
                "kb": doc_title,
                "article_number": current_article,
                "type": current_section,
                "text": buffer.strip(),
                "word_count": len(buffer.split())
            }
            entries.append(entry)

    # Step 6: Save to JSON
    os.makedirs(os.path.dirname(json_file), exist_ok=True)
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(entries, f, indent=4, ensure_ascii=False)

    print(f"✅ Extracted {len(entries)} sections and saved to {json_file}")
    return entries


# Example usage
pdf_file = "laws_pdf_file/California_state_law.pdf"
json_file = "laws_json_file/California_state_law.json"
pdf_to_json(pdf_file, json_file, "California_state_law")
