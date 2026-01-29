#!/usr/bin/env python3
"""
PDFデータシートからテキストを抽出するスクリプト

使用方法:
    python extract_pdf_text.py <input_pdf> [output_txt]
    
例:
    python extract_pdf_text.py ../raw/GRM185R60J105KE26-01.pdf
    python extract_pdf_text.py ../raw/GRM185R60J105KE26-01.pdf output.txt
"""

import sys
import os
from pathlib import Path

try:
    import fitz  # pymupdf
except ImportError:
    print("Error: pymupdf is required. Install with: pip install pymupdf")
    sys.exit(1)


def extract_text_from_pdf(pdf_path: str, output_path: str = None) -> str:
    """
    PDFからテキストを抽出する
    
    Args:
        pdf_path: 入力PDFファイルのパス
        output_path: 出力テキストファイルのパス（省略時は標準出力）
    
    Returns:
        抽出されたテキスト
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    
    doc = fitz.open(pdf_path)
    
    # メタデータ
    metadata = []
    metadata.append(f"# PDF Text Extraction")
    metadata.append(f"# Source: {os.path.basename(pdf_path)}")
    metadata.append(f"# Pages: {len(doc)}")
    metadata.append("")
    
    # 各ページからテキスト抽出
    all_text = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()
        
        all_text.append(f"\n{'='*60}")
        all_text.append(f"PAGE {page_num + 1}")
        all_text.append(f"{'='*60}\n")
        all_text.append(text)
    
    doc.close()
    
    full_text = "\n".join(metadata + all_text)
    
    # 出力
    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(full_text)
        print(f"Text extracted to: {output_path}")
    
    return full_text


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        text = extract_text_from_pdf(pdf_path, output_path)
        if not output_path:
            print(text)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
