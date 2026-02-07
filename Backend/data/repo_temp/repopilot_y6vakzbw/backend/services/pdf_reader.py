from PyPDF2 import PdfReader

MAX_PAGES = 15

def extract_text_from_pdf(pdf_path, extra_text=""):
    """
    Reads PDF safely (max 15 pages)
    Returns (combined_text, total_pages_read)
    """
    reader = PdfReader(pdf_path)
    pages_text = []

    total_pages = min(len(reader.pages), MAX_PAGES)

    for i in range(total_pages):
        text = reader.pages[i].extract_text()
        if text:
            pages_text.append(text)

    combined_text = "\n".join(pages_text)

    # merge extra text if provided
    if extra_text:
        combined_text += "\n\n" + extra_text

    if not combined_text.strip():
        raise ValueError("No readable text found in PDF")

    return combined_text, total_pages



