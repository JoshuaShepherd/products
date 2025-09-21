import csv
import sys

# Read the CSV file properly handling quoted fields
with open('public/data/products_rows.csv', 'r', encoding='utf-8') as file:
    reader = csv.reader(file)
    header = next(reader)
    
    # Find the column indices
    try:
        product_index = header.index('product')
        emergency_index = header.index('emergency_response_guide')
    except ValueError as e:
        print(f"Error finding columns: {e}")
        sys.exit(1)
    
    print("-- Update emergency_response_guide for ALL products")
    print("-- Generated from CSV data")
    print("")
    
    for row in reader:
        if len(row) > max(product_index, emergency_index):
            product = row[product_index].strip()
            emergency = row[emergency_index].strip()
            
            if product and emergency and product != 'product':
                # Escape single quotes for SQL
                product_escaped = product.replace("'", "''")
                emergency_escaped = emergency.replace("'", "''")
                
                print(f"UPDATE products SET emergency_response_guide = '{emergency_escaped}' WHERE name = '{product_escaped}';")