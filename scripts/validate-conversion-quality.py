#!/usr/bin/env python3
"""
Quality validation script to check PDF to Markdown conversion consistency
"""

import os
import sys
from pathlib import Path
import json
import re
from datetime import datetime

# Add the necessary imports for PDF processing
try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False

def extract_key_content_from_pdf(pdf_path):
    """Extract key identifiable content from PDF for comparison"""
    if not HAS_PDFPLUMBER:
        return None
    
    try:
        key_content = {}
        with pdfplumber.open(pdf_path) as pdf:
            full_text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    full_text += page_text + "\n"
            
            # Extract key identifiers
            key_content['total_text_length'] = len(full_text)
            key_content['word_count'] = len(full_text.split())
            key_content['page_count'] = len(pdf.pages)
            
            # Look for specific SDS sections
            sections_found = []
            section_patterns = [
                r'SECTION 1.*IDENTIFICATION',
                r'SECTION 2.*HAZARD',
                r'SECTION 3.*COMPOSITION',
                r'SECTION 4.*FIRST.*AID',
                r'SECTION 5.*FIRE',
                r'SECTION 6.*ACCIDENTAL',
                r'SECTION 7.*HANDLING',
                r'SECTION 8.*EXPOSURE',
                r'SECTION 9.*PHYSICAL',
                r'SECTION 10.*STABILITY',
                r'SECTION 11.*TOXICOLOGICAL',
                r'SECTION 12.*ECOLOGICAL',
                r'SECTION 13.*DISPOSAL',
                r'SECTION 14.*TRANSPORT',
                r'SECTION 15.*REGULATORY',
                r'SECTION 16.*OTHER'
            ]
            
            for pattern in section_patterns:
                if re.search(pattern, full_text, re.IGNORECASE):
                    sections_found.append(pattern)
            
            key_content['sections_found'] = len(sections_found)
            key_content['has_cas_numbers'] = bool(re.search(r'CAS.*\d{2,7}-\d{2}-\d', full_text))
            key_content['has_signal_word'] = bool(re.search(r'(DANGER|WARNING|CAUTION)', full_text, re.IGNORECASE))
            key_content['has_hazard_statements'] = bool(re.search(r'H\d{3}', full_text))
            
            return key_content
            
    except Exception as e:
        print(f"Error processing {pdf_path}: {e}")
        return None

