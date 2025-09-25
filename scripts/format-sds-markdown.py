#!/usr/bin/env python3
"""
SDS Markdown Formatter
Improves visual formatting and layout of Safety Data Sheet markdown files
without altering content - only improving presentation and organization
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SDSMarkdownFormatter:
    """Formats SDS markdown files for improved readability and organization"""
    
    def __init__(self, input_dir: str):
        self.input_dir = Path(input_dir)
        self.sds_sections = [
            "SECTION 1 - PRODUCT AND COMPANY IDENTIFICATION",
            "SECTION 2 - HAZARDS IDENTIFICATION", 
            "SECTION 3 - COMPOSITION/INFORMATION ON INGREDIENTS",
            "SECTION 4 - FIRST AID MEASURES",
            "SECTION 5 - FIRE FIGHTING MEASURES",
            "SECTION 6 - ACCIDENTAL RELEASE MEASURES",
            "SECTION 7 - HANDLING AND STORAGE",
            "SECTION 8 - EXPOSURE CONTROLS/PERSONAL PROTECTION",
            "SECTION 9 - PHYSICAL AND CHEMICAL PROPERTIES",
            "SECTION 10 - STABILITY AND REACTIVITY",
            "SECTION 11 - TOXICOLOGICAL INFORMATION",
            "SECTION 12 - ECOLOGICAL INFORMATION",
            "SECTION 13 - DISPOSAL CONSIDERATIONS",
            "SECTION 14 - TRANSPORT INFORMATION",
            "SECTION 15 - REGULATORY INFORMATION",
            "SECTION 16 - OTHER INFORMATION"
        ]
    
    def format_file(self, file_path: Path) -> str:
        """Format a single SDS markdown file"""
        logger.info(f"Formatting {file_path.name}...")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract metadata from header
        metadata = self.extract_metadata(content)
        
        # Clean and structure the content
        formatted_content = self.format_content(content, metadata)
        
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
    
    def format_content(self, content: str, metadata: Dict[str, str]) -> str:
        """Format the main content with proper structure"""
        
        # Remove everything after the ## Content header and work with the text
        content_match = re.search(r'## Content\n\n(.+)', content, re.DOTALL)
        if not content_match:
            return content  # Return original if no match
        
        raw_content = content_match.group(1)
        
        # Remove duplicate table content (tables that repeat the same info)
        raw_content = self.remove_duplicate_tables(raw_content)
        
        # Start building the formatted document
        formatted = self.build_header(metadata)
        
        # Split content by SDS sections and format each
        sections = self.split_by_sections(raw_content)
        
        for section_title, section_content in sections.items():
            formatted += self.format_section(section_title, section_content)
        
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
        header += f"| **Format Version** | Enhanced Markdown v1.0 |\n\n"
        header += "---\n\n"
        
        return header
    
    def remove_duplicate_tables(self, content: str) -> str:
        """Remove malformed tables that duplicate text content"""
        # Remove single-column tables that just repeat content
        content = re.sub(r'\n\| Safety Data Sheet \|\n\| --- \|(?:\n\| .+ \|)*\n', '\n', content)
        
        # Remove other malformed table structures
        content = re.sub(r'\n\| .+ \|\n\| --- \|\n(?:\n\| .+ \|)*\n', '\n', content)
        
        return content
    
    def split_by_sections(self, content: str) -> Dict[str, str]:
        """Split content by SDS sections"""
        sections = {}
        
        # Find each section and its content
        for i, section_title in enumerate(self.sds_sections):
            # Create pattern to match this section
            section_pattern = re.escape(section_title)
            
            # Find the start of this section
            start_match = re.search(section_pattern, content, re.IGNORECASE)
            if not start_match:
                continue
            
            start_pos = start_match.end()
            
            # Find the start of the next section
            end_pos = len(content)
            for next_section in self.sds_sections[i+1:]:
                next_pattern = re.escape(next_section)
                next_match = re.search(next_pattern, content[start_pos:], re.IGNORECASE)
                if next_match:
                    end_pos = start_pos + next_match.start()
                    break
            
            # Extract section content
            section_content = content[start_pos:end_pos].strip()
            if section_content:
                sections[section_title] = section_content
        
        return sections
    
    def format_section(self, section_title: str, section_content: str) -> str:
        """Format an individual SDS section"""
        # Create section header
        section_number = section_title.split(' - ')[0].replace('SECTION ', '')
        section_name = section_title.split(' - ')[1] if ' - ' in section_title else section_title
        
        formatted = f"## {section_number}. {section_name.title()}\n\n"
        
        # Format the content based on section type
        if "IDENTIFICATION" in section_title:
            formatted += self.format_identification_section(section_content)
        elif "HAZARDS" in section_title:
            formatted += self.format_hazards_section(section_content)
        elif "COMPOSITION" in section_title:
            formatted += self.format_composition_section(section_content)
        elif "FIRST AID" in section_title:
            formatted += self.format_first_aid_section(section_content)
        elif "FIRE" in section_title:
            formatted += self.format_fire_section(section_content)
        elif "ACCIDENTAL RELEASE" in section_title:
            formatted += self.format_release_section(section_content)
        elif "HANDLING" in section_title:
            formatted += self.format_handling_section(section_content)
        elif "EXPOSURE CONTROLS" in section_title:
            formatted += self.format_exposure_section(section_content)
        elif "PHYSICAL" in section_title:
            formatted += self.format_physical_section(section_content)
        else:
            # Generic section formatting
            formatted += self.format_generic_section(section_content)
        
        formatted += "\n"
        return formatted
    
    def format_identification_section(self, content: str) -> str:
        """Format Section 1 - Product and Company Identification"""
        formatted = ""
        
        # Extract key information
        trade_name = self.extract_field(content, r'Trade Name.*?:\s*(.+)')
        product_use = self.extract_field(content, r'Product Use.*?:\s*(.+)')
        company_name = self.extract_field(content, r'Company Name.*?:\s*(.+)')
        
        # Format product information
        if trade_name:
            formatted += f"### Product Information\n\n"
            formatted += f"- **Trade Name**: {trade_name}\n"
            
            synonyms = self.extract_field(content, r'Synonyms.*?:\s*(.+)')
            if synonyms and synonyms.lower() != 'n/a':
                formatted += f"- **Synonyms**: {synonyms}\n"
            
            cas_no = self.extract_field(content, r'CAS No.*?:\s*(.+)')
            if cas_no:
                formatted += f"- **CAS Number**: {cas_no}\n"
            
            if product_use:
                formatted += f"- **Product Use**: {product_use}\n"
            
            formatted += "\n"
        
        # Format company information
        if company_name:
            formatted += f"### Company Information\n\n"
            formatted += f"**{company_name}**\n\n"
            
            # Extract address
            address_lines = []
            address_match = re.search(r'Company Address.*?:\s*(.+)', content)
            if address_match:
                address_lines.append(address_match.group(1))
            
            address_cont_match = re.search(r'Company Address Cont.*?:\s*(.+)', content)
            if address_cont_match:
                address_lines.append(address_cont_match.group(1))
            
            if address_lines:
                formatted += f"**Address:**\n"
                for line in address_lines:
                    formatted += f"{line}  \n"
                formatted += "\n"
            
            # Phone and website
            phone = self.extract_field(content, r'Business Phone.*?:\s*(.+)')
            if phone:
                formatted += f"**Phone**: {phone}  \n"
            
            website = self.extract_field(content, r'Website.*?:\s*(.+)')
            if website:
                formatted += f"**Website**: {website}  \n"
            
            formatted += "\n"
        
        # Emergency contact
        emergency = self.extract_field(content, r'Emergency Telephone Number.*?:\s*(.+)')
        if emergency:
            formatted += f"### Emergency Contact\n\n"
            formatted += f"**24-Hour Emergency Response**\n\n"
            # Clean up the emergency contact info
            emergency = re.sub(r'\s+', ' ', emergency)
            formatted += f"{emergency}\n\n"
        
        # Revision dates
        last_revision = self.extract_field(content, r'Date of Last Revision.*?:\s*(.+)')
        current_revision = self.extract_field(content, r'Date of Current Revision.*?:\s*(.+)')
        
        if last_revision or current_revision:
            formatted += f"### Revision Information\n\n"
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
        overview_match = re.search(r'EMERGENCY OVERVIEW:\s*(.+?)(?=\n[A-Z]|\n\n|\Z)', content, re.DOTALL)
        if overview_match:
            formatted += f"### Emergency Overview\n\n"
            overview = overview_match.group(1).strip()
            formatted += f"> {overview}\n\n"
        
        # Hazard categories
        health_match = re.search(r'Health Hazards:\s*(.+?)(?=\n[A-Z]|\n\n|\Z)', content, re.DOTALL)
        if health_match:
            formatted += f"### Health Hazards\n\n"
            health = health_match.group(1).strip()
            formatted += f"{health}\n\n"
        
        flammability_match = re.search(r'Flammability Hazards:\s*(.+?)(?=\n[A-Z]|\n\n|\Z)', content, re.DOTALL)
        if flammability_match:
            formatted += f"### Flammability Hazards\n\n"
            flammability = flammability_match.group(1).strip()
            formatted += f"{flammability}\n\n"
        
        reactivity_match = re.search(r'Reactivity Hazards:\s*(.+?)(?=\n[A-Z]|\n\n|\Z)', content, re.DOTALL)
        if reactivity_match:
            formatted += f"### Reactivity Hazards\n\n"
            reactivity = reactivity_match.group(1).strip()
            formatted += f"{reactivity}\n\n"
        
        environmental_match = re.search(r'Environmental Hazards:\s*(.+?)(?=\n[A-Z]|\n\n|\Z)', content, re.DOTALL)
        if environmental_match:
            formatted += f"### Environmental Hazards\n\n"
            environmental = environmental_match.group(1).strip()
            formatted += f"{environmental}\n\n"
        
        # Signal word
        signal_word = self.extract_field(content, r'Signal Word\s+(.+)')
        if signal_word:
            formatted += f"### Classification\n\n"
            formatted += f"**Signal Word**: `{signal_word.upper()}`\n\n"
        
        # Hazard statements
        hazard_statements = self.extract_multi_line_field(content, r'Hazard Statements:\s*(.+?)(?=\n[A-Z][a-z]|\n\n|\Z)')
        if hazard_statements:
            formatted += f"### Hazard Statements\n\n"
            statements = hazard_statements.split('\n')
            for statement in statements:
                statement = statement.strip()
                if statement:
                    if re.match(r'H\d+', statement):
                        formatted += f"- `{statement}`\n"
                    else:
                        formatted += f"- {statement}\n"
            formatted += "\n"
        
        # Precautionary statements
        precautionary = self.extract_multi_line_field(content, r'Precautionary Statements:\s*(.+?)(?=\n[A-Z][a-z]|\n\n|\Z)')
        if precautionary:
            formatted += f"### Precautionary Statements\n\n"
            statements = precautionary.split('\n')
            for statement in statements:
                statement = statement.strip()
                if statement:
                    if re.match(r'P\d+', statement):
                        formatted += f"- `{statement}`\n"
                    else:
                        formatted += f"- {statement}\n"
            formatted += "\n"
        
        return formatted
    
    def format_composition_section(self, content: str) -> str:
        """Format Section 3 - Composition/Information on Ingredients"""
        formatted = ""
        
        # Look for ingredient tables or lists
        if "Ingredient" in content or "Component" in content or "CAS" in content:
            formatted += "### Chemical Composition\n\n"
            
            # Try to extract tabular data
            lines = content.split('\n')
            in_table = False
            table_headers = []
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Look for table-like data
                if any(keyword in line.lower() for keyword in ['ingredient', 'component', 'chemical', 'cas']):
                    if '%' in line or 'concentration' in line.lower():
                        # This looks like ingredient data
                        formatted += f"| Chemical Name | CAS Number | Concentration |\n"
                        formatted += f"|---------------|------------|---------------|\n"
                        in_table = True
                
                if in_table and (any(char.isdigit() for char in line) or 'cas' in line.lower()):
                    # Parse ingredient line
                    parts = re.split(r'\s{2,}|\t', line)
                    if len(parts) >= 2:
                        formatted += f"| {' | '.join(parts[:3])} |\n"
            
            if not in_table:
                # No table structure found, just format as text
                formatted += content + "\n"
        else:
            formatted += content + "\n"
        
        formatted += "\n"
        return formatted
    
    def format_first_aid_section(self, content: str) -> str:
        """Format Section 4 - First Aid Measures"""
        formatted = ""
        
        # Look for different exposure routes
        routes = {
            'inhalation': r'Inhalation:\s*(.+?)(?=\n[A-Z][a-z]|\n\n|\Z)',
            'skin': r'Skin.*?:\s*(.+?)(?=\n[A-Z][a-z]|\n\n|\Z)',
            'eye': r'Eye.*?:\s*(.+?)(?=\n[A-Z][a-z]|\n\n|\Z)',
            'ingestion': r'Ingestion:\s*(.+?)(?=\n[A-Z][a-z]|\n\n|\Z)'
        }
        
        for route, pattern in routes.items():
            match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)
            if match:
                formatted += f"### {route.title()} Exposure\n\n"
                measures = match.group(1).strip()
                formatted += f"{measures}\n\n"
        
        # General first aid info
        general_match = re.search(r'General.*?:\s*(.+?)(?=\n[A-Z][a-z]|\n\n|\Z)', content, re.IGNORECASE | re.DOTALL)
        if general_match:
            formatted += f"### General Information\n\n"
            general = general_match.group(1).strip()
            formatted += f"{general}\n\n"
        
        # If no specific routes found, format as general
        if not formatted:
            formatted = content + "\n\n"
        
        return formatted
    
    def format_fire_section(self, content: str) -> str:
        """Format Section 5 - Fire Fighting Measures"""
        return self.format_generic_section(content)
    
    def format_release_section(self, content: str) -> str:
        """Format Section 6 - Accidental Release Measures"""
        return self.format_generic_section(content)
    
    def format_handling_section(self, content: str) -> str:
        """Format Section 7 - Handling and Storage"""
        formatted = ""
        
        # Look for handling vs storage info
        handling_match = re.search(r'Handling.*?:\s*(.+?)(?=Storage|\n[A-Z][a-z]|\n\n|\Z)', content, re.IGNORECASE | re.DOTALL)
        if handling_match:
            formatted += f"### Handling Precautions\n\n"
            handling = handling_match.group(1).strip()
            formatted += f"{handling}\n\n"
        
        storage_match = re.search(r'Storage.*?:\s*(.+?)(?=\n[A-Z][a-z]|\n\n|\Z)', content, re.IGNORECASE | re.DOTALL)
        if storage_match:
            formatted += f"### Storage Requirements\n\n"
            storage = storage_match.group(1).strip()
            formatted += f"{storage}\n\n"
        
        if not formatted:
            formatted = content + "\n\n"
        
        return formatted
    
    def format_exposure_section(self, content: str) -> str:
        """Format Section 8 - Exposure Controls/Personal Protection"""
        return self.format_generic_section(content)
    
    def format_physical_section(self, content: str) -> str:
        """Format Section 9 - Physical and Chemical Properties"""
        formatted = ""
        
        # Look for property pairs
        properties = [
            'Physical State', 'Appearance', 'Color', 'Odor', 'pH', 'Boiling Point',
            'Melting Point', 'Flash Point', 'Vapor Pressure', 'Density', 'Solubility'
        ]
        
        formatted += "### Physical Properties\n\n"
        formatted += "| Property | Value |\n"
        formatted += "|----------|-------|\n"
        
        found_properties = False
        for prop in properties:
            pattern = f"{prop}.*?:\\s*(.+?)(?=\\n[A-Z]|\\n\\n|\\Z)"
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                value = match.group(1).strip()
                formatted += f"| {prop} | {value} |\n"
                found_properties = True
        
        if not found_properties:
            formatted = content + "\n"
        
        formatted += "\n"
        return formatted
    
    def format_generic_section(self, content: str) -> str:
        """Generic section formatting"""
        # Clean up the content
        content = re.sub(r'\n+', '\n\n', content)  # Normalize line breaks
        content = content.strip()
        
        # Add paragraph breaks for better readability
        paragraphs = content.split('\n\n')
        formatted = ""
        
        for paragraph in paragraphs:
            paragraph = paragraph.strip()
            if paragraph:
                # Check if it's a list item
                if paragraph.startswith('-') or paragraph.startswith('•'):
                    formatted += f"{paragraph}\n\n"
                # Check if it contains colons (likely property pairs)
                elif ':' in paragraph and len(paragraph.split(':')) == 2:
                    key, value = paragraph.split(':', 1)
                    formatted += f"**{key.strip()}**: {value.strip()}\n\n"
                else:
                    formatted += f"{paragraph}\n\n"
        
        return formatted
    
    def extract_field(self, content: str, pattern: str) -> str:
        """Extract a single field using regex"""
        match = re.search(pattern, content, re.IGNORECASE)
        return match.group(1).strip() if match else ""
    
    def extract_multi_line_field(self, content: str, pattern: str) -> str:
        """Extract a multi-line field using regex"""
        match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)
        return match.group(1).strip() if match else ""
    
    def process_all_files(self):
        """Process all markdown files in the directory"""
        md_files = list(self.input_dir.glob('*.md'))
        
        # Exclude report files
        md_files = [f for f in md_files if not f.name.startswith('conversion_report')]
        
        logger.info(f"Found {len(md_files)} markdown files to format")
        
        for md_file in md_files:
            try:
                formatted_content = self.format_file(md_file)
                
                # Write formatted content back to file
                with open(md_file, 'w', encoding='utf-8') as f:
                    f.write(formatted_content)
                
                logger.info(f"✅ Formatted {md_file.name}")
                
            except Exception as e:
                logger.error(f"❌ Error formatting {md_file.name}: {e}")
        
        logger.info("✨ Formatting complete!")

def main():
    input_dir = "/Users/joshshepherd/Desktop/GitHub/products/public/data/sds-markdown"
    formatter = SDSMarkdownFormatter(input_dir)
    formatter.process_all_files()

if __name__ == '__main__':
    main()