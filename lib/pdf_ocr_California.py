import os
import re
import json
from pdf2image import convert_from_path
import pytesseract

# Optional: if Tesseract isn't on PATH, uncomment & set the absolute path
# pytesseract.pytesseract.tesseract_cmd = "/usr/local/bin/tesseract"

ENACTMENT_PHRASE = "The people of the State of California do enact as follows"

# Matches section headers like "SEC. 1", "SEC 2", "SECTION 3", "Section 27002"
SECTION_HDR_RE = re.compile(r'(?:SEC\.?\s*\d+|SECTION\s+\d+|Section\s+\d+)', re.IGNORECASE)

# Top-level article markers: (a), (b), (1), (2), (i), (ii), (iii), (iv), (v), (vi), (vii), (viii), (ix)
# We only treat these as starts of new items when they appear as true markers.
TOP_MARKER_RE = re.compile(
    r'\(\s*(?:'            # opening paren
    r'[a-z]{1,2}'          # a..z (1-2 letters)  -> (a), (aa)
    r'|'
    r'\d{1,3}'             # 1..999              -> (1)
    r'|'
    r'ix|iv|v?i{0,3}'      # roman numerals up to ix
    r')\s*\)\s+'           # closing paren + at least one space after marker
)

def word_count(text: str) -> int:
    return len(re.findall(r'\b[\w\-]+\b', text))

def clean_noise(s: str) -> str:
    # Basic de-noising for common footer/header artifacts from scans
    s = re.sub(r'—\s*\d+\s*—\s*Ch\.\s*\d+', ' ', s)   # e.g., "— 2 — Ch. 321"
    s = re.sub(r'\s+', ' ', s)                        # collapse whitespace
    return s.strip()

def text_after_enactment(full_text: str) -> str:
    idx = full_text.find(ENACTMENT_PHRASE)
    return full_text[idx + len(ENACTMENT_PHRASE):].strip() if idx != -1 else full_text

def extract_articles_from_chunk(chunk: str, current_section: str, doc_title: str, min_words: int = 2):
    """
    From the text belonging to one Section, extract entries that start at each top-level marker
    and run until the next top-level marker. Skip entries with < min_words.
    """
    entries = []
    # Find all marker occurrences and slice between them
    markers = list(TOP_MARKER_RE.finditer(chunk))
    if not markers:
        return entries

    for i, m in enumerate(markers):
        article_number = m.group(0)                   # like "(a) "
        article_number = article_number.strip()       # "(a)"
        article_number = article_number.strip("() ")  # "a"

        start = m.end()                               # text begins after the marker + space
        end = markers[i + 1].start() if i + 1 < len(markers) else len(chunk)
        body = chunk[start:end].strip()

        # Light cleanup of leading punctuation/dashes the OCR may capture
        body = re.sub(r'^[–—-]\s*', '', body)
        body = clean_noise(body)

        wc = word_count(body)
        if wc >= min_words:
            entries.append({
                "kb": doc_title,
                "article_number": article_number,     # e.g., a, b, 1, i, ii
                "type": current_section,              # the section header, e.g., "SEC. 2"
                "text": body,
                "word_count": wc
            })
        # If fewer than min_words, we skip it. This prevents outputs like text="a" (wc=1).

    return entries

def pdf_to_json(pdf_file: str, json_file: str, doc_title: str, min_words: int = 2):
    """
    OCR a law PDF into JSON entries.
    - Ignores introductory material before the enactment phrase if present.
    - Within each Section, extracts top-level markers and their bodies.
    - Skips any entry with fewer than `min_words`.
    """
    # 1) Convert PDF pages to images and OCR
    pages = convert_from_path(pdf_file)
    full_text = ""
    for page in pages:
        full_text += pytesseract.image_to_string(page) + "\n"

    # 2) Normalize & trim
    full_text = clean_noise(full_text)

    # 3) Drop introductory text
    full_text = text_after_enactment(full_text)

    # 4) Split by sections; keep headers
    # Using split that keeps the headers: [..., "SEC. 1", "<text>", "SEC. 2", "<text>", ...]
    parts = re.split(f'({SECTION_HDR_RE.pattern})', full_text)
    entries = []
    current_section = None

    for part in parts:
        if not part or not part.strip():
            continue
        part = part.strip()

        if SECTION_HDR_RE.fullmatch(part):
            current_section = part
            continue

        if current_section:
            # Extract top-level article blocks inside this section
            entries.extend(extract_articles_from_chunk(part, current_section, doc_title, min_words=min_words))
        # If we encounter text before the first section header, we ignore it (safely skipping intros).

    # 5) Save JSON
    os.makedirs(os.path.dirname(json_file), exist_ok=True)
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(entries, f, indent=4, ensure_ascii=False)

    print(f"✅ Extracted {len(entries)} entries (min {min_words} words each) → {json_file}")
    return entries



pdf_to_json("laws_pdf_file/California_state_law.pdf", "laws_json_file/California_state_law.json", "California_state_law", min_words=2)
pdf_to_json("laws_pdf_file/EU_Digital_Service_Act.pdf", "laws_json_file/EU_Digital_Service_Act.json", "EU_Digital_Service", min_words=2)
pdf_to_json("laws_pdf_file/The_Florida_Senate.pdf", "laws_json_file/The_Florida_Senate.json", "The_Florida_Senate", min_words=2)
pdf_to_json("laws_pdf_file/Utah_Social_Media_Regulation_Act.pdf", "laws_json_file/Utah_Social_Media_Regulation_Act.json", "Utah_Social_Media_Regulation_Act", min_words=2)
