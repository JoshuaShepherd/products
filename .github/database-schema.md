# SpecChem Products Database - Complete Schema Documentation

**Generated**: 9/23/2025 at 8:25:20 AM  
**Database**: https://bnwbjrlgoylmbblfmsru.supabase.co  
**Total Tables**: 9  
**Total Records**: 1,336  
**Status**: ✅ Live Production Schema

## Executive Summary

This database powers the SpecChem Products system, supporting:
- **Product Management**: 259 products across 36 categories
- **Safety Compliance**: 22 safety pictograms with 499 product associations
- **Label Generation**: 2 base templates with individual customization support
- **Multi-language Support**: English, French, Spanish product data

## Database Overview

| Table | Records | Purpose | Status |
|-------|---------|---------|--------|
| `products` | 259 | Core product catalog and specifications | 🟢 Active |
| `categories` | 36 | Product categorization and hierarchy | 🟢 Active |
| `pictograms` | 22 | Safety pictogram library (GHS compliant) | 🟢 Active |
| `product_pictograms` | 499 | Product-to-pictogram relationships | 🟢 Active |
| `label_templates` | 2 | Base HTML/CSS templates for label generation | 🟢 Active |
| `product_labels` | 518 | Generated label cache and history | 🟢 Active |
| `individual_label_templates` | 0 | Product-specific CSS customizations | 🟡 Empty |
| `product_media` | 0 | Product images and documentation | 🟡 Empty |
| `product_variants` | 0 | Size/formulation variants | 🟡 Empty |


## Detailed Table Specifications

### products

**Records**: 259 | **Columns**: 56

**Purpose**: Central table containing all product information including names, descriptions, safety data, and regulatory information in multiple languages.

**Structure**:
- `id` (UUID) (Primary Key) - Sample: `a6a0294e-dc82-48ba-8159-cec335198f70`
- `name` (VARCHAR) - Sample: `Reaxion`
- `slug` (VARCHAR) - Sample: `reaxion`
- `sku` (nullable)
- `category_id` (UUID) (Foreign Key) - Sample: `c81e4669-62fd-43cd-99fd-123dd9119978`
- `short_description_english` (nullable)
- `short_description_french` (nullable)
- `short_description_spanish` (nullable)
- `description` (nullable)
- `application` (nullable)
- `features` (nullable)
- `coverage` (nullable)
- `limitations` (nullable)
- `shelf_life` (nullable)
- `voc_data` (nullable)
- `signal_word` (VARCHAR) - Sample: `None`
- `components_determining_hazard` (nullable)
- `hazard_statements` (nullable)
- `precautionary_statements` (nullable)
- `response_statements` (nullable)
- `first_aid` (nullable)
- `storage` (nullable)
- `disposal` (nullable)
- `composants_determinant_le_danger` (nullable)
- `mot_de_signalement` (nullable)
- `mentions_de_danger` (nullable)
- `conseils_de_prudence` (nullable)
- `premiers_soins` (nullable)
- `mesures_de_premiers_secours` (nullable)
- `consignes_de_stockage` (nullable)
- `consignes_delimination` (nullable)
- `proper_shipping_name` (VARCHAR) - Sample: ``
- `un_number` (nullable)
- `hazard_class` (VARCHAR) - Sample: `Not applicable`
- `packing_group` (VARCHAR) - Sample: `Not applicable`
- `emergency_response_guide` (VARCHAR) - Sample: ``
- `subtitle_1` (nullable)
- `subtitle_2` (nullable)
- `do_not_freeze` (BOOLEAN) - Sample: `false`
- `mix_well` (BOOLEAN) - Sample: `false`
- `green_conscious` (BOOLEAN) - Sample: `false`
- `used_by_date` (nullable)
- `is_active` (BOOLEAN) - Sample: `true`
- `sort_order` (INTEGER) - Sample: `0`
- `created_at` (TIMESTAMP) - Sample: `2025-09-04T08:17:47.682428+00:00`
- `updated_at` (TIMESTAMP) - Sample: `2025-09-09T21:14:55.257411+00:00`
- `pictograms` (nullable)
- `pictogram_urls` (nullable)
- `test_data` (nullable)
- `cleaning_info` (nullable)
- `conditions_of_sale` (TEXT) - Sample: `CONDITIONS OF SALE - SpecChem offers this product ...`
- `warranty_limitation` (TEXT) - Sample: `WARRANTY LIMITATION - SpecChem warrants this produ...`
- `inherent_risk` (VARCHAR) - Sample: `INHERENT RISK - Purchaser assumes all risk associa...`
- `additional_terms` (nullable)
- `manufacturing_notice` (VARCHAR) - Sample: `Made in America`
- `safety_notice` (VARCHAR) - Sample: `DO NOT EXPOSE TO OR APPLY NEAR FIRE OR FLAMES. FOR...`

