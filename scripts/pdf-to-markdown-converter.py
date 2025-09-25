#!/usr/bin/env python3
"""
PDF to Markdown Converter for SDS Files
Converts PDF Safety Data Sheets to well-organized markdown format
Uses multiple PDF processing methods for reliable extraction
"""

import os
import sys
import logging
from pathlib import Path
import argparse
from typing import List, Dict, Optional, Tuple
import re
import json
from datetime import datetime

# PDF processing libraries
try:
    import PyPDF2
    HAS_PYPDF2 = True
except ImportError:
    HAS_PYPDF2 = False

try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False

try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False

try:
    import pdfminer.high_level
    HAS_PDFMINER = True
except ImportError:
    HAS_PDFMINER = False

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PDFToMarkdownConverter:
    """Converts PDF files to structured markdown format"""
    
    def __init__(self, input_dir: str, output_dir: str):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.conversion_report = []
        
        # Ensure output directory exists
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Check available libraries
        self.available_methods = []
        if HAS_PYPDF2:
            self.available_methods.append('pypdf2')
        if HAS_PDFPLUMBER:
            self.available_methods.append('pdfplumber')
        if HAS_PYMUPDF:
            self.available_methods.append('pymupdf')
        if HAS_PDFMINER:
            self.available_methods.append('pdfminer')
            
        logger.info(f"Available PDF processing methods: {self.available_methods}")
    
    def extract_text_pypdf2(self, pdf_path: Path) -> str:
        """Extract text using PyPDF2"""
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n\n"
                return text
        except Exception as e:
            logger.error(f"PyPDF2 extraction failed for {pdf_path}: {e}")
            return ""
    
    def extract_text_pdfplumber(self, pdf_path: Path) -> str:
        """Extract text using pdfplumber (better for tables and formatting)"""
        try:
            text = ""
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n\n"
                        
                    # Try to extract tables
                    tables = page.extract_tables()
                    for table in tables:
                        if table:
                            text += self.format_table_as_markdown(table) + "\n\n"
            return text
        except Exception as e:
            logger.error(f"pdfplumber extraction failed for {pdf_path}: {e}")
            return ""
    
    def extract_text_pymupdf(self, pdf_path: Path) -> str:
        """Extract text using PyMuPDF (good for complex layouts)"""
        try:
            doc = fitz.open(pdf_path)
            text = ""
            for page in doc:
                text += page.get_text() + "\n\n"
            doc.close()
            return text
        except Exception as e:
            logger.error(f"PyMuPDF extraction failed for {pdf_path}: {e}")
            return ""
    
    def extract_text_pdfminer(self, pdf_path: Path) -> str:
        """Extract text using pdfminer"""
        try:
            return pdfminer.high_level.extract_text(str(pdf_path))
        except Exception as e:
            logger.error(f"pdfminer extraction failed for {pdf_path}: {e}")
            return ""
    
    def format_table_as_markdown(self, table: List[List[str]]) -> str:
        """Convert table data to markdown format"""
        if not table or not table[0]:
            return ""
        
        markdown = ""
        headers = table[0]
        
        # Create header row
        markdown += "| " + " | ".join(str(cell) if cell else "" for cell in headers) + " |\n"
        
        # Create separator row
        markdown += "| " + " | ".join("---" for _ in headers) + " |\n"
        
        # Add data rows
        for row in table[1:]:
            if row:
                markdown += "| " + " | ".join(str(cell) if cell else "" for cell in row) + " |\n"
        
        return markdown
    
    def extract_text_best_method(self, pdf_path: Path) -> Tuple[str, str]:
        """Try multiple methods and return the best result"""
        results = {}
        
        # Try each available method
        for method in self.available_methods:
            try:
                if method == 'pypdf2':
                    text = self.extract_text_pypdf2(pdf_path)
                elif method == 'pdfplumber':
                    text = self.extract_text_pdfplumber(pdf_path)
                elif method == 'pymupdf':
                    text = self.extract_text_pymupdf(pdf_path)
                elif method == 'pdfminer':
                    text = self.extract_text_pdfminer(pdf_path)
                
                if text and len(text.strip()) > 0:
                    results[method] = text
            except Exception as e:
                logger.error(f"Method {method} failed for {pdf_path}: {e}")
        
        # Return the longest result (usually indicates better extraction)
        if results:
            best_method = max(results.keys(), key=lambda k: len(results[k]))
            return results[best_method], best_method
        
        return "", "none"
    
    def clean_and_format_text(self, text: str) -> str:
        """Clean and format extracted text"""
        # Remove excessive whitespace
        text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)
        text = re.sub(r'[ \t]+', ' ', text)
        
        # Fix common OCR issues
        text = text.replace('ﬁ', 'fi')
        text = text.replace('ﬂ', 'fl')
        text = text.replace('–', '-')
        text = text.replace(''', "'")
        text = text.replace(''', "'")
        text = text.replace('"', '"')
        text = text.replace('"', '"')
        
        return text.strip()
    
    def structure_sds_content(self, text: str, filename: str) -> str:
        """Structure SDS content with proper markdown formatting"""
        product_name = filename.replace('-sds.pdf', '').replace('-', ' ').title()
        
        # Create structured markdown
        markdown = f"# Safety Data Sheet: {product_name}\n\n"
        markdown += f"**Document**: {filename}\n"
        markdown += f"**Converted**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        markdown += "---\n\n"
        
        # Try to identify common SDS sections
        sections = self.identify_sds_sections(text)
        
        if sections:
            for section_title, section_content in sections.items():
                markdown += f"## {section_title}\n\n"
                markdown += f"{section_content}\n\n"
        else:
            # If we can't identify sections, just format the raw text
            markdown += "## Content\n\n"
            markdown += text
        
        return markdown
    
    def identify_sds_sections(self, text: str) -> Dict[str, str]:
        """Identify common SDS sections in the text"""
        sections = {}
        
        # Common SDS section patterns
        section_patterns = [
            (r'1\.?\s*IDENTIFICATION', 'Product Identification'),
            (r'2\.?\s*HAZARD.*IDENTIFICATION', 'Hazard Identification'),
            (r'3\.?\s*COMPOSITION', 'Composition/Information on Ingredients'),
            (r'4\.?\s*FIRST.*AID', 'First Aid Measures'),
            (r'5\.?\s*FIRE.*FIGHTING', 'Fire Fighting Measures'),
            (r'6\.?\s*ACCIDENTAL.*RELEASE', 'Accidental Release Measures'),
            (r'7\.?\s*HANDLING.*STORAGE', 'Handling and Storage'),
            (r'8\.?\s*EXPOSURE.*CONTROLS', 'Exposure Controls/Personal Protection'),
            (r'9\.?\s*PHYSICAL.*CHEMICAL', 'Physical and Chemical Properties'),
            (r'10\.?\s*STABILITY.*REACTIVITY', 'Stability and Reactivity'),
            (r'11\.?\s*TOXICOLOGICAL', 'Toxicological Information'),
            (r'12\.?\s*ECOLOGICAL', 'Ecological Information'),
            (r'13\.?\s*DISPOSAL', 'Disposal Considerations'),
            (r'14\.?\s*TRANSPORT', 'Transport Information'),
            (r'15\.?\s*REGULATORY', 'Regulatory Information'),
            (r'16\.?\s*OTHER', 'Other Information'),
        ]
        
        # Split text by sections
        for i, (pattern, section_name) in enumerate(section_patterns):
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                start_pos = match.start()
                
                # Find the end position (start of next section or end of text)
                end_pos = len(text)
                for j in range(i + 1, len(section_patterns)):
                    next_pattern, _ = section_patterns[j]
                    next_match = re.search(next_pattern, text[start_pos:], re.IGNORECASE | re.MULTILINE)
                    if next_match:
                        end_pos = start_pos + next_match.start()
                        break
                
                section_content = text[start_pos:end_pos].strip()
                # Remove the section header from the content
                section_content = re.sub(pattern, '', section_content, flags=re.IGNORECASE | re.MULTILINE).strip()
                
                if section_content:
                    sections[section_name] = section_content
        
        return sections
    
    def convert_pdf(self, pdf_path: Path) -> Dict:
        """Convert a single PDF to markdown"""
        logger.info(f"Converting {pdf_path.name}...")
        
        # Extract text using the best available method
        text, method_used = self.extract_text_best_method(pdf_path)
        
        if not text:
            logger.error(f"Failed to extract text from {pdf_path.name}")
            return {
                'filename': pdf_path.name,
                'status': 'failed',
                'method': 'none',
                'error': 'No text extracted'
            }
        
        # Clean and format the text
        cleaned_text = self.clean_and_format_text(text)
        
        # Structure as SDS markdown
        markdown_content = self.structure_sds_content(cleaned_text, pdf_path.name)
        
        # Create output filename
        output_filename = pdf_path.stem + '.md'
        output_path = self.output_dir / output_filename
        
        # Write markdown file
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(markdown_content)
            
            logger.info(f"Successfully converted {pdf_path.name} using {method_used}")
            return {
                'filename': pdf_path.name,
                'output_file': output_filename,
                'status': 'success',
                'method': method_used,
                'text_length': len(cleaned_text),
                'sections_found': len(self.identify_sds_sections(cleaned_text))
            }
        
        except Exception as e:
            logger.error(f"Failed to write markdown for {pdf_path.name}: {e}")
            return {
                'filename': pdf_path.name,
                'status': 'failed',
                'method': method_used,
                'error': str(e)
            }
    
    def convert_all_pdfs(self) -> None:
        """Convert all PDF files in the input directory"""
        pdf_files = list(self.input_dir.glob('*.pdf'))
        
        if not pdf_files:
            logger.warning(f"No PDF files found in {self.input_dir}")
            return
        
        logger.info(f"Found {len(pdf_files)} PDF files to convert")
        
        successful_conversions = 0
        failed_conversions = 0
        
        for pdf_file in pdf_files:
            result = self.convert_pdf(pdf_file)
            self.conversion_report.append(result)
            
            if result['status'] == 'success':
                successful_conversions += 1
            else:
                failed_conversions += 1
        
        # Generate summary report
        self.generate_report()
        
        logger.info(f"Conversion complete: {successful_conversions} successful, {failed_conversions} failed")
    
    def generate_report(self) -> None:
        """Generate conversion report"""
        report_path = self.output_dir / 'conversion_report.json'
        
        summary = {
            'conversion_date': datetime.now().isoformat(),
            'total_files': len(self.conversion_report),
            'successful': len([r for r in self.conversion_report if r['status'] == 'success']),
            'failed': len([r for r in self.conversion_report if r['status'] == 'failed']),
            'available_methods': self.available_methods,
            'files': self.conversion_report
        }
        
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2)
        
        # Also create a markdown report
        md_report_path = self.output_dir / 'conversion_report.md'
        self.generate_markdown_report(md_report_path, summary)
        
        logger.info(f"Conversion reports saved to {report_path} and {md_report_path}")
    
    def generate_markdown_report(self, report_path: Path, summary: Dict) -> None:
        """Generate markdown conversion report"""
        report = f"# PDF to Markdown Conversion Report\n\n"
        report += f"**Conversion Date**: {summary['conversion_date']}\n"
        report += f"**Total Files**: {summary['total_files']}\n"
        report += f"**Successful**: {summary['successful']}\n"
        report += f"**Failed**: {summary['failed']}\n"
        report += f"**Success Rate**: {(summary['successful']/summary['total_files']*100):.1f}%\n\n"
        
        report += f"**Available Methods**: {', '.join(summary['available_methods'])}\n\n"
        
        # Successful conversions
        successful_files = [f for f in summary['files'] if f['status'] == 'success']
        if successful_files:
            report += "## Successful Conversions\n\n"
            report += "| File | Method | Text Length | Sections |\n"
            report += "|------|--------|-------------|----------|\n"
            for file_info in successful_files:
                report += f"| {file_info['filename']} | {file_info['method']} | {file_info.get('text_length', 'N/A')} | {file_info.get('sections_found', 'N/A')} |\n"
            report += "\n"
        
        # Failed conversions
        failed_files = [f for f in summary['files'] if f['status'] == 'failed']
        if failed_files:
            report += "## Failed Conversions\n\n"
            report += "| File | Error |\n"
            report += "|------|-------|\n"
            for file_info in failed_files:
                error = file_info.get('error', 'Unknown error')
                report += f"| {file_info['filename']} | {error} |\n"
            report += "\n"
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)

def install_dependencies():
    """Install required dependencies"""
    import subprocess
    
    dependencies = [
        'PyPDF2',
        'pdfplumber',
        'PyMuPDF',
        'pdfminer.six'
    ]
    
    for dep in dependencies:
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', dep])
            logger.info(f"Installed {dep}")
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to install {dep}: {e}")

def main():
    parser = argparse.ArgumentParser(description='Convert PDF files to structured markdown')
    parser.add_argument('input_dir', help='Directory containing PDF files')
    parser.add_argument('output_dir', help='Directory to save markdown files')
    parser.add_argument('--install-deps', action='store_true', help='Install required dependencies')
    
    args = parser.parse_args()
    
    if args.install_deps:
        install_dependencies()
    
    converter = PDFToMarkdownConverter(args.input_dir, args.output_dir)
    converter.convert_all_pdfs()

if __name__ == '__main__':
    main()