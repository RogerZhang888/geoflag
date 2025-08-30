import os
import re
import json
from pdf2image import convert_from_path
import pytesseract

# Optional: set path to tesseract if not in system PATH
# pytesseract.pytesseract.tesseract_cmd = "/usr/local/bin/tesseract"

ENACTMENT_PHRASE = "HAVE ADOPTED THIS REGULATION:"

# Regex patterns
ARTICLE_HDR_RE = re.compile(r'\bArticle\s+(\d+)\b', re.IGNORECASE)  # Article 1, Article 2
NUMBERED_RE = re.compile(r'^\s*(\d+)\.\s+', re.MULTILINE)           # 1., 2., 3. at line start

def word_count(text: str) -> int:
    return len(re.findall(r'\b[\w\-]+\b', text))

def clean_noise(s: str) -> str:
    """Basic cleanup of OCR noise and whitespace."""
    s = re.sub(r'\s+', ' ', s)  # collapse multiple spaces/newlines
    return s.strip()

def text_after_enactment(full_text: str) -> str:
    """Skip everything before the enactment phrase."""
    idx = full_text.find(ENACTMENT_PHRASE)
    if idx != -1:
        return full_text[idx + len(ENACTMENT_PHRASE):].strip()
    return full_text

def extract_numbered_sections(article_text: str, kb_title: str, article_header: str):
    """Split article text into numbered sections: 1., 2., 3., etc."""
    results = []
    matches = list(NUMBERED_RE.finditer(article_text))
    
    for i, m in enumerate(matches):
        article_number = m.group(1)
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(article_text)
        body = article_text[start:end].strip()
        body = clean_noise(body)
        if word_count(body) >= 2:
            results.append({
                "kb": kb_title,
                "article number": article_number,
                "type": article_header,
                "text": body,
                "word count": word_count(body)
            })
    return results

def pdf_to_json(pdf_file: str, json_file: str, kb_title: str):
    """OCR PDF → JSON by Article and numbered sections."""
    # 1) OCR PDF pages
    pages = convert_from_path(pdf_file)
    full_text = ""
    for page in pages:
        full_text += pytesseract.image_to_string(page) + "\n"

    full_text = clean_noise(full_text)
    full_text = text_after_enactment(full_text)

    # 2) Split by Article headers
    parts = re.split(f'({ARTICLE_HDR_RE.pattern})', full_text)
    results = []
    current_article_header = None
    article_text_lines = []

    for part in parts:
        part = part.strip()
        if not part:
            continue

        m = ARTICLE_HDR_RE.match(part)
        if m:
            # Save previous article
            if current_article_header and article_text_lines:
                article_text = "\n".join(article_text_lines)
                results.extend(extract_numbered_sections(article_text, kb_title, current_article_header))
            # Start new article
            current_article_header = f"Article {m.group(1)}"
            article_text_lines = []
        else:
            article_text_lines.append(part)

    # Save last article
    if current_article_header and article_text_lines:
        article_text = "\n".join(article_text_lines)
        results.extend(extract_numbered_sections(article_text, kb_title, current_article_header))

    # 3) Save JSON
    os.makedirs(os.path.dirname(json_file), exist_ok=True)
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4, ensure_ascii=False)

    print(f"✅ Extracted {len(results)} sections → {json_file}")
    return results

# Example usage
pdf_to_json(
    "laws_pdf_file/EU_Digital_Service_Act_Copy.pdf",
    "laws_json_file/EU_Digital_Service_Act_Copy.json",
    kb_title="EU_Digital_Service_Act_Copy"
)
