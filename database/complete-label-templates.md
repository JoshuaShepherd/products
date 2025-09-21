# SpecChem Label Templates - Complete Set

This document contains all 4 template files needed for the SpecChem label system:
- 14x7 HTML Template
- 14x7 CSS Styles
- 5x9 HTML Template  
- 5x9 CSS Styles

---

## 1. 14x7 HTML Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>{{product_name}} | SpecChem</title>
    <style>{{css_styles}}</style>
</head>
<body>
    <div class="label-container">
        <div class="columns-container">
            <!-- Left Columns -->
            <div class="left-columns">
                <div class="lc-section">{{#if description}}<h4>Description</h4><p>{{description}}</p>{{/if}}</div>
                <div class="lc-section">{{#if voc_data}}<h4>VOC Data</h4><p>{{voc_data}}</p>{{/if}}</div>
                <div class="lc-section">{{#if application}}<h4>Application</h4><p>{{application}}</p>{{/if}}</div>
                <div class="lc-section">{{#if features}}<h4>Features</h4><p>{{features}}</p>{{/if}}</div>
                <div class="lc-section">{{#if limitations}}<h4>Limitations</h4><p>{{limitations}}</p>{{/if}}</div>
                <div class="lc-section">{{#if shelf_life}}<h4>Shelf Life</h4><p>{{shelf_life}}</p>{{/if}}</div>
            </div>

            <!-- Center Content -->
            <div class="center-content">
                <div class="product-name">{{name}}</div>
                {{#if subtitle_1}}<div class="subtitle">{{subtitle_1}}</div>{{/if}}
                {{#if subtitle_2}}<div class="subtitle subtitle-2">{{subtitle_2}}</div>{{/if}}
                {{#if short_description_english}}<div class="short-description-english">{{short_description_english}}</div>{{/if}}
                {{#if short_description_french}}<div class="translated-short-description">{{short_description_french}}</div>{{/if}}
                {{#if short_description_spanish}}<div class="translated-short-description">{{short_description_spanish}}</div>{{/if}}
                
                <div class="logo-container">
                    <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/branding%2Flogo-transparent.webp?alt=media&token=0b494edd-5a0a-4f37-8227-8e88356881f8" alt="SpecChem Logo">
                </div>
            </div>

            <!-- Right Columns -->
            <div class="right-columns" id="Font6">
                <div class="rc-section">{{#if pictograms}}<h4>Pictograms</h4><div class="pictograms">{{pictograms}}</div>{{/if}}</div>
                <div class="rc-section">{{#if components_determining_hazard}}<h4>Components Determining Hazard</h4><p>{{components_determining_hazard}}</p>{{/if}}</div>
                <div class="rc-section">{{#if signal_word}}<h4>Signal Word</h4><p>{{signal_word}}</p>{{/if}}</div>
                <div class="rc-section">{{#if hazard_statements}}<h4>Hazard Statements</h4><p>{{hazard_statements}}</p>{{/if}}</div>
                <div class="rc-section">{{#if precautionary_statements}}<h4>Precautionary Statements</h4><p>{{precautionary_statements}}</p>{{/if}}</div>
                <div class="rc-section">{{#if response_statements}}<h4>Response Statements</h4><p>{{response_statements}}</p>{{/if}}</div>
                <div class="rc-section">{{#if storage}}<h4>Storage</h4><p>{{storage}}</p>{{/if}}</div>
                <div class="rc-section">{{#if disposal}}<h4>Disposal</h4><p>{{disposal}}</p>{{/if}}</div>
                <div class="rc-section">
                    {{#if proper_shipping_name}}<h4>Transport</h4>
                    <p><b>Proper Shipping Name:</b> {{proper_shipping_name}}</p>
                    {{#if un_number}}<p><b>UN Number:</b> {{un_number}}</p>{{/if}}
                    {{#if hazard_class}}<p><b>Hazard Class:</b> {{hazard_class}}</p>{{/if}}
                    {{#if packing_group}}<p><b>Packing Group:</b> {{packing_group}}</p>{{/if}}
                    {{#if emergency_response_guide}}<p><b>N.A. Emergency Response Guidebook #:</b> {{emergency_response_guide}}</p>{{/if}}
                    {{/if}}
                </div>
                
                <!-- Manufacturing and Safety Notices -->
                {{#if safety_notice}}
                <div class="manufacturing-safety-notices">
                    <div class="rc-section">
                        <h4>Safety Notice</h4>
                        <p class="safety-notice">{{safety_notice}}</p>
                    </div>
                </div>
                {{/if}}
                
                <!-- Warranty/Conditions Section -->
                {{#if conditions_of_sale}}
                <div class="warranty-conditions-right">
                    <div class="rc-section">
                        <h4>Conditions of Sale</h4>
                        <p>{{conditions_of_sale}}</p>
                    </div>
                    {{#if warranty_limitation}}
                    <div class="rc-section">
                        <h4>Warranty Limitation</h4>
                        <p>{{warranty_limitation}}</p>
                    </div>
                    {{/if}}
                    {{#if inherent_risk}}
                    <div class="rc-section">
                        <h4>Inherent Risk</h4>
                        <p>{{inherent_risk}}</p>
                    </div>
                    {{/if}}
                    {{#if additional_terms}}
                    <div class="rc-section">
                        <h4>Additional Terms</h4>
                        <p>{{additional_terms}}</p>
                    </div>
                    {{/if}}
                </div>
                {{/if}}
            </div>
        </div>

        <!-- Corner Icons -->
        <div class="corner-icons">
            <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Frectangle-pictogram.png?alt=media&token=a469c938-f942-4f1f-b825-444828d6a8f3" alt="Other" class="corner-icon-rectangle">
        </div>

        <!-- Code Row -->
        <div class="code-row">
            <div class="code-info">
                <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fproduct-qr.png?alt=media&token=c832e9c2-525d-4dbf-984d-f8f249acf86e" class="qr-code" alt="QR Code" />
                <div class="batch-info-column">
                    <div class="batch-field"><label>Batch No:</label></div>
                    <div class="package-size">5 Gallon/18.93L</div>
                    {{#if used_by_date}}<div class="use-by">Used by date: {{used_by_date}}</div>{{/if}}
                </div>
            </div>
            {{#if green_conscious}}<img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fgreen-conscious.png?alt=media&token=green-conscious-icon" class="green-conscious-icon" alt="Green Conscious" />{{/if}}
        </div>

        <!-- Manufacturing Notice Footer -->
        {{#if manufacturing_notice}}
        <div class="manufacturing-footer">
            <p class="manufacturing-notice">{{manufacturing_notice}}</p>
        </div>
        {{/if}}
    </div>
</body>
</html>
```

---

## 2. 14x7 CSS Styles

```css
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&family=Lato:wght@400;700&display=swap');

@page {
    size: 14.875in 7.625in;
    margin: 0;
}

#Font6 p, #Font6 ul, #Font6 li { font-size: 6px !important; }
#Font6-5 p, #Font6-5 ul, #Font6-5 li { font-size: 6.5px !important; }
#Font7 p, #Font7 ul, #Font7 li { font-size: 7px !important; }
#Font8 p, #Font8 ul, #Font8 li { font-size: 8px !important; }
#Font9 p, #Font9 ul, #Font9 li { font-size: 9px !important; }
#Font10 p, #Font10 ul, #Font10 li { font-size: 9px !important; }
#Font11 p, #Font11 ul, #Font11 li { font-size: 9.5px !important; }

body {
    margin: 0;
    padding: 0;
    background: #e7eaf0;
    font-family: 'Open Sans', Arial, sans-serif;
}

.label-container {
    width: 14.875in;
    height: 7.625in;
    margin: 0 auto;
    background: url("https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/branding%2Fblank-tapered-label.png?alt=media&token=930baa3f-38d5-46fa-81a3-0df0c1eb15a8") no-repeat center center;
    background-size: cover;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
}

.columns-container {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex: 1 1 0;
    width: 100%;
    height: 100%;
    padding: 0.60in 0.68in 0.24in 0.68in;
    box-sizing: border-box;
    z-index: 2;
    margin-top: .6in;
}

.left-columns, .right-columns { 
    width: 31.5%;
    min-width: 320px;
    max-width: 35%;
    line-height: 1.22;
    column-count: 2;
    column-gap: 0.25in;
    z-index: 10;
}

.left-columns li, .right-columns li, .left-columns ul, .right-columns ul {
    line-height: 1.22;
}

.right-columns {
    color: #232942;
    line-height: 1.14;
    column-gap: 0.15in;
}

.left-columns {
    color: #18335b;
}

.left-columns h4, .right-columns h4 {
    font-family: 'Montserrat', Arial, sans-serif;
    font-size: 11px;
    color: #233066;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 2px;
    letter-spacing: 0.06em;
    margin-top: 5px;
    break-after: avoid;
    page-break-after: avoid;
}

.left-columns p, .left-columns ul, .left-columns li {
    font-size: 8px;
    color: inherit;
    font-family: 'Open Sans', Arial, sans-serif;
    margin: 0 0 3px 0;
}

.right-columns p, .right-columns ul, .right-columns li {
    font-size: 7px;
    color: inherit;
    font-family: 'Open Sans', Arial, sans-serif;
    margin: 0 0 2px 0;
}

.rc-statement {
    font-size: 7px;
    color: inherit;
    font-family: 'Open Sans', Arial, sans-serif;
    margin: 0 0 3px 0;
}

.right-columns ul, .right-columns .statement-list {
    list-style: none;
    padding-left: 0;
    margin-left: 0;
    margin-bottom: 2px;
    font-size: 7px;
    color: inherit;
    font-family: 'Open Sans', Arial, sans-serif;
    line-height: 1.16;
}

.right-columns li, .right-columns .statement-list li {
    margin: 0 0 2px 0;
    padding-left: 0;
    font-size: inherit;
    color: inherit;
    font-family: inherit;
    line-height: inherit;
    background: none;
    border: none;
    display: block;
}

.contact-block {
    font-size: 6px;
    line-height: 1.3;
    margin-bottom: 4px;
    color: #1a2340;
    font-family: 'Open Sans', Arial, sans-serif;
    word-break: break-word;
}

/* Center Column Styling */
.center-content {
    width: 27%;
    min-width: 240px;
    max-width: 28%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    z-index: 5;
    position: absolute;
    top: 15%;
    left: 50%;
    transform: translateX(-50%);
}

.center-content .product-name {
    font-family: 'Verdana', Arial, sans-serif;
    font-size: 54px;
    font-weight: 700;
    color: #013A81;
    letter-spacing: 0.03em;
    margin: 0 0 2px 0;
    line-height: 1.1;
}

.short-description-english {
    font-family: 'Lato', Arial, sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: #013A81;
    margin: 0 0 2px 0;
    letter-spacing: 0.02em;
}

.translated-short-description {
    font-size: 12px;
    font-family: 'Lato', Arial, sans-serif;
    color: #013A81;
    font-weight: 400;
    margin: 0 0 2px 0;
}

.logo-container img {
    height: .85in;
    width: auto;
    margin: 11px 0 4px 0;
    filter: drop-shadow(0 2px 8px #132e5712);
}

/* Code row and info styles */
.code-row {
    position: absolute;
    left: 50%;
    bottom: 0.75in;
    transform: translateX(-50%);
    width: 700px;
    height: 80px;
    z-index: 20;
    margin: 0;
}

.code-info {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: row;
    align-items: center !important;
    min-width: 200px;
    font-size: 13px;
    color: #1b2754;
    font-family: 'Open Sans', Arial, sans-serif;
    gap: 15px;
    z-index: 2;
}

.qr-code {
    width: 72px;
    height: 72px;
    flex-shrink: 0;
}

.batch-info-column {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.green-conscious-icon {
    position: absolute;
    right: 20%;
    top: 50%;
    transform: translateY(-50%);
    width: 72px;
}

.batch-field {
    font-size: 13px;
    font-family: 'Open Sans', Arial, sans-serif;
    color: #233066;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 3px;
}

.batch-field label {
    display: inline-block !important;
    min-width: 105px !important;
    padding: 0 !important;
    margin: 0 !important;
}

.package-size, .use-by {
    font-size: 12px;
    margin-bottom: 2px;
    color: #1b2754;
    text-align: left !important;
    margin-left: 0 !important;
}

.pictograms {
    display: flex;
    gap: 7px;
    align-items: center;
    margin: 0 0 7px 0;
}

.pictograms img {
    width: 26px;
    height: 26px;
    object-fit: contain;
    border-radius: 5px;
    border: 1px solid #e3e8f1;
    background: #f7fafc;
}

.signal-word {
    font-weight: 700;
    font-family: 'Montserrat', Arial, sans-serif;
}

.statement-list {
    margin: 0 0 2px 0;
    padding-left: 13px;
    color: #183363;
}

.statement-list li {
    margin: 0 0 2px 0;
    list-style: disc;
    font-size: inherit;
}

/* Corner icons */
.corner-icons {
    position: absolute;
    left: .5in;
    bottom: 0.75in;
    display: flex;
    flex-direction: row;
    gap: 14px;
    z-index: 12;
}

.corner-icon {
    width: 75px;
    height: 75px;
    object-fit: contain;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1.5px 6px #22316622;
    padding: 3px;
}

.corner-icon-rectangle {
    width: 125px;
    height: 75px;
    object-fit: contain;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1.5px 6px #22316622;
    padding: 3px;
}

/* Manufacturing and Safety Notice Styles */
.manufacturing-safety-notices {
    margin-top: 8px;
}

.manufacturing-safety-notices .rc-section {
    margin-bottom: 4px;
}

.manufacturing-safety-notices .rc-section h4 {
    font-size: 9px;
    margin-bottom: 1px;
    margin-top: 3px;
}

.manufacturing-safety-notices .rc-section p {
    font-size: 6.5px;
    line-height: 1.2;
    margin: 0 0 2px 0;
    font-weight: 500;
}

.manufacturing-notice {
    color: #1a5b2e !important;
    font-weight: 600 !important;
}

.safety-notice {
    font-weight: 600 !important;
}

/* Manufacturing Footer */
.manufacturing-footer {
    position: absolute;
    bottom: 0.05in;
    left: 50%;
    transform: translateX(-50%);
    z-index: 25;
    text-align: center;
}

.manufacturing-footer .manufacturing-notice {
    font-size: 8px;
    font-family: 'Lato', Arial, sans-serif;
    color: #1a5b2e;
    font-weight: 600;
    margin: 0;
}

/* Warranty/Conditions Styles */
.warranty-conditions-right {
    margin-top: 8px;
}

.warranty-conditions-right .rc-section {
    margin-bottom: 4px;
}

.warranty-conditions-right .rc-section h4 {
    font-size: 9px;
    margin-bottom: 1px;
    margin-top: 3px;
}

.warranty-conditions-right .rc-section p {
    font-size: 6px;
    line-height: 1.15;
    margin: 0 0 2px 0;
}

@media print {
    body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        background: none !important;
    }
    .label-container { 
        box-shadow: none !important; 
        border-radius: 0 !important; 
    }
}

.center-content .subtitle {
    font-family: 'Montserrat', Arial, sans-serif;
    font-size: 16px;
    color: #294b88;
    font-weight: 500;
    letter-spacing: 0.015em;
    margin: 2px 0 2px 0;
}

.center-content .subtitle.subtitle-2 {
    font-size: 13px;
    color: #466db2;
    font-weight: 400;
    margin-bottom: 2px;
}
```

---

## 3. 5x9 HTML Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>{{product_name}} | SpecChem</title>
    <style>{{css_styles}}</style>
</head>
<body>
    <div class="label-container">
        <div class="columns-container">
            <div class="left-columns">
                <div class="lc-section">{{#if description}}<h4>Description</h4><p>{{description}}</p>{{/if}}</div>
                <div class="lc-section">{{#if voc_data}}<h4>VOC Data</h4><p>{{voc_data}}</p>{{/if}}</div>
                <div class="lc-section">{{#if application}}<h4>Application</h4><p>{{application}}</p>{{/if}}</div>
                <div class="lc-section">{{#if features}}<h4>Features</h4><p>{{features}}</p>{{/if}}</div>
                <div class="lc-section">{{#if limitations}}<h4>Limitations</h4><p>{{limitations}}</p>{{/if}}</div>
                <div class="lc-section">{{#if shelf_life}}<h4>Shelf Life</h4><p>{{shelf_life}}</p>{{/if}}</div>
            </div>
            
            <div class="center-content">
                <div class="product-name">{{name}}</div>
                {{#if subtitle_1}}<div class="subtitle">{{subtitle_1}}</div>{{/if}}
                {{#if subtitle_2}}<div class="subtitle subtitle-2">{{subtitle_2}}</div>{{/if}}
                {{#if short_description_english}}<div class="short-description-english">{{short_description_english}}</div>{{/if}}
                {{#if short_description_french}}<div class="translated-short-description">{{short_description_french}}</div>{{/if}}
                {{#if short_description_spanish}}<div class="translated-short-description">{{short_description_spanish}}</div>{{/if}}
            </div>
            
            <div class="right-columns">
                <div class="rc-section">{{#if pictograms}}<h4>Pictograms</h4><div class="pictograms">{{pictograms}}</div>{{/if}}</div>
                <div class="rc-section">{{#if components_determining_hazard}}<h4>Components Determining Hazard</h4><p>{{components_determining_hazard}}</p>{{/if}}</div>
                <div class="rc-section">{{#if signal_word}}<h4>Signal Word</h4><p>{{signal_word}}</p>{{/if}}</div>
                <div class="rc-section">{{#if hazard_statements}}<h4>Hazard Statements</h4><p>{{hazard_statements}}</p>{{/if}}</div>
                <div class="rc-section">{{#if precautionary_statements}}<h4>Precautionary Statements</h4><p>{{precautionary_statements}}</p>{{/if}}</div>
                <div class="rc-section">{{#if response_statements}}<h4>Response Statements</h4><p>{{response_statements}}</p>{{/if}}</div>
                <div class="rc-section">{{#if storage}}<h4>Storage</h4><p>{{storage}}</p>{{/if}}</div>
                <div class="rc-section">{{#if disposal}}<h4>Disposal</h4><p>{{disposal}}</p>{{/if}}</div>
                <div class="rc-section">
                    {{#if proper_shipping_name}}<h4>Transport</h4>
                    <p><b>Proper Shipping Name:</b> {{proper_shipping_name}}</p>
                    {{#if un_number}}<p><b>UN Number:</b> {{un_number}}</p>{{/if}}
                    {{#if hazard_class}}<p><b>Hazard Class:</b> {{hazard_class}}</p>{{/if}}
                    {{#if packing_group}}<p><b>Packing Group:</b> {{packing_group}}</p>{{/if}}
                    {{#if emergency_response_guide}}<p><b>N.A. Emergency Response Guidebook #:</b> {{emergency_response_guide}}</p>{{/if}}
                    {{/if}}
                </div>
                
                <!-- Manufacturing and Safety Notices -->
                {{#if safety_notice}}
                <div class="manufacturing-safety-notices">
                    <div class="rc-section">
                        <h4>Safety Notice</h4>
                        <p class="safety-notice">{{safety_notice}}</p>
                    </div>
                </div>
                {{/if}}
                
                <!-- Warranty/Conditions Section -->
                {{#if conditions_of_sale}}
                <div class="warranty-conditions-right">
                    <div class="rc-section">
                        <h4>Conditions of Sale</h4>
                        <p>{{conditions_of_sale}}</p>
                    </div>
                    {{#if warranty_limitation}}
                    <div class="rc-section">
                        <h4>Warranty Limitation</h4>
                        <p>{{warranty_limitation}}</p>
                    </div>
                    {{/if}}
                    {{#if inherent_risk}}
                    <div class="rc-section">
                        <h4>Inherent Risk</h4>
                        <p>{{inherent_risk}}</p>
                    </div>
                    {{/if}}
                    {{#if additional_terms}}
                    <div class="rc-section">
                        <h4>Additional Terms</h4>
                        <p>{{additional_terms}}</p>
                    </div>
                    {{/if}}
                </div>
                {{/if}}
            </div>
        </div>
        
        <div class="logo-container">
            <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/branding%2Flogo-transparent.webp?alt=media&token=0b494edd-5a0a-4f37-8227-8e88356881f8" alt="SpecChem Logo">
        </div>
        
        <div class="code-row">
            <div class="code-info">
                <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fproduct-qr.png?alt=media&token=c832e9c2-525d-4dbf-984d-f8f249acf86e" class="qr-code" alt="QR Code" />
                <div class="batch-info-column">
                    <div class="batch-field"><label>Batch No:</label></div>
                    <div class="package-size">5 Gallon/18.93L</div>
                    {{#if used_by_date}}<div class="use-by">Used by date: {{used_by_date}}</div>{{/if}}
                </div>
            </div>
            {{#if green_conscious}}<img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fgreen-conscious.png?alt=media&token=green-conscious-icon" class="green-conscious-icon" alt="Green Conscious" />{{/if}}
        </div>

        <!-- Manufacturing Notice Footer -->
        {{#if manufacturing_notice}}
        <div class="manufacturing-footer">
            <p class="manufacturing-notice">{{manufacturing_notice}}</p>
        </div>
        {{/if}}
    </div>
</body>
</html>
```

---

## 4. 5x9 CSS Styles

```css
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&family=Lato:wght@400;700&display=swap');

@page {
    size: 9in 5in;
    margin: 0;
}

body {
    margin: 0;
    padding: 0;
    background: #e7eaf0;
    font-family: 'Open Sans', Arial, sans-serif;
}

.label-container {
    width: 9in;
    height: 5in;
    margin: 0 auto;
    background: url("https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/branding%2F5x9-label-template.png?alt=media&token=afc42346-5527-4c06-8c50-1aaef543e1ef") no-repeat center center;
    background-size: cover;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
}

.watermark {
    position: absolute;
    top: 54%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 215px;
    opacity: 0.14;
    z-index: 1;
    pointer-events: none;
    mix-blend-mode: multiply;
    filter: blur(0.2px);
    max-width: 60%;
}

.columns-container {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
    height: 100%;
    padding: 0.33in 0.36in 0.11in 0.36in;
    box-sizing: border-box;
    z-index: 2;
}

.left-columns, .right-columns {
    width: 32%;
    min-width: 130px;
    max-width: 33%;
    line-height: 1.16;
    word-break: break-word;
}

.left-columns {
    color: #18335b;
    margin-top: .2in;
    column-count: 2;
    column-gap: 0.19in;
}

.right-columns {
    color: #232942;
    font-size: 4.7px;
    line-height: 1.12;
    margin-top: .5in;
    column-count: 2;
    column-gap: 0.19in;
}

.contact-block {
    font-size: 4px;
    line-height: 1.25;
    margin-bottom: 2px;
    color: #1a2340;
    font-family: 'Open Sans', Arial, sans-serif;
    word-break: break-word;
}

.left-columns h4 {
    font-family: 'Montserrat', 'Open Sans', Arial, sans-serif;
    font-size: 8.8px;
    color: #1e3369;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 0.5px;
    margin-top: 11px;
    letter-spacing: 0.07em;
    padding-left: 5px; 
}

.left-columns p, .left-columns ul, .left-columns li {
    font-size: 6.2px;
    color: inherit;
    font-family: 'Montserrat', 'Open Sans', Arial, sans-serif;
    margin: 0 0 3px 0;
}

.left-columns ul {
    padding-left: 12px;
}

.right-columns h4 {
    font-family: 'Montserrat', Arial, sans-serif;
    font-size: 6.3px;
    color: #233066;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 0.5px;
    margin-top: 4px;
    letter-spacing: 0.04em;
}

.right-columns p,
.right-columns ul,
.right-columns li,
.right-columns .statement-list {
    font-size: 4px;
    color: inherit;
    font-family: 'Open Sans', Arial, sans-serif;
    margin: 0 0 1.4px 0;
    list-style: none;
    padding-left: 0;
}

.right-columns .statement-list {
    margin-bottom: 0.5em;
}

.right-columns .statement-list > div {
    margin-bottom: 1px;
}

.right-columns .signal-word {
    font-size: 4.7px;
    font-weight: 700;
    font-family: 'Montserrat', Arial, sans-serif;
    margin-top: 0;
    margin-bottom: 0.6px;
}

.center-content {
    width: 31%;
    min-width: 110px;
    max-width: 32%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    z-index: 5;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 120px;
}

.center-content .product-name {
    font-family: 'Verdana', Arial, sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #013A81;
    letter-spacing: 0.01em;
    margin: 0 0 2px 0;
    line-height: 1.1;
}

.short-description-english {
    font-family: 'Lato', Arial, sans-serif;
    font-size: 9px;
    font-weight: 700;
    color: #013A81;
    margin: 0 0 1.7px 0;
    letter-spacing: 0.01em;
}

.translated-short-description {
    font-size: 8px;
    font-family: 'Lato', Arial, sans-serif;
    color: #013A81;
    font-weight: 400;
    margin: 0 0 1.3px 0;
}

.logo-container {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 38%;
    margin: 0;
    width: 100%;
    display: flex;
    justify-content: center;
}

.logo-container img {
    height: 0.6in;
    width: auto;
    filter: drop-shadow(0 2px 8px #132e5712);
}

.center-bottom-content {
    display: flex;
    flex-direction: row;
    gap: 8px;
    justify-content: space-between;
    align-items: center;
    margin-top: 17px;
    width: 100%;
}

.pictograms {
    display: flex;
    gap: 4px;
    align-items: center;
    margin: 0 0 3px 0;
}

.pictograms img {
    width: 13px;
    height: 13px;
    object-fit: contain;
    border-radius: 3px;
    border: 1px solid #e3e8f1;
    background: #f7fafc;
}

.label-bottom-bar {
    position: absolute;
    left: .1in;
    bottom: .3in;
    width: 100%;
    display: flex;
    align-items: flex-end;
    z-index: 15;
    height: 88px;
}

.corner-icon-danger {
    width: 100px;
    height: 60px;
    object-fit: contain;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 6px #22316622;
    padding: 4px;
    margin-left: 4px;
}

.corner-icon {
    width: 60px;
    height: 60px;
    object-fit: contain;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 6px #22316622;
    padding: 4px;
    margin-left: 13px;
}

.code-row {
    position: absolute;
    left: 50%;
    bottom: 0.53in;
    transform: translateX(-50%);
    width: auto;
    z-index: 20;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
    gap: 20px;
}

.code-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: #1b2754;
    font-family: 'Open Sans', Arial, sans-serif;
    gap: 10px;
    min-width: 175px;
}

.batch-info-column {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.batch-field,
.package-size,
.use-by {
    text-align: left;
    margin-left: 0;
    font-size: 11px;
    color: #1b2754;
    font-family: 'Open Sans', Arial, sans-serif;
}

.batch-field label {
    display: inline-block;
    min-width: 74px;
    padding: 0;
    margin: 0;
}

.qr-code {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    filter: drop-shadow(0 2px 4px #25408014);
}

.green-conscious-icon {
    width: 32px;
    position: absolute;
    right: -15%;
    top: 50%;
    transform: translateY(-50%);
}

/* Manufacturing and Safety Notice Styles */
.manufacturing-safety-notices {
    margin-top: 4px;
}

.manufacturing-safety-notices .rc-section {
    margin-bottom: 2px;
}

.manufacturing-safety-notices .rc-section h4 {
    font-size: 5px;
    margin-bottom: 0.5px;
    margin-top: 2px;
}

.manufacturing-safety-notices .rc-section p {
    font-size: 3.5px;
    line-height: 1.1;
    margin: 0 0 1px 0;
    font-weight: 500;
}

.manufacturing-notice {
    color: #1a5b2e !important;
    font-weight: 600 !important;
}

.safety-notice {
    font-weight: 600 !important;
}

/* Manufacturing Footer */
.manufacturing-footer {
    position: absolute;
    bottom: 0.02in;
    left: 50%;
    transform: translateX(-50%);
    z-index: 25;
    text-align: center;
}

.manufacturing-footer .manufacturing-notice {
    font-size: 6px;
    font-family: 'Lato', Arial, sans-serif;
    color: #1a5b2e;
    font-weight: 600;
    margin: 0;
}

/* Warranty/Conditions Styles */
.warranty-conditions-right {
    margin-top: 4px;
}

.warranty-conditions-right .rc-section {
    margin-bottom: 2px;
}

.warranty-conditions-right .rc-section h4 {
    font-size: 5px;
    margin-bottom: 0.5px;
    margin-top: 2px;
}

.warranty-conditions-right .rc-section p {
    font-size: 3.2px;
    line-height: 1.1;
    margin: 0 0 1px 0;
}

.product-name-badge-wrap {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 7px;
}

.product-name-badge-wrap img {
    width: 30px;
    height: 30px;
    margin-top: 2px;
}

.eco-badge {
    margin-top: -10px;
    vertical-align: baseline;
}

.center-content .subtitle {
    font-family: 'Montserrat', Arial, sans-serif;
    font-size: 10px;
    color: #294b88;
    font-weight: 500;
    letter-spacing: 0.015em;
    margin: 1px 0 1px 0;
}

.center-content .subtitle.subtitle-2 {
    font-size: 8px;
    color: #466db2;
    font-weight: 400;
    margin-bottom: 1px;
}

@media print {
    body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        background: none !important;
    }
    .label-container { 
        box-shadow: none !important; 
        border-radius: 0 !important; 
    }
}
```

---

## Summary of Updates

Both templates now include:

### **Typography Updates:**
- **Product Name**: Verdana Bold, appropriate sizing per template
- **Short Description**: Lato Bold, #013A81 color
- **Translated Descriptions**: Lato Regular, #013A81 color
- **Logo**: Proper height sizing (14x7: .85in, 5x9: .6in)

### **Layout Improvements:**
- **QR Code**: Positioned next to batch info in horizontal layout
- **Manufacturing Notice**: Footer positioning for "Made in America"
- **Safety Notice**: Integrated into right column sections
- **Warranty Conditions**: Complete 4-field warranty system

### **New Features:**
- **Manufacturing Notice**: {{manufacturing_notice}} support
- **Safety Notice**: {{safety_notice}} support
- **Warranty Fields**: {{conditions_of_sale}}, {{warranty_limitation}}, {{inherent_risk}}, {{additional_terms}}
- **Conditional Rendering**: All sections only appear when data exists

### **Responsive Sizing:**
- **14x7**: Larger fonts and spacing for bigger label format
- **5x9**: Smaller, condensed fonts and spacing for compact format
- **Proportional Elements**: All elements scaled appropriately per template size