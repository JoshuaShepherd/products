#!/usr/bin/env python3
"""
SDS Markdown Formatter v3.0 - Safe Content Preservation
This version carefully preserves all content while improving formatting
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SafeSDSMarkdownFormatter:
    """Safely formats SDS markdown files while preserving all content"""
    
    def __init__(self, input_dir: str):
        self.input_dir = Path(input_dir)
    
    def format_file(self, file_path: Path) -> str:
        """Safely format a single SDS markdown file"""
        logger.info(f"Formatting {file_path.name}...")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Preserve original content but improve formatting
        formatted_content = self.improve_formatting(content)
        
        return formatted_content
    
    def improve_formatting(self, content: str) -> str:
        """Improve formatting while preserving all content"""
        
        # Split content into header and body
        if '## Content' in content:
            header_part, body_part = content.split('## Content', 1)
        else:
            # If no "## Content" section, treat entire content as body
            header_part = ""
            body_part = content
        
        # Improve the header formatting
        improved_header = self.format_header(header_part)
        
        # Improve the body formatting while preserving all content
        improved_body = self.format_body(body_part)
        
        # Combine back together
        if header_part:
            return improved_header + "\n## Content\n" + improved_body
        else:
            return improved_body
    
    def format_header(self, header: str) -> str:
        """Improve header formatting"""
        if not header.strip():
            return header
        
        # Clean up the header while preserving information
        lines = header.split('\n')
        formatted_lines = []
        
        for line in lines:
            line = line.strip()
            if not line:
                formatted_lines.append('')
                continue
            
            # Improve document info formatting
            if line.startswith('**Document**:'):
                formatted_lines.append(f"**Original Document**: {line.split(':', 1)[1].strip()}")
            elif line.startswith('**Converted**:'):
                formatted_lines.append(f"**Conversion Date**: {line.split(':', 1)[1].strip()}")
            else:
                formatted_lines.append(line)
        
        # Add version info if not present
        if '**Format Version**' not in '\n'.join(formatted_lines):
            formatted_lines.append('**Format Version**: Enhanced v3.0 (Content Preserved)')
        
        return '\n'.join(formatted_lines)
    
    def format_body(self, body: str) -> str:
        """Improve body formatting while preserving all content"""
        
        # Remove leading/trailing whitespace but preserve internal structure
        body = body.strip()
        
        # Fix section headers to be proper markdown headers
        body = self.improve_section_headers(body)
        
        # Improve table formatting but preserve content
        body = self.improve_tables(body)
        
        # Improve paragraph spacing
        body = self.improve_paragraph_spacing(body)
        
        return body
    
    def improve_section_headers(self, content: str) -> str:
        """Convert SECTION X headers to proper markdown headers"""
        
        # Pattern to match "SECTION X - TITLE" or "SECTION X"
        section_pattern = r'^(SECTION\s+\d+(?:\s*-\s*[A-Z\s&/]+)?)\s*$'
        
        lines = content.split('\n')
        improved_lines = []
        
        for line in lines:
            # Check if this line is a section header
            if re.match(section_pattern, line.strip(), re.IGNORECASE):
                # Convert to markdown header
                section_match = re.match(r'SECTION\s+(\d+)(?:\s*-\s*(.+))?', line.strip(), re.IGNORECASE)
                if section_match:
                    section_num = section_match.group(1)
                    section_title = section_match.group(2)
                    
                    if section_title:
                        # Clean up the title
                        section_title = section_title.strip().title()
                        improved_lines.append(f"\n## {section_num}. {section_title}\n")
                    else:
                        improved_lines.append(f"\n## Section {section_num}\n")
                else:
                    improved_lines.append(line)
            else:
                improved_lines.append(line)
        
        return '\n'.join(improved_lines)
    
    def improve_tables(self, content: str) -> str:
        """Improve table formatting while preserving content"""
        
        # Don't remove any tables, just clean up formatting
        # Remove excessive whitespace in table cells
        table_pattern = r'\|\s*([^|]+)\s*\|'
        
        def clean_table_cell(match):
            cell_content = match.group(1).strip()
            return f"| {cell_content} |"
        
        content = re.sub(table_pattern, clean_table_cell, content)
        
        return content
    
    def improve_paragraph_spacing(self, content: str) -> str:
        """Improve paragraph spacing while preserving content"""
        
        # Normalize excessive line breaks (more than 2) to just 2
        content = re.sub(r'\n{3,}', '\n\n', content)
        
        # Ensure there's a line break after section headers
        content = re.sub(r'(## .+)\n([A-Z])', r'\1\n\n\2', content)
        
        return content
    
    def process_all_files(self):
        """Safely process all markdown files"""
        md_files = list(self.input_dir.glob('*.md'))
        
        # Exclude report files
        md_files = [f for f in md_files if not any(exclude in f.name for exclude in [
            'conversion_report', 'validation_report', 'SDS_FORMATTING', 'README', 'CONVERSION_SUMMARY'
        ])]
        
        logger.info(f"Found {len(md_files)} markdown files to safely format")
        
        processed = 0
        for md_file in md_files:
            try:
                # Read original content
                with open(md_file, 'r', encoding='utf-8') as f:
                    original_content = f.read()
                
                # Only proceed if the file has substantial content
                if len(original_content) < 500:
                    logger.warning(f"⚠️  Skipping {md_file.name} - too short, may be corrupted")
                    continue
                
                # Format the content
                formatted_content = self.format_file(md_file)
                
                # Verify we haven't lost significant content
                if len(formatted_content) < len(original_content) * 0.8:
                    logger.error(f"❌ Content loss detected in {md_file.name} - skipping")
                    continue
                
                # Create backup of original
                backup_path = md_file.with_suffix('.md.backup')
                with open(backup_path, 'w', encoding='utf-8') as f:
                    f.write(original_content)
                
                # Write formatted content
                with open(md_file, 'w', encoding='utf-8') as f:
                    f.write(formatted_content)
                
                processed += 1
                if processed % 25 == 0:
                    logger.info(f"✅ Safely processed {processed}/{len(md_files)} files...")
                
            except Exception as e:
                logger.error(f"❌ Error processing {md_file.name}: {e}")
        
        logger.info(f"✨ Safe formatting complete! Processed {processed}/{len(md_files)} files")
        logger.info(f"📁 Backup files created with .backup extension")

def main():
    input_dir = "/Users/joshshepherd/Desktop/GitHub/products/public/data/sds-markdown"
    formatter = SafeSDSMarkdownFormatter(input_dir)
    formatter.process_all_files()

if __name__ == '__main__':
    main()