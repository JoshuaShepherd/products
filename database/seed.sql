-- Seed data for the products database
-- Insert initial categories and pictograms

-- Insert root categories
INSERT INTO categories (name, slug, description, parent_id) VALUES
('Cleaners & Strippers', 'cleaners-strippers', 'Cleaning and surface preparation products', NULL),
('Decorative & Protective Sealers', 'decorative-protective-sealers', 'Surface protection and enhancement products', NULL),
('Water Repellents', 'water-repellents', 'Water penetration prevention products', NULL),
('Tilt Up Bond Breakers', 'tilt-up-bond-breakers', 'Release agents for tilt-up construction', NULL),
('Concrete Sealer/Densifier/Hardener', 'concrete-sealer-densifier-hardener', 'Surface hardening and densification products', NULL),
('Form Release Agents & Form Treatment', 'form-release-agents', 'Form release and treatment products', NULL),
('Paving Curing Compounds', 'paving-curing-compounds', 'Curing compounds for paving applications', NULL),
('Repair Mortars', 'repair-mortars', 'Concrete repair and patching products', NULL),
('Specialty Epoxies', 'specialty-epoxies', 'Epoxy-based specialty products', NULL),
('Surface Retarders', 'surface-retarders', 'Surface etching and retarding products', NULL);

-- Insert common pictograms
INSERT INTO pictograms (name, slug, url, description) VALUES
('Environmental Hazard', 'environmental-hazard', 'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fenvironmental-hazard.png?alt=media&token=6bca89fe-4727-4d17-b3e6-c52e36a6be53', 'Dangerous for the environment'),
('Exclamation', 'exclamation', 'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fexclamation.png?alt=media&token=a0120ae4-b4d0-482c-aca9-1400dbd294b9', 'Health hazard/Hazardous to the ozone layer'),
('Flame', 'flame', 'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fflame.png?alt=media&token=3691deab-dcab-4803-8c2b-150c141e95a1', 'Flammable'),
('Health Hazard', 'health-hazard', 'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fhealth-hazard.png?alt=media&token=6afae00b-0abb-47d6-9740-364dd060e28e', 'Serious health hazard'),
('Corrosion', 'corrosion', 'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fcorrosion.png?alt=media&token=2f651653-221f-45a8-9a02-feba14900d9e', 'Corrosive'),
('Green Conscious', 'green-conscious', 'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fgreen-conscious.png?alt=media&token=1337ae3b-9ed9-4956-8d2f-fc958810c039', 'Environmentally conscious product'),
('Do Not Freeze', 'do-not-freeze', 'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fdo-not-freeze.png?alt=media&token=20c12d11-97d2-4863-999c-3a0e08ccfee4', 'Do not allow to freeze');