**Relationships**:
- `category_id` → `categorys(id)`

**Sample Record**:
```json
{
  "id": "a6a0294e-dc82-48ba-8159-cec335198f70",
  "name": "Reaxion",
  "slug": "reaxion",
  "sku": null,
  "category_id": "c81e4669-62fd-43cd-99fd-123dd9119978",
  "short_description_english": null,
  "short_description_french": null,
  "short_description_spanish": null,
  "description": null,
  "application": null,
  "features": null,
  "coverage": null,
  "limitations": null,
  "shelf_life": null,
  "voc_data": null,
  "signal_word": "None",
  "components_determining_hazard": null,
  "hazard_statements": null,
  "precautionary_statements": null,
  "response_statements": null,
  "first_aid": null,
  "storage": null,
  "disposal": null,
  "composants_determinant_le_danger": null,
  "mot_de_signalement": null,
  "mentions_de_danger": null,
  "conseils_de_prudence": null,
  "premiers_soins": null,
  "mesures_de_premiers_secours": null,
  "consignes_de_stockage": null,
  "consignes_delimination": null,
  "proper_shipping_name": "",
  "un_number": null,
  "hazard_class": "Not applicable",
  "packing_group": "Not applicable",
  "emergency_response_guide": "",
  "subtitle_1": null,
  "subtitle_2": null,
  "do_not_freeze": false,
  "mix_well": false,
  "green_conscious": false,
  "used_by_date": null,
  "is_active": true,
  "sort_order": 0,
  "created_at": "2025-09-04T08:17:47.682428+00:00",
  "updated_at": "2025-09-09T21:14:55.257411+00:00",
  "pictograms": null,
  "pictogram_urls": null,
  "test_data": null,
  "cleaning_info": null,
  "conditions_of_sale": "CONDITIONS OF SALE - SpecChem offers this product for sale subject to and limited by the warranty which may only be varied by written agreement of a duly authorized corporate officer of Spec-Chem. No other representative of or for SpecChem is authorized to grant any warranty or to waive limitation of liability set forth below.",
  "warranty_limitation": "WARRANTY LIMITATION - SpecChem warrants this product to be free of manufacturing defects. If the product when purchased was defective and was within use period indicated on container or carton, when used, SpecChem will replace the defective product with new product without charge to the purchaser. SpecChem makes no other warranty, either expressed or implied, concerning this product. There is no warranty of merchantability. NO CLAIM OF ANY KIND SHALL BE GREATER THAN THE PURCHASE PRICE OF THE PRODUCT IN RESPECT OF WHICH DAMAGES ARE CLAIMED.",
  "inherent_risk": "INHERENT RISK - Purchaser assumes all risk associated with the use or application of the product.",
  "additional_terms": null,
  "manufacturing_notice": "Made in America",
  "safety_notice": "DO NOT EXPOSE TO OR APPLY NEAR FIRE OR FLAMES. FOR WELL VENTILATED OR EXTERIOR USE ONLY!"
}
```

---

### categories

**Records**: 36 | **Columns**: 9

**Purpose**: Hierarchical classification system for organizing products into logical groups and subcategories.

**Structure**:
- `id` (UUID) (Primary Key) - Sample: `9f69b4c0-4da1-4914-a7d8-fa85435f4ac6`
- `name` (VARCHAR) - Sample: `Surface Retarders`
- `slug` (VARCHAR) - Sample: `surface-retarders`
- `description` (VARCHAR) - Sample: `Category for Surface Retarders products`
- `parent_id` (nullable) (Foreign Key)
- `sort_order` (INTEGER) - Sample: `0`
- `is_active` (BOOLEAN) - Sample: `true`
- `created_at` (TIMESTAMP) - Sample: `2025-09-04T07:09:27.262935+00:00`
- `updated_at` (TIMESTAMP) - Sample: `2025-09-04T08:49:48.934224+00:00`

**Relationships**:
- `parent_id` → `parents(id)`

**Sample Record**:
```json
{
  "id": "9f69b4c0-4da1-4914-a7d8-fa85435f4ac6",
  "name": "Surface Retarders",
  "slug": "surface-retarders",
  "description": "Category for Surface Retarders products",
  "parent_id": null,
  "sort_order": 0,
  "is_active": true,
  "created_at": "2025-09-04T07:09:27.262935+00:00",
  "updated_at": "2025-09-04T08:49:48.934224+00:00"
}
```