def extract_key_content_from_markdown(md_path):
    """Extract key identifiable content from markdown for comparison"""
    try:
        with open(md_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        key_content = {}
        key_content['total_text_length'] = len(content)
        key_content['word_count'] = len(content.split())
        
        # Look for SDS sections in markdown
        sections_found = 0
        section_patterns = [
            r'SECTION 1.*IDENTIFICATION',
            r'SECTION 2.*HAZARD',
            r'SECTION 3.*COMPOSITION',
            r'SECTION 4.*FIRST.*AID',
            r'SECTION 5.*FIRE',
            r'SECTION 6.*ACCIDENTAL',
            r'SECTION 7.*HANDLING',
            r'SECTION 8.*EXPOSURE',
            r'SECTION 9.*PHYSICAL',
            r'SECTION 10.*STABILITY',
            r'SECTION 11.*TOXICOLOGICAL',
            r'SECTION 12.*ECOLOGICAL',
            r'SECTION 13.*DISPOSAL',
            r'SECTION 14.*TRANSPORT',
            r'SECTION 15.*REGULATORY',
            r'SECTION 16.*OTHER'
        ]
        
        for pattern in section_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                sections_found += 1
        
        key_content['sections_found'] = sections_found
        key_content['has_cas_numbers'] = bool(re.search(r'CAS.*\d{2,7}-\d{2}-\d', content))
        key_content['has_signal_word'] = bool(re.search(r'(DANGER|WARNING|CAUTION)', content, re.IGNORECASE))
        key_content['has_hazard_statements'] = bool(re.search(r'H\d{3}', content))
        
        return key_content
        
    except Exception as e:
        print(f"Error processing {md_path}: {e}")
        return None

def validate_conversion_quality():
    """Validate the quality of PDF to Markdown conversion"""
    
    pdf_dir = Path('/Users/joshshepherd/Desktop/GitHub/products/public/data/sds')
    md_dir = Path('/Users/joshshepherd/Desktop/GitHub/products/public/data/sds-markdown')
    
    validation_results = []
    
    # Get list of PDF files
    pdf_files = list(pdf_dir.glob('*.pdf'))
    
    print(f"Validating {len(pdf_files)} PDF to Markdown conversions...")
    
    for i, pdf_file in enumerate(pdf_files, 1):
        print(f"[{i}/{len(pdf_files)}] Validating {pdf_file.name}...")
        
        # Find corresponding markdown file
        md_file = md_dir / (pdf_file.stem + '.md')
        
        if not md_file.exists():
            validation_results.append({
                'file': pdf_file.name,
                'status': 'missing_markdown',
                'error': 'Markdown file not found'
            })
            continue
        
        # Extract key content from both files
        pdf_content = extract_key_content_from_pdf(pdf_file)
        md_content = extract_key_content_from_markdown(md_file)
        
        if pdf_content is None:
            validation_results.append({
                'file': pdf_file.name,
                'status': 'pdf_extraction_failed',
                'error': 'Could not extract content from PDF'
            })
            continue
        
        if md_content is None:
            validation_results.append({
                'file': pdf_file.name,
                'status': 'md_extraction_failed',
                'error': 'Could not extract content from Markdown'
            })
            continue
        
        # Compare key metrics
        issues = []
        
        # Check if markdown has reasonable amount of content
        if md_content['word_count'] < 100:
            issues.append('Very low word count in markdown')
        
        # Check if key SDS elements are present
        if pdf_content['has_signal_word'] and not md_content['has_signal_word']:
            issues.append('Signal word missing in markdown')
        
        if pdf_content['has_cas_numbers'] and not md_content['has_cas_numbers']:
            issues.append('CAS numbers missing in markdown')
        
        # Check section preservation
        section_ratio = md_content['sections_found'] / max(pdf_content['sections_found'], 1)
        if section_ratio < 0.5:
            issues.append(f'Many sections missing ({md_content["sections_found"]}/{pdf_content["sections_found"]})')
        
        # Calculate content preservation ratio
        content_ratio = md_content['word_count'] / max(pdf_content['word_count'], 1)
        
        result = {
            'file': pdf_file.name,
            'status': 'success' if len(issues) == 0 else 'issues',
            'pdf_words': pdf_content['word_count'],
            'md_words': md_content['word_count'],
            'content_ratio': round(content_ratio, 2),
            'pdf_sections': pdf_content['sections_found'],
            'md_sections': md_content['sections_found'],
            'section_ratio': round(section_ratio, 2),
            'issues': issues
        }
        
        validation_results.append(result)
    
    # Generate validation report
    generate_validation_report(validation_results)
    
    return validation_results

def generate_validation_report(results):
    """Generate a detailed validation report"""
    
    output_dir = Path('/Users/joshshepherd/Desktop/GitHub/products/public/data/sds-organized')
    
    # Statistics
    total_files = len(results)
    successful = len([r for r in results if r['status'] == 'success'])
    with_issues = len([r for r in results if r['status'] == 'issues'])
    failed = len([r for r in results if r['status'] not in ['success', 'issues']])
    
    # Create JSON report
    report_data = {
        'validation_date': datetime.now().isoformat(),
        'total_files': total_files,
        'successful': successful,
        'with_issues': with_issues,
        'failed': failed,
        'success_rate': round((successful / total_files) * 100, 1) if total_files > 0 else 0,
        'results': results
    }
    
    with open(output_dir / 'validation_report.json', 'w', encoding='utf-8') as f:
        json.dump(report_data, f, indent=2)
    
    # Create markdown report
    md_report = f"# PDF to Markdown Conversion Validation Report\n\n"
    md_report += f"**Validation Date**: {report_data['validation_date']}\n"
    md_report += f"**Total Files**: {total_files}\n"
    md_report += f"**Successful**: {successful}\n"
    md_report += f"**With Issues**: {with_issues}\n"
    md_report += f"**Failed**: {failed}\n"
    md_report += f"**Success Rate**: {report_data['success_rate']}%\n\n"
    
    # Summary statistics
    if results:
        content_ratios = [r['content_ratio'] for r in results if 'content_ratio' in r]
        if content_ratios:
            avg_content_ratio = sum(content_ratios) / len(content_ratios)
            md_report += f"**Average Content Preservation**: {avg_content_ratio:.1%}\n"
        
        section_ratios = [r['section_ratio'] for r in results if 'section_ratio' in r]
        if section_ratios:
            avg_section_ratio = sum(section_ratios) / len(section_ratios)
            md_report += f"**Average Section Preservation**: {avg_section_ratio:.1%}\n"
    
    md_report += "\n## Detailed Results\n\n"
    
    # Successful conversions
    successful_results = [r for r in results if r['status'] == 'success']
    if successful_results:
        md_report += f"### ✅ Successful Conversions ({len(successful_results)})\n\n"
        md_report += "| File | Content Ratio | Sections | Word Count |\n"
        md_report += "|------|---------------|----------|------------|\n"
        for result in successful_results[:20]:  # Show first 20
            md_report += f"| {result['file']} | {result['content_ratio']:.1%} | {result['md_sections']}/{result['pdf_sections']} | {result['md_words']:,} |\n"
        
        if len(successful_results) > 20:
            md_report += f"\n*... and {len(successful_results) - 20} more successful conversions*\n"
        md_report += "\n"
    
    # Files with issues
    issues_results = [r for r in results if r['status'] == 'issues']
    if issues_results:
        md_report += f"### ⚠️ Conversions with Issues ({len(issues_results)})\n\n"
        md_report += "| File | Issues | Content Ratio | Sections |\n"
        md_report += "|------|--------|---------------|----------|\n"
        for result in issues_results:
            issues_str = "; ".join(result['issues'])
            md_report += f"| {result['file']} | {issues_str} | {result['content_ratio']:.1%} | {result['md_sections']}/{result['pdf_sections']} |\n"
        md_report += "\n"
    
    # Failed conversions
    failed_results = [r for r in results if r['status'] not in ['success', 'issues']]
    if failed_results:
        md_report += f"### ❌ Failed Conversions ({len(failed_results)})\n\n"
        md_report += "| File | Error |\n"
        md_report += "|------|-------|\n"
        for result in failed_results:
            error = result.get('error', 'Unknown error')
            md_report += f"| {result['file']} | {error} |\n"
        md_report += "\n"
    
    md_report += "---\n\n"
    md_report += "This validation report compares the original PDF files with their markdown conversions to ensure quality and completeness.\n"
    
    with open(output_dir / 'validation_report.md', 'w', encoding='utf-8') as f:
        f.write(md_report)
    
    print(f"\nValidation complete!")
    print(f"Success rate: {report_data['success_rate']}%")
    print(f"Reports saved to {output_dir}")

if __name__ == '__main__':
    if not HAS_PDFPLUMBER:
        print("Error: pdfplumber is required for validation. Please install it first.")
        sys.exit(1)
    
    validate_conversion_quality()