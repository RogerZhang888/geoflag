import os
import re
import json
from pdf2image import convert_from_path
import pytesseract

def pdf_to_laws_json(pdf_path, output_json_path, dpi=300, lang="eng", poppler_path=None):
    """
    Convert a law PDF into structured JSON using OCR and section detection.
    
    Sections are identified by patterns like (27) or 27.
    
    Args:
        pdf_path (str): Path to input PDF.
        output_json_path (str): Path to save output JSON.
        dpi (int): Resolution for PDF to image conversion.
        lang (str): Language for Tesseract (default 'eng').
        poppler_path (str): Optional path to Poppler binaries (for macOS/Windows).
    """
    
    # Convert PDF to images
    pages = convert_from_path(pdf_path, dpi=dpi, poppler_path=poppler_path)
    
    all_text = []
    for i, page in enumerate(pages):
        print(f"OCR processing page {i+1}/{len(pages)}...")
        text = pytesseract.image_to_string(page, lang=lang)
        cleaned_text = re.sub(r'\s+', ' ', text).strip()  # normalize whitespace
        all_text.append(cleaned_text)
    
    # Combine into one big text
    full_text = " ".join(all_text)
    
    # Split into numbered sections: (27) or 27.
    # Captures the number and keeps it linked to its text
    sections = re.split(r'(?:(\(\d+\))|(\d+\.))', full_text)
    
    structured = []
    entry_number = 1
    current_number = None
    
    for i in range(1, len(sections), 3):  # step through matches
        number_token = sections[i] or sections[i+1]  # either (27) or 27.
        content = sections[i+2].strip() if i+2 < len(sections) else ""
        
        if not number_token or not content:
            continue
        
        # Extract just the number
        article_number = re.sub(r'[().]', '', number_token).strip()
        
        structured.append({
            "entry_number": entry_number,
            "article_number": article_number,
            "type": "Section",
            "contents": content,
            "word": len(content.split())
        })
        
        entry_number += 1
    
    # Ensure output folder exists
    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
    
    # Save JSON
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(structured, f, ensure_ascii=False, indent=2)
    
    print(f"✅ OCR complete. Structured JSON saved to {output_json_path}")

laws_pdf_file = "laws_pdf_file/EU_LAWS.pdf"
laws_json_file = "laws_json_file/EU_LAWS.json"

pdf_to_laws_json(laws_pdf_file, laws_json_file, poppler_path="/opt/homebrew/bin")