---

### pictograms

**Records**: 22 | **Columns**: 7

**Purpose**: Library of standardized GHS safety pictograms used for hazard communication on product labels.

**Structure**:
- `id` (UUID) (Primary Key) - Sample: `9ef33c1d-bb3d-4592-942a-16cf9d7e6638`
- `name` (VARCHAR) - Sample: `Environmental Hazard`
- `slug` (VARCHAR) - Sample: `environmental-hazard`
- `url` (VARCHAR) - Sample: `https://firebasestorage.googleapis.com/v0/b/specch...`
- `description` (VARCHAR) - Sample: `Dangerous for the environment`
- `is_active` (BOOLEAN) - Sample: `true`
- `created_at` (TIMESTAMP) - Sample: `2025-09-04T07:09:27.262935+00:00`

**Sample Record**:
```json
{
  "id": "9ef33c1d-bb3d-4592-942a-16cf9d7e6638",
  "name": "Environmental Hazard",
  "slug": "environmental-hazard",
  "url": "https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fenvironmental-hazard.png?alt=media&token=6bca89fe-4727-4d17-b3e6-c52e36a6be53",
  "description": "Dangerous for the environment",
  "is_active": true,
  "created_at": "2025-09-04T07:09:27.262935+00:00"
}
```

---

### product_pictograms

**Records**: 499 | **Columns**: 5

**Purpose**: Junction table linking products to their applicable safety pictograms with sort ordering.

**Structure**:
- `id` (UUID) (Primary Key) - Sample: `51014c89-867d-4d02-99ed-2db6d387262f`
- `product_id` (UUID) (Foreign Key) - Sample: `5ca70de6-5d26-4569-b3b3-943887db3160`
- `pictogram_id` (UUID) (Foreign Key) - Sample: `36d1e9c6-0347-4223-bfd1-dfe3332b1e4d`
- `sort_order` (INTEGER) - Sample: `0`
- `created_at` (TIMESTAMP) - Sample: `2025-09-04T08:17:49.415199+00:00`

**Relationships**:
- `product_id` → `products(id)`
- `pictogram_id` → `pictograms(id)`

**Sample Record**:
```json
{
  "id": "51014c89-867d-4d02-99ed-2db6d387262f",
  "product_id": "5ca70de6-5d26-4569-b3b3-943887db3160",
  "pictogram_id": "36d1e9c6-0347-4223-bfd1-dfe3332b1e4d",
  "sort_order": 0,
  "created_at": "2025-09-04T08:17:49.415199+00:00"
}
```

---

### label_templates

**Records**: 2 | **Columns**: 11

**Purpose**: Base HTML and CSS templates that define the layout and styling for different label sizes (14x7" and 5x9").

