import os
import re
import json
from pdf2image import convert_from_path
import pytesseract

# Optional: set tesseract path if not in PATH
# pytesseract.pytesseract.tesseract_cmd = "/usr/local/bin/tesseract"

# Matches article headers: "Article 21", "ARTICLE 5"
ARTICLE_HDR_RE = re.compile(r'(?:Article\s+\d+)', re.IGNORECASE)

# Top-level article markers: (a), (b), (1), (2), (i), (ii)...
TOP_MARKER_RE = re.compile(
    r'\(\s*(?:'
    r'[a-z]{1,2}'          # (a), (aa)
    r'|'
    r'\d{1,3}'             # (1), (22)
    r'|'
    r'ix|iv|v?i{0,3}'      # roman numerals up to (ix)
    r')\s*\)\s+'
)

def word_count(text: str) -> int:
    return len(re.findall(r'\b[\w\-]+\b', text))

def clean_noise(s: str) -> str:
    # remove page headers/footers
    s = re.sub(r'EN Official Journal.*?\d{4}', ' ', s)
    s = re.sub(r'\s+', ' ', s)
    return s.strip()

def extract_articles_from_chunk(chunk: str, current_article: str, doc_title: str, min_words: int = 2):
    entries = []
    markers = list(TOP_MARKER_RE.finditer(chunk))

    # If no (a)/(1) etc. markers, treat whole article as one block
    if not markers:
        body = clean_noise(chunk)
        wc = word_count(body)
        if wc >= min_words:
            entries.append({
                "kb": doc_title,
                "article_number": None,
                "type": current_article,
                "text": body,
                "word_count": wc
            })
        return entries

    for i, m in enumerate(markers):
        article_number = m.group(0).strip("() ").strip()
        start = m.end()
        end = markers[i + 1].start() if i + 1 < len(markers) else len(chunk)
        body = chunk[start:end].strip()
        body = clean_noise(body)

        wc = word_count(body)
        if wc >= min_words:
            entries.append({
                "kb": doc_title,
                "article_number": article_number,
                "type": current_article,
                "text": body,
                "word_count": wc
            })
    return entries

def pdf_to_json(pdf_file: str, json_file: str, doc_title: str, min_words: int = 2):
    # 1. OCR all pages
    pages = convert_from_path(pdf_file)
    full_text = ""
    for page in pages:
        full_text += pytesseract.image_to_string(page) + "\n"

    # 2. Normalize
    full_text = clean_noise(full_text)

    # 3. Split by "Article <num>"
    parts = re.split(f'({ARTICLE_HDR_RE.pattern})', full_text)
    entries = []
    current_article = None

    for part in parts:
        if not part or not part.strip():
            continue
        part = part.strip()

        if ARTICLE_HDR_RE.fullmatch(part):
            current_article = part
            continue

        if current_article:
            entries.extend(extract_articles_from_chunk(part, current_article, doc_title, min_words=min_words))

    # 4. Save JSON
    os.makedirs(os.path.dirname(json_file), exist_ok=True)
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(entries, f, indent=4, ensure_ascii=False)

    print(f"✅ Extracted {len(entries)} entries (min {min_words} words each) → {json_file}")
    return entries


# Example run
pdf_to_json(
    "laws_pdf_file/EU_Digital_Service_Act.pdf",
    "laws_json_file/EU_Digital_Service_Act.json",
    "EU_Digital_Service",
    min_words=2
)
