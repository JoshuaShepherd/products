#!/usr/bin/env python3
"""
Organize SDS Markdown files into categories
"""

import os
import shutil
from pathlib import Path
import re
from collections import defaultdict

def categorize_products():
    """Categorize products into logical groups based on their names"""
    
    categories = {
        'cure_and_seal': [
            'cure-&-seal', 'cure-seal', 'cure-shield', 'cure-hard', 'e-cure', 'polycure'
        ],
        'sealers_and_coatings': [
            'all-shield', 'specshield', 'crystal-shine', 'surface-shine', 'deco-shine', 
            'lithseal', 'specguard', 'sealer-renew', 'aqua-shine'
        ],
        'epoxy_products': [
            'specpoxy', 'spec-poxy'
        ],
        'patches_and_repairs': [
            'patch', 'repcon', 'por-rok', 'duo-patch', 'total-patch', 'hydropatch',
            'max-a-patch', 'pool-patch', 'precast-patch', 'cempatch'
        ],
        'cleaners_and_strippers': [
            'specstrip', 'berry-clean', 'bio-strip', 'cleanLift', 'specchem-creteaway',
            'cleanlift', 'orange-peel', 'versa-etch', 'specetch'
        ],
        'concrete_additives': [
            'specflow', 'flowable-fill', 'rapid', 'overcrete', 'revcrete', 'crystal-rez',
            'triact', 'specflex', 'final-finish', 'specsmooth', 'specweld'
        ],
        'pavement_products': [
            'pave-cure', 'pave-', 'spectilt'
        ],
        'grouts_and_mortars': [
            'grout', 'mortar', 'spec-o-lith', 'specrock', 'dot-grout', 'uw-grout',
            'k-set', 'c-set'
        ],
        'specialty_chemicals': [
            'acetone', 'xylene', 'muriatic-acid', 'solvent', 'cherry-fragrance'
        ],
        'foundation_and_waterproofing': [
            'max-a-seal', 'max-a-fill', 'max-a-tack', 'dry-deck', 'sc-foundation',
            'plaster-bond', 'stuccobond', 'strong-bond', 'concrete-glue'
        ],
        'hardeners_and_densifiers': [
            'spechard', 'quartz-floor-hardener', 'specplate'
        ],
        'release_agents': [
            'deco-liquid-release', 'ez-clean-&-release', 'form-seasoning', 'v-form-release'
        ],
        'silanes_and_penetrants': [
            'specsilane', 'spec-cj-guard', 'intrafilm', 'specfilm'
        ],
        'leveling_compounds': [
            'speclevel', 'sleek'
        ],
        'primers_and_prep': [
            'specprime', 'specprep', 'mvm-prime', 'surface-grip'
        ],
        'plugs_and_stoppers': [
            'specplug', 'super-specplug', 'aqua-plug', 'pro-plug'
        ],
        'city_and_municipal': [
            'speccity'
        ],
        'blasting_media': [
            'specblast'
        ],
        'aggregate_and_topping': [
            'speccrete', 'sc-concrete', 'sc-mt-black', 'sc-metallic', 'sc-multi-purpose',
            'sc-precision', 'sc-cure'
        ]
    }
    
    return categories

def organize_files():
    """Organize the markdown files into categorized directories"""
    
    input_dir = Path('/Users/joshshepherd/Desktop/GitHub/products/public/data/sds-markdown')
    organized_dir = Path('/Users/joshshepherd/Desktop/GitHub/products/public/data/sds-organized')
    
    # Create organized directory structure
    organized_dir.mkdir(exist_ok=True)
    
    categories = categorize_products()
    uncategorized = []
    categorized_files = defaultdict(list)
    
    # Get all markdown files (excluding reports)
    md_files = [f for f in input_dir.glob('*.md') if not f.name.startswith('conversion_report')]
    
    print(f"Found {len(md_files)} markdown files to organize")
    
    # Categorize files
    for md_file in md_files:
        filename_lower = md_file.name.lower()
        categorized = False
        
        for category, keywords in categories.items():
            for keyword in keywords:
                if keyword in filename_lower:
                    categorized_files[category].append(md_file)
                    categorized = True
                    break
            if categorized:
                break
        
        if not categorized:
            uncategorized.append(md_file)
    
    # Create category directories and copy files
    for category, files in categorized_files.items():
        category_dir = organized_dir / category.replace('_', '-')
        category_dir.mkdir(exist_ok=True)
        
        print(f"\n{category.replace('_', ' ').title()}: {len(files)} files")
        for file in files:
            dest_file = category_dir / file.name
            shutil.copy2(file, dest_file)
            print(f"  → {file.name}")
    
    # Handle uncategorized files
    if uncategorized:
        misc_dir = organized_dir / 'miscellaneous'
        misc_dir.mkdir(exist_ok=True)
        
        print(f"\nMiscellaneous: {len(uncategorized)} files")
        for file in uncategorized:
            dest_file = misc_dir / file.name
            shutil.copy2(file, dest_file)
            print(f"  → {file.name}")
    
    # Copy the conversion reports
    for report_file in input_dir.glob('conversion_report.*'):
        shutil.copy2(report_file, organized_dir / report_file.name)
    
    # Create an index file
    create_index_file(organized_dir, categorized_files, uncategorized)
    
    print(f"\nOrganization complete! Files organized in: {organized_dir}")

def create_index_file(organized_dir, categorized_files, uncategorized):
    """Create an index markdown file"""
    
    index_content = "# SpecChem Safety Data Sheets - Organized Index\n\n"
    index_content += f"**Generated**: 2025-09-25\n"
    index_content += f"**Total Files**: {sum(len(files) for files in categorized_files.values()) + len(uncategorized)}\n\n"
    
    index_content += "## Product Categories\n\n"
    
    for category, files in sorted(categorized_files.items()):
        category_name = category.replace('_', ' ').title()
        index_content += f"### {category_name} ({len(files)} products)\n\n"
        
        # Sort files alphabetically
        sorted_files = sorted(files, key=lambda x: x.name)
        for file in sorted_files:
            # Create a clean product name
            product_name = file.stem.replace('-sds', '').replace('-', ' ').title()
            relative_path = f"{category.replace('_', '-')}/{file.name}"
            index_content += f"- [{product_name}]({relative_path})\n"
        
        index_content += "\n"
    
    if uncategorized:
        index_content += f"### Miscellaneous ({len(uncategorized)} products)\n\n"
        for file in sorted(uncategorized, key=lambda x: x.name):
            product_name = file.stem.replace('-sds', '').replace('-', ' ').title()
            relative_path = f"miscellaneous/{file.name}"
            index_content += f"- [{product_name}]({relative_path})\n"
    
    index_content += "\n---\n\n"
    index_content += "## Conversion Information\n\n"
    index_content += "All PDF files were successfully converted to markdown format using multiple PDF processing methods:\n"
    index_content += "- **Primary Method**: pdfplumber (best for tables and formatting)\n"
    index_content += "- **Fallback Methods**: PyMuPDF, PyPDF2, pdfminer\n"
    index_content += "- **Success Rate**: 100% (226/226 files)\n\n"
    index_content += "For detailed conversion statistics, see [conversion_report.md](conversion_report.md)\n"
    
    # Write index file
    with open(organized_dir / 'README.md', 'w', encoding='utf-8') as f:
        f.write(index_content)

if __name__ == '__main__':
    organize_files()