**Structure**:
- `id` (UUID) (Primary Key) - Sample: `73ebcc57-63fb-4ca6-a6ab-790feeefa186`
- `name` (VARCHAR) - Sample: `5x9 Compact Format`
- `slug` (VARCHAR) - Sample: `5x9-compact`
- `description` (VARCHAR) - Sample: `Compact 9" x 5" label template for smaller product...`
- `width_mm` (DECIMAL) - Sample: `228.6`
- `height_mm` (INTEGER) - Sample: `127`
- `html_template` (TEXT) - Sample: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta ...`
- `css_template` (TEXT) - Sample: `@import url('https://fonts.googleapis.com/css2?fam...`
- `is_active` (BOOLEAN) - Sample: `true`
- `created_at` (TIMESTAMP) - Sample: `2025-09-04T07:37:11.380406+00:00`
- `updated_at` (TIMESTAMP) - Sample: `2025-09-23T13:14:43.795212+00:00`

**Sample Record**:
```json
{
  "id": "73ebcc57-63fb-4ca6-a6ab-790feeefa186",
  "name": "5x9 Compact Format",
  "slug": "5x9-compact",
  "description": "Compact 9\" x 5\" label template for smaller product containers",
  "width_mm": 228.6,
  "height_mm": 127,
  "html_template": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\" />\n    <title>{{product_name}} | SpecChem</title>\n    <style>{{css_styles}}</style>\n</head>\n<body>\n    <div class=\"label-container\">\n    <div class=\"columns-container\">\n\n      <!-- Left Columns -->\n      <div class=\"left-columns\">\n        <div class=\"lc-section\">{{#if description}}<h4>Description</h4><p>{{description}}</p>{{/if}}</div>\n        <div class=\"lc-section\">{{#if voc_data}}<h4>VOC Data</h4><p>{{voc_data}}</p>{{/if}}</div>\n        <div class=\"lc-section\">{{#if application}}<h4>Application</h4><p>{{application}}</p>{{/if}}</div>\n        <div class=\"lc-section\">{{#if features}}<h4>Features</h4><p>{{features}}</p>{{/if}}</div>\n        <div class=\"lc-section\">{{#if coverage}}<h4>Coverage</h4><p>{{coverage}}</p>{{/if}}</div>\n        <div class=\"lc-section\">{{#if limitations}}<h4>Limitations</h4><p>{{limitations}}</p>{{/if}}</div>\n        <div class=\"lc-section\">{{#if shelf_life}}<h4>Shelf Life</h4><p>{{shelf_life}}</p>{{/if}}</div>\n      </div>\n\n      <!-- Center Content -->\n      <div class=\"center-content\">\n        <div class=\"product-name\" style=\"margin:0;\">{{name}}</div>\n        \n        {{#if short_description_english}}<div class=\"short-description-english\">{{short_description_english}}</div>{{/if}}\n        {{#if short_description_french}}<div class=\"translated-short-description\">{{short_description_french}}</div>{{/if}}\n        {{#if short_description_spanish}}<div class=\"translated-short-description\">{{short_description_spanish}}</div>{{/if}}\n        <div class=\"center-bottom-content\">\n          \n        </div>\n      </div>\n\n      <!-- Logo moved outside .center-content -->\n      <div class=\"logo-container\">\n        <img src=\"https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/branding%2Flogo-transparent.webp?alt=media&token=0b494edd-5a0a-4f37-8227-8e88356881f8\" alt=\"SpecChem Logo\">\n      </div>\n\n      <!-- Right Columns -->\n      <div class=\"right-columns\">\n        <div class=\"rc-section\">{{#if components_determining_hazard}}<h4>Components Determining Hazard</h4><p>{{components_determining_hazard}}</p>{{/if}}</div>\n\n        <div class=\"rc-section\">{{#if signal_word}}<h4>Signal Word</h4><p><strong>{{signal_word}}</strong></p>{{/if}}</div>\n\n        <div class=\"rc-section\">{{#if hazard_statements}}<h4>Hazard Statements</h4><p>{{hazard_statements}}</p>{{/if}}</div>\n\n        <div class=\"rc-section\">{{#if precautionary_statements}}<h4>Precautionary Statements</h4><p>{{precautionary_statements}}</p>{{/if}}</div>\n\n        <div class=\"rc-section\">{{#if response_statements}}<h4>Response Statements</h4><p>{{response_statements}}</p>{{/if}}</div>\n\n        <div class=\"rc-section\">{{#if storage}}<h4>Storage</h4><p>{{storage}}</p>{{/if}}</div>\n\n        <div class=\"rc-section\">{{#if disposal}}<h4>Disposal</h4><p>{{disposal}}</p>{{/if}}</div>\n\n        <div class=\"rc-section\">\n          <h4>Transport</h4>\n          {{#if proper_shipping_name}}<p><b>Proper Shipping Name:</b> {{proper_shipping_name}}</p>{{/if}}\n          {{#if un_number}}<p><b>UN Number:</b> {{un_number}}</p>{{/if}}\n          {{#if hazard_class}}<p><b>Hazard Class:</b> {{hazard_class}}</p>{{/if}}\n          {{#if packing_group}}<p><b>Packing Group:</b> {{packing_group}}</p>{{/if}}\n          {{#if emergency_response_guide}}<p><b>N.A. Emergency Response Guidebook #:</b> {{emergency_response_guide}}</p>{{/if}}\n        </div>\n\n                   <!-- Manufacturing and Safety Notices -->\n                {{#if safety_notice}}\n                <div class=\"manufacturing-safety-notices\">\n                    <div class=\"rc-section\">\n                        <h4>Safety Notice</h4>\n                        <p class=\"safety-notice\">{{safety_notice}}</p>\n                    </div>\n                </div>\n                {{/if}}\n                \n                <!-- Warranty/Conditions Section -->\n                {{#if conditions_of_sale}}\n                <div class=\"warranty-conditions-right\">\n                    <div class=\"rc-section\">\n                        <h4>Conditions of Sale</h4>\n                        <p>{{conditions_of_sale}}</p>\n                    </div>\n                       {{/if}}\n                    {{#if warranty_limitation}}\n                    <div class=\"rc-section\">\n                        <h4>Warranty Limitation</h4>\n                        <p>{{warranty_limitation}}</p>\n                    </div>\n                    {{/if}}\n                    {{#if inherent_risk}}\n                    <div class=\"rc-section\">\n                        <h4>Inherent Risk</h4>\n                        <p>{{inherent_risk}}</p>\n                    </div>\n                    {{/if}}\n                    {{#if additional_terms}}\n                    <div class=\"rc-section\">\n                        <h4>Additional Terms</h4>\n                        <p>{{additional_terms}}</p>\n                    </div>\n                    {{/if}}\n                </div>\n            </div>\n        </div>\n\n    <div class=\"label-bottom-bar\">\n      {{#if do_not_freeze}}<img src=\"https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fdo-not-freeze.png?alt=media&token=20c12d11-97d2-4863-999c-3a0e08ccfee4\" class=\"corner-icon\" alt=\"Do Not Freeze\"/>{{/if}}\n      <img src=\"https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Frectangle-pictogram.png?alt=media&token=a469c938-f942-4f1f-b825-444828d6a8f3\" alt=\"Danger Icon\" class=\"corner-icon-danger\">\n    </div>\n\n    <div class=\"code-row\">\n      <img src=\"https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fproduct-qr.png?alt=media&token=c832e9c2-525d-4dbf-984d-f8f249acf86e\" class=\"qr-code\" alt=\"QR Code\" />\n      <div class=\"code-info\">\n        <div class=\"batch-field\"><label>Batch No:</label><input type=\"text\" name=\"batch-no\" /></div>\n        <div class=\"package-size\">1 Gallon/3.875L</div>\n        {{#if used_by_date}}<div class=\"use-by\">Used by date: {{used_by_date}}</div>{{/if}}\n      </div>\n      {{#if green_conscious}}<img src=\"https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fgreen-conscious.png?alt=media&token=1337ae3b-9ed9-4956-8d2f-fc958810c039\" class=\"green-conscious-icon\" alt=\"Green Conscious\"/>{{/if}}\n    </div>\n  </div>\n</body>\n</html>",
  "css_template": "@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&family=Lato:wght@400;700&display=swap');       \n@page {\n    size: 9in 5in;\n    margin: 0;\n}\n\nbody {\n    margin: 0;\n    padding: 0;\n    background: #e7eaf0;\n    font-family: 'Open Sans', Arial, sans-serif;\n}\n\n.label-container {\n    width: 9in;\n    height: 5in;\n    margin: 0 auto;\n    background: url(\"https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/branding%2F5x9-label-template.png?alt=media&token=afc42346-5527-4c06-8c50-1aaef543e1ef\") no-repeat center center;\n    background-size: cover;\n    position: relative;\n    display: flex;\n    flex-direction: column;\n    overflow: hidden;\n    box-sizing: border-box;\n}\n\n.watermark {\n    position: absolute;\n    top: 54%;\n    left: 50%;\n    transform: translate(-50%, -50%);\n    width: 215px;\n    opacity: 0.14;\n    z-index: 1;\n    pointer-events: none;\n    mix-blend-mode: multiply;\n    filter: blur(0.2px);\n    max-width: 60%;\n}\n\n.columns-container {\n    position: relative;\n    display: flex;\n    justify-content: space-between;\n    align-items: flex-start;\n    width: 100%;\n    height: 100%;\n    padding: 0.33in 0.36in 0.11in 0.36in;\n    box-sizing: border-box;\n    z-index: 2;\n}\n\n.left-columns, .right-columns {\n    width: 32%;\n    min-width: 130px;\n    max-width: 33%;\n    line-height: 1.16;\n    word-break: break-word;\n}\n\n.left-columns {\n    color: #18335b;\n    margin-top: .2in;\n    column-count: 2;\n    column-gap: 0.19in;\n}\n\n.right-columns {\n    color: #232942;\n    font-size: 4.7px;\n    line-height: 1.12;\n    margin-top: .5in;\n    column-count: 2;\n    column-gap: 0.19in;\n}\n\n.contact-block {\n    font-size: 4px;\n    line-height: 1.25;\n    margin-bottom: 2px;\n    color: #1a2340;\n    font-family: 'Open Sans', Arial, sans-serif;\n    word-break: break-word;\n}\n\n.left-columns h4 {\n    font-family: 'Montserrat', 'Open Sans', Arial, sans-serif;\n    font-size: 8.8px;\n    color: #1e3369;\n    text-transform: uppercase;\n    font-weight: 700;\n    margin-bottom: 0.5px;\n    margin-top: 11px;\n    letter-spacing: 0.07em;\n    padding-left: 5px; \n}\n\n.left-columns p, .left-columns ul, .left-columns li {\n    font-size: 6.2px;\n    color: inherit;\n    font-family: 'Montserrat', 'Open Sans', Arial, sans-serif;\n    margin: 0 0 3px 0;\n}\n\n.left-columns ul {\n    padding-left: 12px;\n}\n\n.right-columns h4 {\n    font-family: 'Montserrat', Arial, sans-serif;\n    font-size: 6.3px;\n    color: #233066;\n    text-transform: uppercase;\n    font-weight: 700;\n    margin-bottom: 0.5px;\n    margin-top: 4px;\n    letter-spacing: 0.04em;\n}\n\n.right-columns p,\n.right-columns ul,\n.right-columns li,\n.right-columns .statement-list {\n    font-size: 4px;\n    color: inherit;\n    font-family: 'Open Sans', Arial, sans-serif;\n    margin: 0 0 1.4px 0;\n    list-style: none;\n    padding-left: 0;\n}\n\n.right-columns .statement-list {\n    margin-bottom: 0.5em;\n}\n\n.right-columns .statement-list > div {\n    margin-bottom: 1px;\n}\n\n.right-columns .signal-word {\n    font-size: 4.7px;\n    font-weight: 700;\n    font-family: 'Montserrat', Arial, sans-serif;\n    margin-top: 0;\n    margin-bottom: 0.6px;\n}\n\n.center-content {\n    width: 31%;\n    min-width: 110px;\n    max-width: 32%;\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    text-align: center;\n    z-index: 5;\n    position: absolute;\n    left: 50%;\n    transform: translateX(-50%);\n    top: 120px;\n}\n\n.center-content .product-name {\n    font-family: 'Montserrat', Arial, sans-serif;\n    font-size: 24px;\n    font-weight: 700;\n    color: #21325b;\n    letter-spacing: 0.01em;\n    margin: 0 0 2px 0;\n    line-height: 1.1;\n}\n\n.short-description-english {\n    font-family: 'Montserrat', Arial, sans-serif;\n    font-size: 12px;\n    font-weight: 600;\n    color: #2453a6;\n    margin: 0 0 1.7px 0;\n    letter-spacing: 0.01em;\n}\n\n.translated-short-description {\n    font-size: 8px;\n    font-family: 'Open Sans', Arial, sans-serif;\n    color: #395073;\n    font-weight: 500;\n    margin: 0 0 1.3px 0;\n}\n\n.logo-container {\n    position: absolute;\n    left: 50%;\n    transform: translateX(-50%);\n    bottom: 38%;\n    margin: 0;\n    width: 100%;\n    display: flex;\n    justify-content: center;\n}\n\n.logo-container img {\n    width: 150px;\n    filter: drop-shadow(0 2px 8px #132e5712);\n}\n\n.center-bottom-content {\n    display: flex;\n    flex-direction: row;\n    gap: 8px;\n    justify-content: space-between;\n    align-items: center;\n    margin-top: 17px;\n    width: 100%;\n}\n\n.pictograms {\n    display: flex;\n    gap: 4px;\n    align-items: center;\n    margin: 0 0 3px 0;\n}\n\n.pictograms img {\n    width: 13px;\n    height: 13px;\n    object-fit: contain;\n    border-radius: 3px;\n    border: 1px solid #e3e8f1;\n    background: #f7fafc;\n}\n\n.label-bottom-bar {\n    position: absolute;\n    left: .1in;\n    bottom: .3in;\n    width: 100%;\n    display: flex;\n    align-items: flex-end;\n    z-index: 15;\n    height: 88px;\n}\n\n.corner-icon-danger {\n    width: 100px;\n    height: 60px;\n    object-fit: contain;\n    background: #fff;\n    border-radius: 12px;\n    box-shadow: 0 2px 6px #22316622;\n    padding: 4px;\n    margin-left: 4px;\n}\n\n.corner-icon {\n    width: 60px;\n    height: 60px;\n    object-fit: contain;\n    background: #fff;\n    border-radius: 12px;\n    box-shadow: 0 2px 6px #22316622;\n    padding: 4px;\n    margin-left: 13px;\n}\n\n.code-row {\n    position: absolute;\n    left: 50%;\n    bottom: 0.53in;\n    transform: translateX(-50%);\n    width: auto;\n    z-index: 20;\n    display: flex;\n    flex-direction: row;\n    align-items: flex-start;\n    justify-content: center;\n    gap: 35px;\n}\n\n.code-info {\n    display: flex;\n    flex-direction: column;\n    align-items: flex-start;\n    justify-content: center;\n    font-size: 13px;\n    color: #1b2754;\n    font-family: 'Open Sans', Arial, sans-serif;\n    gap: 4px;\n    min-width: 175px;\n}\n\n.batch-info-column {\n    display: flex;\n    flex-direction: column;\n    gap: 4px;\n}\n\n.batch-field,\n.package-size,\n.use-by {\n    text-align: left;\n    margin-left: 0;\n    font-size: 13px;\n    color: #1b2754;\n    font-family: 'Open Sans', Arial, sans-serif;\n}\n\n.batch-field label {\n    display: inline-block;\n    min-width: 74px;\n    padding: 0;\n    margin: 0;\n}\n\n.batch-field input {\n    width: 84px;\n    font-size: 13px;\n    border: none;\n    border-bottom: 1.5px solid #223166;\n    background: #f3f7ff;\n    outline: none;\n    padding: 2px 3px;\n    border-radius: 2.5px 2.5px 0 0;\n    margin-left: 0;\n    vertical-align: middle;\n}\n\n.qr-code {\n    width: 38px;\n    height: 38px;\n    flex-shrink: 0;\n    filter: drop-shadow(0 2px 4px #25408014);\n}\n\n.green-conscious-icon {\n    width: 38px;\n    position: absolute;\n    right: -15%;\n    top: 50%;\n    transform: translateY(-50%);\n}\n\n/* Manufacturing and Safety Notice Styles */\n.manufacturing-safety-notices {\n    margin-top: 4px;\n}\n\n.manufacturing-safety-notices .rc-section {\n    margin-bottom: 2px;\n}\n\n.manufacturing-safety-notices .rc-section h4 {\n    font-size: 5px;\n    margin-bottom: 0.5px;\n    margin-top: 2px;\n}\n\n.manufacturing-safety-notices .rc-section p {\n    font-size: 3.5px;\n    line-height: 1.1;\n    margin: 0 0 1px 0;\n    font-weight: 500;\n}\n\n.manufacturing-notice {\n    color: #1a5b2e !important;\n    font-weight: 600 !important;\n}\n\n.safety-notice {\n    font-weight: 600 !important;\n}\n\n/* Manufacturing Footer */\n.manufacturing-footer {\n    position: absolute;\n    bottom: 0.02in;\n    left: 50%;\n    transform: translateX(-50%);\n    z-index: 25;\n    text-align: center;\n}\n\n.manufacturing-footer .manufacturing-notice {\n    font-size: 6px;\n    font-family: 'Lato', Arial, sans-serif;\n    color: #1a5b2e;\n    font-weight: 600;\n    margin: 0;\n}\n\n/* Warranty/Conditions Styles */\n.warranty-conditions-right {\n    margin-top: 4px;\n}\n\n.warranty-conditions-right .rc-section {\n    margin-bottom: 2px;\n}\n\n.warranty-conditions-right .rc-section h4 {\n    font-size: 5px;\n    margin-bottom: 0.5px;\n    margin-top: 2px;\n}\n\n.warranty-conditions-right .rc-section p {\n    font-size: 3.2px;\n    line-height: 1.1;\n    margin: 0 0 1px 0;\n}\n\n.product-name-badge-wrap {\n    display: flex;\n    align-items: baseline;\n    justify-content: center;\n    gap: 7px;\n}\n\n.product-name-badge-wrap img {\n    width: 30px;\n    height: 30px;\n    margin-top: 2px;\n}\n\n.eco-badge {\n    margin-top: -10px;\n    vertical-align: baseline;\n}\n\n.center-content .subtitle {\n    font-family: 'Montserrat', Arial, sans-serif;\n    font-size: 10px;\n    color: #294b88;\n    font-weight: 500;\n    letter-spacing: 0.015em;\n    margin: 1px 0 1px 0;\n}\n\n.center-content .subtitle.subtitle-2 {\n    font-size: 8px;\n    color: #466db2;\n    font-weight: 400;\n    margin-bottom: 1px;\n}\n\n@media print {\n    body {\n        -webkit-print-color-adjust: exact;\n        print-color-adjust: exact;\n        background: none !important;\n    }\n    .label-container { \n        box-shadow: none !important;\n        border-radius: 0 !important;\n    }\n}",
  "is_active": true,
  "created_at": "2025-09-04T07:37:11.380406+00:00",
  "updated_at": "2025-09-23T13:14:43.795212+00:00"
}
```

---

### product_labels

**Records**: 518 | **Columns**: 11

**Purpose**: Cache of generated label HTML for performance optimization and version history tracking.

**Structure**:
- `id` (UUID) (Primary Key) - Sample: `f4133bae-43af-482d-9df0-230ae2b0d4d8`
- `product_id` (UUID) (Foreign Key) - Sample: `54cf1796-7dab-4a8d-94ee-c46294fcfe8f`
- `template_id` (UUID) (Foreign Key) - Sample: `73ebcc57-63fb-4ca6-a6ab-790feeefa186`
- `generated_html` (VARCHAR) - Sample: `<!-- PRODUCT: Strong Bond | TEMPLATE: 5x9 Compact ...`
- `pdf_url` (nullable)
- `language` (VARCHAR) - Sample: `en`
- `version` (INTEGER) - Sample: `1`
- `is_current` (BOOLEAN) - Sample: `true`
- `created_at` (TIMESTAMP) - Sample: `2025-09-19T15:57:08.440569+00:00`
- `product_name` (VARCHAR) - Sample: `Strong Bond`
- `template_name` (VARCHAR) - Sample: `5x9 Compact Format`

**Relationships**:
- `product_id` → `products(id)`
- `template_id` → `templates(id)`

**Sample Record**:
```json
{
  "id": "f4133bae-43af-482d-9df0-230ae2b0d4d8",
  "product_id": "54cf1796-7dab-4a8d-94ee-c46294fcfe8f",
  "template_id": "73ebcc57-63fb-4ca6-a6ab-790feeefa186",
  "generated_html": "<!-- PRODUCT: Strong Bond | TEMPLATE: 5x9 Compact Format -->\n",
  "pdf_url": null,
  "language": "en",
  "version": 1,
  "is_current": true,
  "created_at": "2025-09-19T15:57:08.440569+00:00",
  "product_name": "Strong Bond",
  "template_name": "5x9 Compact Format"
}
```

---

### individual_label_templates

**Records**: 0 | **Columns**: 0

**Purpose**: Product-specific CSS customizations that override base template styling for unique requirements.

**Structure**:

---

### product_media

**Records**: 0 | **Columns**: 0

**Purpose**: Storage references for product images, PDFs, and other media assets.

**Structure**:

---

### product_variants

**Records**: 0 | **Columns**: 0

**Purpose**: Different sizes, formulations, or packaging options for the same base product.

**Structure**:

---

## System Architecture

### Label Generation Pipeline

1. **Template Selection**: Based on size parameter (14x7 or 5x9)
2. **Data Retrieval**: Product data + related pictograms + categories
3. **Customization Check**: Look for individual CSS overrides
4. **Variable Substitution**: Replace Handlebars placeholders
5. **HTML Generation**: Complete label with embedded CSS
6. **PDF Generation**: Via Puppeteer for download/print

### CSS Customization Hierarchy

1. **Individual Customizations** (`individual_label_templates.css_overrides`)
2. **Base Templates** (`label_templates.css_template`)
3. **Default CSS** (fallback in application code)

### Data Flow Diagram

```
[Products] ←→ [Categories]
     ↓
[Product_Pictograms] ←→ [Pictograms]
     ↓
[Label_Templates] + [Individual_Label_Templates]
     ↓
[Generated Labels] → [PDF Output]
```

## Key Features

### Multi-language Support
- **English**: Primary language for all products
- **French**: `*_french` fields for Quebec compliance
- **Spanish**: `*_spanish` fields for international markets

### Safety Compliance
- **GHS Pictograms**: Standard hazard communication symbols
- **Signal Words**: DANGER, WARNING, CAUTION classifications
- **Hazard Statements**: Standardized safety warnings
- **Precautionary Statements**: Safety handling instructions

### Label Customization
- **Base Templates**: Professional designs for 14x7" and 5x9" labels
- **Individual Overrides**: Product-specific CSS customizations
- **Real-time Preview**: Live editing with immediate feedback
- **Version Control**: Timestamps and notes for change tracking

## Performance Considerations

### Indexes
- Primary keys (UUID) on all tables
- Foreign key indexes for relationships
- Product lookup optimizations
- Label template caching

### Optimization Opportunities
- Consider materialized views for complex product queries
- Implement caching for frequently accessed label templates
- Add full-text search indexes for product descriptions
- Consider partitioning for large datasets

## Security Model

### Row Level Security (RLS)
- Enabled on `individual_label_templates`
- Public read access for label generation
- Authenticated write access for customizations

### API Access
- Anonymous read access for public product catalogs
- Service role for administrative operations
- Authenticated users for label customization

## Maintenance Notes

### Regular Tasks
- Monitor table growth and performance
- Update pictogram URLs if hosting changes
- Validate foreign key integrity
- Archive old label versions if implemented

### Backup Strategy
- Critical tables: `products`, `label_templates`
- Moderate priority: `categories`, `pictograms`
- Regenerable: `product_labels`, `individual_label_templates`

---

**Last Updated**: 2025-09-23T13:25:19.976Z  
**Next Review**: 10/23/2025  
**Maintainer**: SpecChem Development Team
