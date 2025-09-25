#!/usr/bin/env python3
"""
SDS Markdown Formatter v2.0
Improved version that properly handles content deduplication and section parsing
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SDSMarkdownFormatterV2:
    """Enhanced SDS markdown formatter with better content parsing"""
    
    def __init__(self, input_dir: str):
        self.input_dir = Path(input_dir)
        self.sds_sections = [
            "SECTION 1",
            "SECTION 2", 
            "SECTION 3",
            "SECTION 4",
            "SECTION 5",
            "SECTION 6",
            "SECTION 7",
            "SECTION 8",
            "SECTION 9",
            "SECTION 10",
            "SECTION 11",
            "SECTION 12",
            "SECTION 13",
            "SECTION 14",
            "SECTION 15",
            "SECTION 16"
        ]
    
    def format_file(self, file_path: Path) -> str:
        """Format a single SDS markdown file"""
        logger.info(f"Formatting {file_path.name}...")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract metadata from header
        metadata = self.extract_metadata(content)
        
        # Get the raw text content and clean it
        raw_content = self.extract_clean_content(content)
        
        # Build the formatted document
        formatted_content = self.build_formatted_document(metadata, raw_content)
        
        return formatted_content
    
    def extract_metadata(self, content: str) -> Dict[str, str]:
        """Extract document metadata from the header"""
        metadata = {}
        
        # Extract document name from first header
        title_match = re.search(r'# Safety Data Sheet: (.+)', content)
        if title_match:
            metadata['product_name'] = title_match.group(1)
        
        # Extract document filename
        doc_match = re.search(r'\*\*Document\*\*: (.+)', content)
        if doc_match:
            metadata['document'] = doc_match.group(1)
        
        # Extract conversion date
        date_match = re.search(r'\*\*Converted\*\*: (.+)', content)
        if date_match:
            metadata['converted'] = date_match.group(1)
        
        return metadata
    
    def extract_clean_content(self, content: str) -> str:
        """Extract and clean the main content, removing duplicates"""
        
        # Find the main content section
        content_match = re.search(r'## Content\n\n(.+)', content, re.DOTALL)
        if not content_match:
            return ""
        
        raw_content = content_match.group(1)
        
        # Remove table structures that duplicate the text
        # Remove single-column tables
        raw_content = re.sub(r'\n\|\s*[^|]+\s*\|\n\|\s*---+\s*\|(?:\n\|\s*[^|]*\s*\|)*\n', '\n', raw_content)
        
        # Remove malformed table headers
        raw_content = re.sub(r'\n\|\s*Safety Data Sheet\s*\|\n\|\s*---+\s*\|\n', '\n', raw_content)
        
        # Clean up multiple newlines
        raw_content = re.sub(r'\n{3,}', '\n\n', raw_content)
        
        return raw_content.strip()
    
    def build_formatted_document(self, metadata: Dict[str, str], raw_content: str) -> str:
        """Build the complete formatted document"""
        
        # Build header
        formatted = self.build_header(metadata)
        
        # Split content by sections and format each
        sections = self.parse_sections(raw_content)
        
        for section_num, section_content in sections.items():
            formatted += self.format_section(section_num, section_content)
        
        return formatted
    
    def build_header(self, metadata: Dict[str, str]) -> str:
        """Build a properly formatted document header"""
        product_name = metadata.get('product_name', 'Unknown Product')
        document = metadata.get('document', 'Unknown Document') 
        converted = metadata.get('converted', 'Unknown Date')
        
        header = f"# Safety Data Sheet: {product_name}\n\n"
        header += f"| Document Information | |\n"
        header += f"|---------------------|---|\n"
        header += f"| **Original Document** | `{document}` |\n"
        header += f"| **Converted Date** | {converted} |\n"
        header += f"| **Format Version** | Enhanced Markdown v2.0 |\n\n"
        header += "---\n\n"
        
        return header
    
    def parse_sections(self, content: str) -> Dict[int, str]:
        """Parse content by SDS sections"""
        sections = {}
        
        # Find all section headers
        section_pattern = r'SECTION\s+(\d+)(?:\s*-\s*([^\n]+))?'
        matches = list(re.finditer(section_pattern, content, re.IGNORECASE))
        
        for i, match in enumerate(matches):
            section_num = int(match.group(1))
            start_pos = match.end()
            
            # Find the end position (start of next section or end of content)
            if i + 1 < len(matches):
                end_pos = matches[i + 1].start()
            else:
                end_pos = len(content)
            
            # Extract section content
            section_content = content[start_pos:end_pos].strip()
            if section_content:
                sections[section_num] = section_content
        
        return sections
    
    def format_section(self, section_num: int, content: str) -> str:
        """Format an individual SDS section"""
        
        # Section titles mapping
        section_titles = {
            1: "Product and Company Identification",
            2: "Hazards Identification", 
            3: "Composition/Information on Ingredients",
            4: "First Aid Measures",
            5: "Fire Fighting Measures",
            6: "Accidental Release Measures",
            7: "Handling and Storage",
            8: "Exposure Controls/Personal Protection",
            9: "Physical and Chemical Properties",
            10: "Stability and Reactivity",
            11: "Toxicological Information",
            12: "Ecological Information",
            13: "Disposal Considerations",
            14: "Transport Information",
            15: "Regulatory Information",
            16: "Other Information"
        }
        
        title = section_titles.get(section_num, f"Section {section_num}")
        formatted = f"## {section_num}. {title}\n\n"
        
        # Format content based on section type
        if section_num == 1:
            formatted += self.format_identification_section(content)
        elif section_num == 2:
            formatted += self.format_hazards_section(content)
        elif section_num == 3:
            formatted += self.format_composition_section(content)
        elif section_num == 4:
            formatted += self.format_first_aid_section(content)
        elif section_num == 9:
            formatted += self.format_physical_properties_section(content)
        else:
            formatted += self.format_generic_section(content)
        
        formatted += "\n"
        return formatted
    
    def format_identification_section(self, content: str) -> str:
        """Format Section 1 - Product and Company Identification"""
        formatted = ""
        
        # Product Information
        formatted += "### Product Information\n\n"
        
        # Extract key product fields
        fields = {
            'Trade Name': r'Trade Name.*?:\s*(.+)',
            'Synonyms': r'Synonyms.*?:\s*(.+)', 
            'CAS Number': r'CAS No.*?:\s*(.+)',
            'Product Use': r'Product Use.*?:\s*(.+)'
        }
        
        for field_name, pattern in fields.items():
            value = self.extract_field(content, pattern)
            if value and value.lower() not in ['n/a', 'none', 'not applicable']:
                formatted += f"- **{field_name}**: {value}\n"
        
        formatted += "\n"
        
        # Company Information
        company_name = self.extract_field(content, r'Company Name.*?:\s*(.+)')
        if company_name:
            formatted += "### Company Information\n\n"
            formatted += f"**{company_name}**\n\n"
            
            # Address
            address_parts = []
            address1 = self.extract_field(content, r'Company Address.*?:\s*(.+)')
            if address1:
                address_parts.append(address1)
            
            address2 = self.extract_field(content, r'Company Address Cont.*?:\s*(.+)')
            if address2:
                address_parts.append(address2)
            
            if address_parts:
                formatted += "**Address:**\n"
                for part in address_parts:
                    formatted += f"{part}  \n"
                formatted += "\n"
            
            # Contact info
            phone = self.extract_field(content, r'Business Phone.*?:\s*(.+)')
            if phone:
                formatted += f"**Phone**: {phone}  \n"
            
            website = self.extract_field(content, r'Website.*?:\s*(.+)')
            if website:
                formatted += f"**Website**: {website}  \n"
            
            formatted += "\n"
        
        # Emergency Contact
        emergency = self.extract_field(content, r'Emergency Telephone Number.*?:\s*(.+)')
        if emergency:
            formatted += "### Emergency Contact\n\n"
            formatted += f"**24-Hour Emergency Response**\n\n"
            formatted += f"{emergency}\n\n"
        
        # Revision Information
        last_revision = self.extract_field(content, r'Date of Last Revision.*?:\s*(.+)')
        current_revision = self.extract_field(content, r'Date of Current Revision.*?:\s*(.+)')
        
        if last_revision or current_revision:
            formatted += "### Revision Information\n\n"
            if last_revision:
                formatted += f"- **Last Revision**: {last_revision}\n"
            if current_revision:
                formatted += f"- **Current Revision**: {current_revision}\n"
            formatted += "\n"
        
        return formatted
    
    def format_hazards_section(self, content: str) -> str:
        """Format Section 2 - Hazards Identification"""
        formatted = ""
        
        # Emergency overview
        overview = self.extract_multiline_field(content, r'EMERGENCY OVERVIEW:?\s*(.+?)(?=\n[A-Z][a-z]|\n\n|\Z)')
        if overview:
            formatted += "### Emergency Overview\n\n"
            formatted += f"> {overview}\n\n"
        
        # Hazard categories
        hazard_types = {
            'Health Hazards': r'Health Hazards?:?\s*(.+?)(?=\n[A-Z][a-z]|\n\n|\Z)',
            'Flammability Hazards': r'Flammability Hazards?:?\s*(.+?)(?=\n[A-Z][a-z]|\n\n|\Z)',
            'Reactivity Hazards': r'Reactivity Hazards?:?\s*(.+?)(?=\n[A-Z][a-z]|\n\n|\Z)',
            'Environmental Hazards': r'Environmental Hazards?:?\s*(.+?)(?=\n[A-Z][a-z]|\n\n|\Z)'
        }
        
        for hazard_name, pattern in hazard_types.items():
            hazard_text = self.extract_multiline_field(content, pattern)
            if hazard_text:
                formatted += f"### {hazard_name}\n\n"
                formatted += f"{hazard_text}\n\n"
        
        # Signal word
        signal_word = self.extract_field(content, r'Signal Word:?\s*(.+)')
        if signal_word:
            formatted += f"### Classification\n\n"
            formatted += f"**Signal Word**: `{signal_word.upper()}`\n\n"
        
        # Hazard and precautionary statements
        hazard_statements = self.extract_multiline_field(content, r'Hazard Statements?:?\s*(.+?)(?=Precautionary|\n[A-Z][a-z]|\n\n|\Z)')
        if hazard_statements:
            formatted += "### Hazard Statements\n\n"
            statements = [s.strip() for s in hazard_statements.split('\n') if s.strip()]
            for statement in statements:
                if re.match(r'H\d+', statement):
                    formatted += f"- `{statement}`\n"
                else:
                    formatted += f"- {statement}\n"
            formatted += "\n"
        
        precautionary = self.extract_multiline_field(content, r'Precautionary Statements?:?\s*(.+?)(?=\n[A-Z][a-z]|\n\n|\Z)')
        if precautionary:
            formatted += "### Precautionary Statements\n\n"
            statements = [s.strip() for s in precautionary.split('\n') if s.strip()]
            for statement in statements:
                if re.match(r'P\d+', statement):
                    formatted += f"- `{statement}`\n"
                else:
                    formatted += f"- {statement}\n"
            formatted += "\n"
        
        return formatted
    
    def format_composition_section(self, content: str) -> str:
        """Format Section 3 - Composition"""
        formatted = ""
        
        # Look for ingredients table
        if any(keyword in content.lower() for keyword in ['ingredient', 'component', 'cas', 'concentration']):
            formatted += "### Chemical Composition\n\n"
            
            # Simple table format
            lines = [line.strip() for line in content.split('\n') if line.strip()]
            
            # Look for structured ingredient data
            ingredient_data = []
            for line in lines:
                if any(keyword in line.lower() for keyword in ['cas', '%', 'concentration']):
                    # This might be ingredient data
                    if ':' in line:
                        key, value = line.split(':', 1)
                        formatted += f"**{key.strip()}**: {value.strip()}\n\n"
                    else:
                        formatted += f"{line}\n\n"
            
            if not formatted.strip().endswith('### Chemical Composition'):
                pass  # Content was added
            else:
                # No structured data found, add as text
                formatted += f"{content}\n\n"
        else:
            formatted += f"{content}\n\n"
        
        return formatted
    
    def format_first_aid_section(self, content: str) -> str:
        """Format Section 4 - First Aid Measures"""
        formatted = ""
        
        # Exposure routes
        routes = {
            'Inhalation': r'Inhalation:?\s*(.+?)(?=\n[A-Z][a-z]|\n\n|\Z)',
            'Skin Contact': r'Skin(?:\s+Contact)?:?\s*(.+?)(?=\n[A-Z][a-z]|\n\n|\Z)',
            'Eye Contact': r'Eye(?:\s+Contact)?:?\s*(.+?)(?=\n[A-Z][a-z]|\n\n|\Z)',
            'Ingestion': r'Ingestion:?\s*(.+?)(?=\n[A-Z][a-z]|\n\n|\Z)'
        }
        
        for route_name, pattern in routes.items():
            route_text = self.extract_multiline_field(content, pattern)
            if route_text:
                formatted += f"### {route_name}\n\n"
                formatted += f"{route_text}\n\n"
        
        # General first aid
        general = self.extract_multiline_field(content, r'General:?\s*(.+?)(?=\n[A-Z][a-z]|\n\n|\Z)')
        if general:
            formatted += f"### General Information\n\n"
            formatted += f"{general}\n\n"
        
        # If no specific routes found, format as general
        if not formatted:
            formatted = f"{content}\n\n"
        
        return formatted
    
    def format_physical_properties_section(self, content: str) -> str:
        """Format Section 9 - Physical and Chemical Properties"""
        formatted = ""
        
        # Look for property data
        properties = [
            'Physical State', 'Appearance', 'Color', 'Odor', 'pH', 'Boiling Point',
            'Melting Point', 'Flash Point', 'Vapor Pressure', 'Density', 'Solubility',
            'Viscosity', 'Specific Gravity'
        ]
        
        property_data = {}
        for prop in properties:
            pattern = f"{prop}.*?:?\\s*(.+?)(?=\\n[A-Z]|\\n\\n|\\Z)"
            value = self.extract_field(content, pattern)
            if value and value.lower() not in ['n/a', 'not available', 'not applicable']:
                property_data[prop] = value
        
        if property_data:
            formatted += "### Physical Properties\n\n"
            formatted += "| Property | Value |\n"
            formatted += "|----------|-------|\n"
            for prop, value in property_data.items():
                formatted += f"| {prop} | {value} |\n"
            formatted += "\n"
        else:
            # No structured properties found
            formatted += f"{content}\n\n"
        
        return formatted
    
    def format_generic_section(self, content: str) -> str:
        """Generic section formatting with paragraph breaks"""
        
        # Clean up content
        content = re.sub(r'\n{3,}', '\n\n', content.strip())
        
        # Split into paragraphs
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        
        formatted = ""
        for paragraph in paragraphs:
            # Check for key-value pairs
            if ':' in paragraph and len(paragraph.split(':')) == 2:
                key, value = paragraph.split(':', 1)
                if len(key) < 50:  # Likely a label
                    formatted += f"**{key.strip()}**: {value.strip()}\n\n"
                else:
                    formatted += f"{paragraph}\n\n"
            else:
                formatted += f"{paragraph}\n\n"
        
        return formatted
    
    def extract_field(self, content: str, pattern: str) -> str:
        """Extract a single field using regex"""
        match = re.search(pattern, content, re.IGNORECASE)
        return match.group(1).strip() if match else ""
    
    def extract_multiline_field(self, content: str, pattern: str) -> str:
        """Extract a multi-line field using regex"""
        match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)
        if match:
            text = match.group(1).strip()
            # Clean up extra whitespace
            text = re.sub(r'\s+', ' ', text)
            return text
        return ""
    
    def process_all_files(self):
        """Process all markdown files in directory"""
        md_files = list(self.input_dir.glob('*.md'))
        
        # Exclude report files
        md_files = [f for f in md_files if not f.name.startswith('conversion_report')]
        
        logger.info(f"Found {len(md_files)} markdown files to format")
        
        processed = 0
        for md_file in md_files:
            try:
                formatted_content = self.format_file(md_file)
                
                # Write formatted content back to file
                with open(md_file, 'w', encoding='utf-8') as f:
                    f.write(formatted_content)
                
                processed += 1
                if processed % 25 == 0:
                    logger.info(f"✅ Processed {processed}/{len(md_files)} files...")
                
            except Exception as e:
                logger.error(f"❌ Error formatting {md_file.name}: {e}")
        
        logger.info(f"✨ Formatting complete! Processed {processed}/{len(md_files)} files")

def main():
    input_dir = "/Users/joshshepherd/Desktop/GitHub/products/public/data/sds-markdown"
    formatter = SDSMarkdownFormatterV2(input_dir)
    formatter.process_all_files()

if __name__ == '__main__':
    main()