-- Insert sample label templates
INSERT INTO label_templates (name, slug, description, width_mm, height_mm, html_template, css_template) VALUES
(
    'Standard Label 4x6', 
    'standard-4x6', 
    'Standard 4x6 inch product label template',
    101.6,
    152.4,
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{product_name}} Label</title>
</head>
<body>
    <div class="label-container">
        <div class="header">
            <h1 class="product-name">{{product_name}}</h1>
            <p class="short-description">{{short_description}}</p>
        </div>
        
        <div class="hazard-section">
            {{#if signal_word}}
            <div class="signal-word {{signal_word_class}}">{{signal_word}}</div>
            {{/if}}
            
            <div class="pictograms">
                {{#each pictograms}}
                <img src="{{url}}" alt="{{name}}" class="pictogram">
                {{/each}}
            </div>
        </div>
        
        <div class="content">
            {{#if hazard_statements}}
            <div class="hazard-statements">
                <h3>Hazard Statements</h3>
                <p>{{hazard_statements}}</p>
            </div>
            {{/if}}
            
            {{#if precautionary_statements}}
            <div class="precautionary-statements">
                <h3>Precautionary Statements</h3>
                <p>{{precautionary_statements}}</p>
            </div>
            {{/if}}
        </div>
        
        <div class="footer">
            {{#if shelf_life}}
            <p class="shelf-life">Shelf Life: {{shelf_life}}</p>
            {{/if}}
            {{#if voc_data}}
            <p class="voc-data">{{voc_data}}</p>
            {{/if}}
        </div>
    </div>
</body>
</html>',
    '.label-container {
        width: 4in;
        height: 6in;
        padding: 0.25in;
        font-family: Arial, sans-serif;
        font-size: 10pt;
        border: 2px solid #000;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
    }
    
    .header {
        text-align: center;
        margin-bottom: 0.25in;
    }
    
    .product-name {
        font-size: 16pt;
        font-weight: bold;
        margin: 0 0 0.1in 0;
        text-transform: uppercase;
    }
    
    .short-description {
        font-size: 11pt;
        margin: 0;
        color: #333;
    }
    
    .hazard-section {
        display: flex;
        align-items: center;
        margin-bottom: 0.25in;
        gap: 0.1in;
    }
    
    .signal-word {
        font-weight: bold;
        font-size: 12pt;
        padding: 2px 8px;
        border-radius: 3px;
    }
    
    .signal-word.danger {
        background-color: #ff0000;
        color: white;
    }
    
    .signal-word.warning {
        background-color: #ffa500;
        color: black;
    }
    
    .pictograms {
        display: flex;
        gap: 4px;
    }
    
    .pictogram {
        width: 0.5in;
        height: 0.5in;
        object-fit: contain;
    }
    
    .content {
        flex: 1;
        font-size: 9pt;
    }
    
    .content h3 {
        font-size: 10pt;
        margin: 0.1in 0 0.05in 0;
        font-weight: bold;
    }
    
    .content p {
        margin: 0 0 0.1in 0;
        line-height: 1.2;
    }
    
    .footer {
        margin-top: auto;
        font-size: 8pt;
        color: #666;
    }
    
    .footer p {
        margin: 0.05in 0;
    }'
),
(
    'Compact Label 3x2', 
    'compact-3x2', 
    'Compact 3x2 inch product label template',
    76.2,
    50.8,
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{product_name}} Compact Label</title>
</head>
<body>
    <div class="label-container compact">
        <div class="header-compact">
            <h1 class="product-name-compact">{{product_name}}</h1>
            {{#if signal_word}}
            <span class="signal-word-compact {{signal_word_class}}">{{signal_word}}</span>
            {{/if}}
        </div>
        
        <div class="pictograms-compact">
            {{#each pictograms}}
            <img src="{{url}}" alt="{{name}}" class="pictogram-compact">
            {{/each}}
        </div>
        
        <div class="essential-info">
            {{#if voc_data}}
            <p class="voc-compact">{{voc_data}}</p>
            {{/if}}
        </div>
    </div>
</body>
</html>',
    '.label-container.compact {
        width: 3in;
        height: 2in;
        padding: 0.125in;
        font-family: Arial, sans-serif;
        font-size: 8pt;
        border: 1px solid #000;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
    }
    
    .header-compact {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.125in;
    }
    
    .product-name-compact {
        font-size: 11pt;
        font-weight: bold;
        margin: 0;
        flex: 1;
        text-transform: uppercase;
    }
    
    .signal-word-compact {
        font-weight: bold;
        font-size: 8pt;
        padding: 1px 4px;
        border-radius: 2px;
        margin-left: 0.125in;
    }
    
    .signal-word-compact.danger {
        background-color: #ff0000;
        color: white;
    }
    
    .signal-word-compact.warning {
        background-color: #ffa500;
        color: black;
    }
    
    .pictograms-compact {
        display: flex;
        gap: 2px;
        margin-bottom: 0.125in;
    }
    
    .pictogram-compact {
        width: 0.25in;
        height: 0.25in;
        object-fit: contain;
    }
    
    .essential-info {
        flex: 1;
        font-size: 7pt;
    }
    
    .voc-compact {
        margin: 0;
        font-weight: bold;
    }'
);
