-- Products Database Schema for Concrete Chemical Company
-- Comprehensive database design for product and label management

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better data consistency
CREATE TYPE hazard_signal AS ENUM ('Danger', 'Warning', 'None');
CREATE TYPE hazard_class AS ENUM ('Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Not applicable');
CREATE TYPE packing_group AS ENUM ('PG I', 'PG II', 'PG III', 'Not applicable');

-- Core product categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pictogram/hazard symbols reference
CREATE TABLE pictograms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Core products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE,
    category_id UUID REFERENCES categories(id),
    
    -- Multi-language descriptions
    short_description_english TEXT,
    short_description_french TEXT,
    short_description_spanish TEXT,
    description TEXT,
    
    -- Application and technical information
    application TEXT,
    features TEXT,
    coverage TEXT,
    limitations TEXT,
    shelf_life TEXT,
    voc_data TEXT,
    
    -- Safety and hazard information
    signal_word hazard_signal DEFAULT 'None',
    components_determining_hazard TEXT,
    hazard_statements TEXT,
    precautionary_statements TEXT,
    response_statements TEXT,
    first_aid TEXT,
    storage TEXT,
    disposal TEXT,
    
    -- French safety translations
    composants_determinant_le_danger TEXT,
    mot_de_signalement TEXT,
    mentions_de_danger TEXT,
    conseils_de_prudence TEXT,
    premiers_soins TEXT,
    mesures_de_premiers_secours TEXT,
    consignes_de_stockage TEXT,
    consignes_delimination TEXT,
    
    -- Shipping and regulatory
    proper_shipping_name TEXT,
    un_number TEXT,
    hazard_class hazard_class DEFAULT 'Not applicable',
    packing_group packing_group DEFAULT 'Not applicable',
    emergency_response_guide TEXT,
    
    -- Product attributes
    subtitle_1 TEXT,
    subtitle_2 TEXT,
    do_not_freeze BOOLEAN DEFAULT false,
    mix_well BOOLEAN DEFAULT false,
    green_conscious BOOLEAN DEFAULT false,
    used_by_date TEXT,
    
    -- Status and metadata
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product pictograms junction table (many-to-many relationship)
CREATE TABLE product_pictograms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    pictogram_id UUID REFERENCES pictograms(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, pictogram_id)
);

-- Product images/media
CREATE TABLE product_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    media_type VARCHAR(50) NOT NULL, -- 'image', 'pdf', 'video', etc.
    url TEXT NOT NULL,
    alt_text VARCHAR(255),
    caption TEXT,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Label templates for different sizes/formats
CREATE TABLE label_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    width_mm DECIMAL(6,2),
    height_mm DECIMAL(6,2),
    html_template TEXT NOT NULL,
    css_template TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Generated labels history/cache
CREATE TABLE product_labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    template_id UUID REFERENCES label_templates(id),
    generated_html TEXT,
    pdf_url TEXT,
    language VARCHAR(10) DEFAULT 'en', -- 'en', 'fr', 'es'
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product variants (different sizes, formulations, etc.)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    size VARCHAR(100),
    unit VARCHAR(50),
    weight_kg DECIMAL(8,3),
    volume_liters DECIMAL(8,3),
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Technical specifications
CREATE TABLE product_specifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    spec_name VARCHAR(255) NOT NULL,
    spec_value TEXT NOT NULL,
    unit VARCHAR(50),
    test_method VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Usage instructions and application methods
CREATE TABLE application_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    method_name VARCHAR(255) NOT NULL,
    instructions TEXT NOT NULL,
    coverage_rate VARCHAR(255),
    equipment_required TEXT,
    temperature_range VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_product_pictograms_product ON product_pictograms(product_id);
CREATE INDEX idx_product_media_product ON product_media(product_id);
CREATE INDEX idx_product_labels_product ON product_labels(product_id);
CREATE INDEX idx_product_labels_current ON product_labels(is_current);

-- Full text search indexes
CREATE INDEX idx_products_search ON products USING gin(
    to_tsvector('english', 
        COALESCE(name, '') || ' ' || 
        COALESCE(short_description_english, '') || ' ' || 
        COALESCE(description, '') || ' ' || 
        COALESCE(features, '')
    )
);

-- RLS (Row Level Security) policies would go here if needed
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_label_templates_updated_at BEFORE UPDATE ON label_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for easier data access
CREATE VIEW products_with_category AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

CREATE VIEW products_with_pictograms AS
SELECT 
    p.*,
    array_agg(pic.name ORDER BY pp.sort_order) as pictogram_names,
    array_agg(pic.url ORDER BY pp.sort_order) as pictogram_urls
FROM products p
LEFT JOIN product_pictograms pp ON p.id = pp.product_id
LEFT JOIN pictograms pic ON pp.pictogram_id = pic.id
GROUP BY p.id;
