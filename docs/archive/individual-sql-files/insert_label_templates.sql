-- Insert 14x7 Label Template (Enhanced Large Format)
INSERT INTO label_templates (
    id,
    name,
    slug,
    description,
    width_mm,
    height_mm,
    html_template,
    css_template,
    is_active
) VALUES (
    gen_random_uuid(),
    '14x7 Enhanced Large Format',
    '14x7-enhanced',
    'Large 14.875" x 7.625" label template for detailed product information with columns layout',
    377.82, -- 14.875 inches in mm
    193.68, -- 7.625 inches in mm
    '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>{{product_name}}</title>
    <style>{{css_styles}}</style>
</head>
<body>
    <div class="label-container">
        <div class="columns-container">
            <!-- Left Columns -->
            <div class="left-columns" id="Font6">
                {{#if description}}
                <div class="lc-section">
                    <h4>Description</h4>
                    <p>{{description}}</p>
                </div>
                {{/if}}
                {{#if voc_data}}
                <div class="lc-section">
                    <h4>VOC Data</h4>
                    <p>{{voc_data}}</p>
                </div>
                {{/if}}
                {{#if application}}
                <div class="lc-section">
                    <h4>Application</h4>
                    <p>{{application}}</p>
                </div>
                {{/if}}
                {{#if features}}
                <div class="lc-section">
                    <h4>Features</h4>
                    <p>{{features}}</p>
                </div>
                {{/if}}
                {{#if limitations}}
                <div class="lc-section">
                    <h4>Limitations</h4>
                    <p>{{limitations}}</p>
                </div>
                {{/if}}
                {{#if shelf_life}}
                <div class="lc-section">
                    <h4>Shelf Life</h4>
                    <p>{{shelf_life}}</p>
                </div>
                {{/if}}
            </div>
            <!-- Center Content -->
            <div class="center-content">
                <div class="product-name">{{name}}</div>
                {{#if short_description_english}}
                <div class="short-description-english">{{short_description_english}}</div>
                {{/if}}
                {{#if short_description_french}}
                <div class="translated-short-description">{{short_description_french}}</div>
                {{/if}}
                {{#if short_description_spanish}}
                <div class="translated-short-description">{{short_description_spanish}}</div>
                {{/if}}
                <div class="logo-container">
                    <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/branding%2Flogo-transparent.webp?alt=media&token=0b494edd-5a0a-4f37-8227-8e88356881f8" alt="SpecChem Logo">
                </div>
            </div>
            <!-- Right Columns -->
            <div class="right-columns" id="Font6">
                {{#if pictograms}}
                <div class="rc-section">
                    <h4>Pictograms</h4>
                    <div class="pictograms">{{pictograms}}</div>
                </div>
                {{/if}}
                {{#if components_determining_hazard}}
                <div class="rc-section">
                    <h4>Components Determining Hazard / Composants déterminant le danger</h4>
                    <p>{{components_determining_hazard}}</p>
                    {{#if composants_determinant_le_danger}}
                    <p>{{composants_determinant_le_danger}}</p>
                    {{/if}}
                </div>
                {{/if}}
                {{#if signal_word}}
                <div class="rc-section">
                    <h4>Signal Word / Mot de signalement</h4>
                    <p>{{signal_word}}</p>
                    {{#if mot_de_signalement}}
                    <p>{{mot_de_signalement}}</p>
                    {{/if}}
                </div>
                {{/if}}
                {{#if hazard_statements}}
                <div class="rc-section">
                    <h4>Hazard Statements / Mentions de danger</h4>
                    <p>{{hazard_statements}}</p>
                    {{#if mentions_de_danger}}
                    <p>{{mentions_de_danger}}</p>
                    {{/if}}
                </div>
                {{/if}}
                {{#if precautionary_statements}}
                <div class="rc-section">
                    <h4>Precautionary Statements / Conseils de prudence</h4>
                    <p>{{precautionary_statements}}</p>
                    {{#if conseils_de_prudence}}
                    <p>{{conseils_de_prudence}}</p>
                    {{/if}}
                </div>
                {{/if}}
                {{#if response_statements}}
                <div class="rc-section">
                    <h4>Response Statements / Mesures de premiers secours</h4>
                    <p>{{response_statements}}</p>
                    {{#if mesures_de_premiers_secours}}
                    <p>{{mesures_de_premiers_secours}}</p>
                    {{/if}}
                </div>
                {{/if}}
                {{#if storage}}
                <div class="rc-section">
                    <h4>Storage / Consignes de stockage</h4>
                    <p>{{storage}}</p>
                    {{#if consignes_de_stockage}}
                    <p>{{consignes_de_stockage}}</p>
                    {{/if}}
                </div>
                {{/if}}
                {{#if disposal}}
                <div class="rc-section">
                    <h4>Disposal / Consignes délimination</h4>
                    <p>{{disposal}}</p>
                    {{#if consignes_delimination}}
                    <p>{{consignes_delimination}}</p>
                    {{/if}}
                </div>
                {{/if}}
                {{#if proper_shipping_name}}
                <div class="rc-section">
                    <h4>Transport</h4>
                    <p><b>Proper Shipping Name:</b> {{proper_shipping_name}}</p>
                    {{#if un_number}}<p><b>UN Number:</b> {{un_number}}</p>{{/if}}
                    {{#if hazard_class}}<p><b>Hazard Class:</b> {{hazard_class}}</p>{{/if}}
                    {{#if packing_group}}<p><b>Packing Group:</b> {{packing_group}}</p>{{/if}}
                    {{#if emergency_response_guide}}<p><b>N.A. Emergency Response Guidebook #:</b> {{emergency_response_guide}}</p>{{/if}}
                </div>
                {{/if}}
            </div>
        </div>
        {{#if do_not_freeze}}
        <div class="corner-icons">
            <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Frectangle-pictogram.png?alt=media&token=a469c938-f942-4f1f-b825-444828d6a8f3" alt="Other" class="corner-icon-rectangle">
        </div>
        {{/if}}
        <div class="code-row">
            <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fproduct-qr.png?alt=media&token=c832e9c2-525d-4dbf-984d-f8f249acf86e" class="qr-code" alt="QR Code" />
            <div class="code-info">
                <div class="batch-field"><label style="display:inline-block; min-width:105px;">Batch No:</label></div>
                <div class="package-size">{{package_size}}</div>
                {{#if used_by_date}}<div class="use-by">Used by date: {{used_by_date}}</div>{{/if}}
            </div>
            {{#if green_conscious}}
            <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fgreen-conscious.png?alt=media&token=1337ae3b-9ed9-4956-8d2f-fc958810c039" class="green-conscious-icon" alt="Green Conscious"/>
            {{/if}}
        </div>
    </div>
</body>
</html>',
    '@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&display=swap");
@page { size: 14.875in 7.625in; margin: 0; }
#Font6 p, #Font6 ul, #Font6 li { font-size: 6px !important; }
#Font6-5 p, #Font6-5 ul, #Font6-5 li { font-size: 6.5px !important; }
#Font7 p, #Font7 ul, #Font7 li { font-size: 7px !important; }
#Font8 p, #Font8 ul, #Font8 li { font-size: 8px !important; }
#Font9 p, #Font9 ul, #Font9 li { font-size: 9px !important; }
#Font10 p, #Font10 ul, #Font10 li { font-size: 9px !important; }
#Font11 p, #Font11 ul, #Font11 li { font-size: 9.5px !important; }
body { margin: 0; padding: 0; background: #e7eaf0; font-family: "Open Sans", Arial, sans-serif; }
.label-container { width: 14.875in; height: 7.625in; margin: 0 auto; background: url("https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/branding%2Fblank-tapered-label.png?alt=media&token=930baa3f-38d5-46fa-81a3-0df0c1eb15a8") no-repeat center center; background-size: cover; position: relative; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; }
.columns-container { position: relative; display: flex; justify-content: space-between; align-items: flex-start; flex: 1 1 0; width: 100%; height: 100%; padding: 0.60in 0.68in 0.24in 0.68in; box-sizing: border-box; z-index: 2; margin-top: .6in; }
.left-columns, .right-columns { width: 31.5%; min-width: 320px; line-height: 1.16; word-break: break-word; }
.left-columns { color: #18335b; column-count: 2; column-gap: 0.4in; }
.right-columns { color: #232942; font-size: 7px; line-height: 1.12; column-count: 2; column-gap: 0.4in; }
.left-columns h4 { font-family: "Montserrat", "Open Sans", Arial, sans-serif; font-size: 13.5px; color: #1e3369; text-transform: uppercase; font-weight: 700; margin-bottom: 1.5px; margin-top: 11px; letter-spacing: 0.05em; }
.left-columns p, .left-columns ul, .left-columns li { font-size: 7.6px; color: inherit; font-family: "Montserrat", "Open Sans", Arial, sans-serif; margin: 0 0 6px 0; }
.left-columns ul { padding-left: 15px; }
.right-columns h4 { font-family: "Montserrat", Arial, sans-serif; font-size: 9.3px; color: #233066; text-transform: uppercase; font-weight: 700; margin-bottom: 1.5px; margin-top: 11px; letter-spacing: 0.04em; }
.right-columns p, .right-columns ul, .right-columns li, .right-columns .statement-list { font-size: 6px; color: inherit; font-family: "Open Sans", Arial, sans-serif; margin: 0 0 4px 0; list-style: none; padding-left: 0; }
.right-columns .statement-list { margin-bottom: 1em; }
.right-columns .statement-list > div { margin-bottom: 2px; }
.right-columns .signal-word { font-size: 7.3px; font-weight: 700; font-family: "Montserrat", Arial, sans-serif; margin-top: 0; margin-bottom: 3px; }
.center-content { width: 31%; min-width: 260px; max-width: 32%; display: flex; flex-direction: column; align-items: center; text-align: center; z-index: 5; position: absolute; top: 15%; left: 50%; transform: translateX(-50%); }
.center-content .product-name { font-family: "Montserrat", Arial, sans-serif; font-size: 48px; font-weight: 700; color: #21325b; letter-spacing: 0.03em; margin: 0 0 2px 0; line-height: 1.1; }
.short-description-english { font-family: "Montserrat", Arial, sans-serif; font-size: 18px; font-weight: 600; color: #2453a6; margin: 0 0 2px 0; letter-spacing: 0.02em; }
.translated-short-description { font-size: 12px; font-family: "Open Sans", Arial, sans-serif; color: #395073; font-weight: 500; margin: 0 0 2px 0; }
.logo-container img { width: 200px; margin: 11px 0 4px 0; filter: drop-shadow(0 2px 8px #132e5712); }
.code-row { position: absolute; left: 50%; bottom: 0.75in; transform: translateX(-50%); width: 700px; height: 80px; z-index: 20; margin: 0; }
.code-info { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: flex-start !important; min-width: 200px; font-size: 13px; color: #1b2754; font-family: "Open Sans", Arial, sans-serif; gap: 4px; z-index: 2; }
.qr-code { position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 72px; }
.green-conscious-icon { position: absolute; right: 20%; top: 50%; transform: translateY(-50%); width: 72px; }
.batch-field { font-size: 13px; font-family: "Open Sans", Arial, sans-serif; color: #233066; display: flex; align-items: center; gap: 8px; margin-bottom: 3px; }
.package-size, .use-by { font-size: 12px; margin-bottom: 2px; color: #1b2754; }
.pictograms { display: flex; gap: 7px; align-items: center; margin: 0 0 7px 0; }
.pictograms img { width: 26px; height: 26px; object-fit: contain; border-radius: 5px; border: 1px solid #e3e8f1; background: #f7fafc; }
.corner-icons { position: absolute; top: 0.86in; right: 0.5in; z-index: 10; }
.corner-icon-rectangle { width: 36px; height: 36px; }',
    true
);

-- Insert 5x9 Label Template (Compact Format)
INSERT INTO label_templates (
    id,
    name,
    slug,
    description,
    width_mm,
    height_mm,
    html_template,
    css_template,
    is_active
) VALUES (
    gen_random_uuid(),
    '5x9 Compact Format',
    '5x9-compact',
    'Compact 9" x 5" label template for smaller product containers with essential information',
    228.6, -- 9 inches in mm
    127.0, -- 5 inches in mm
    '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>{{product_name}} | SpecChem</title>
    <style>{{css_styles}}</style>
</head>
<body>
    <div class="label-container">
        <div class="watermark">
            <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/branding%2Flogo-transparent.webp?alt=media&token=0b494edd-5a0a-4f37-8227-8e88356881f8" alt="SpecChem Watermark">
        </div>
        <div class="columns-container">
            <!-- Left Columns -->
            <div class="left-columns">
                {{#if description}}
                <div class="lc-section">
                    <h4>Description</h4>
                    <p>{{description}}</p>
                </div>
                {{/if}}
                {{#if voc_data}}
                <div class="lc-section">
                    <h4>VOC Data</h4>
                    <p>{{voc_data}}</p>
                </div>
                {{/if}}
                {{#if application}}
                <div class="lc-section">
                    <h4>Application</h4>
                    <p>{{application}}</p>
                </div>
                {{/if}}
                {{#if features}}
                <div class="lc-section">
                    <h4>Features</h4>
                    <p>{{features}}</p>
                </div>
                {{/if}}
                {{#if limitations}}
                <div class="lc-section">
                    <h4>Limitations</h4>
                    <p>{{limitations}}</p>
                </div>
                {{/if}}
                {{#if shelf_life}}
                <div class="lc-section">
                    <h4>Shelf Life</h4>
                    <p>{{shelf_life}}</p>
                </div>
                {{/if}}
            </div>

            <!-- Center Content -->
            <div class="center-content">
                <div class="product-name" style="margin:0;">{{name}}</div>
                {{#if short_description_english}}
                <div class="short-description-english">{{short_description_english}}</div>
                {{/if}}
                {{#if short_description_french}}
                <div class="translated-short-description">{{short_description_french}}</div>
                {{/if}}
                {{#if short_description_spanish}}
                <div class="translated-short-description">{{short_description_spanish}}</div>
                {{/if}}
                <div class="center-bottom-content"></div>
            </div>

            <!-- Logo moved outside .center-content -->
            <div class="logo-container">
                <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/branding%2Flogo-transparent.webp?alt=media&token=0b494edd-5a0a-4f37-8227-8e88356881f8" alt="SpecChem Logo">
            </div>

            <!-- Right Columns -->
            <div class="right-columns">
                {{#if components_determining_hazard}}
                <div class="rc-section">
                    <h4>Components Determining Hazard</h4>
                    <p>{{components_determining_hazard}}</p>
                </div>
                {{/if}}
                {{#if signal_word}}
                <div class="rc-section">
                    <h4>Signal Word</h4>
                    <p><strong>{{signal_word}}</strong></p>
                </div>
                {{/if}}
                {{#if hazard_statements}}
                <div class="rc-section">
                    <h4>Hazard Statements</h4>
                    <p>{{hazard_statements}}</p>
                </div>
                {{/if}}
                {{#if precautionary_statements}}
                <div class="rc-section">
                    <h4>Precautionary Statements</h4>
                    <p>{{precautionary_statements}}</p>
                </div>
                {{/if}}
                {{#if response_statements}}
                <div class="rc-section">
                    <h4>Response Statements</h4>
                    <p>{{response_statements}}</p>
                </div>
                {{/if}}
                {{#if storage}}
                <div class="rc-section">
                    <h4>Storage</h4>
                    <p>{{storage}}</p>
                </div>
                {{/if}}
                {{#if disposal}}
                <div class="rc-section">
                    <h4>Disposal</h4>
                    <p>{{disposal}}</p>
                </div>
                {{/if}}
                {{#if proper_shipping_name}}
                <div class="rc-section">
                    <h4>Transport</h4>
                    <p><b>Proper Shipping Name:</b> {{proper_shipping_name}}</p>
                    {{#if un_number}}<p><b>UN Number:</b> {{un_number}}</p>{{/if}}
                    {{#if hazard_class}}<p><b>Hazard Class:</b> {{hazard_class}}</p>{{/if}}
                    {{#if packing_group}}<p><b>Packing Group:</b> {{packing_group}}</p>{{/if}}
                    {{#if emergency_response_guide}}<p><b>N.A. Emergency Response Guidebook #:</b> {{emergency_response_guide}}</p>{{/if}}
                </div>
                {{/if}}
            </div>
        </div>

        <div class="label-bottom-bar">
            {{#if do_not_freeze}}
            <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fdo-not-freeze.png?alt=media&token=20c12d11-97d2-4863-999c-3a0e08ccfee4" class="corner-icon" alt="Do Not Freeze"/>
            {{/if}}
            <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Frectangle-pictogram.png?alt=media&token=a469c938-f942-4f1f-b825-444828d6a8f3" alt="Danger Icon" class="corner-icon-danger">
        </div>

        <div class="code-row">
            <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fproduct-qr.png?alt=media&token=c832e9c2-525d-4dbf-984d-f8f249acf86e" class="qr-code" alt="QR Code" />
            <div class="code-info">
                <label>Batch No:</label>
                <input type="text" name="batch-no" />
                <div class="package-size">{{package_size}}</div>
                {{#if used_by_date}}<div class="use-by">Used by date: {{used_by_date}}</div>{{/if}}
            </div>
            {{#if green_conscious}}
            <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fgreen-conscious.png?alt=media&token=1337ae3b-9ed9-4956-8d2f-fc958810c039" class="green-conscious-icon" alt="Green Conscious"/>
            {{/if}}
        </div>
    </div>
</body>
</html>',
    '@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&display=swap");
@page { size: 9in 5in; margin: 0; }
body { margin: 0; padding: 0; background: #e7eaf0; font-family: "Open Sans", Arial, sans-serif; }
.label-container { width: 9in; height: 5in; margin: 0 auto; background: url("https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/branding%2F5x9-label-template.png?alt=media&token=afc42346-5527-4c06-8c50-1aaef543e1ef") no-repeat center center; background-size: cover; position: relative; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; }
.watermark { position: absolute; top: 54%; left: 50%; transform: translate(-50%, -50%); width: 215px; opacity: 0.14; z-index: 1; pointer-events: none; mix-blend-mode: multiply; filter: blur(0.2px); max-width: 60%; }
.columns-container { position: relative; display: flex; justify-content: space-between; align-items: flex-start; width: 100%; height: 100%; padding: 0.33in 0.36in 0.11in 0.36in; box-sizing: border-box; z-index: 2; }
.left-columns, .right-columns { width: 32%; min-width: 130px; max-width: 33%; line-height: 1.16; word-break: break-word; }
.left-columns { color: #18335b; margin-top: .2in; column-count: 2; column-gap: 0.19in; }
.right-columns { color: #232942; font-size: 4.7px; line-height: 1.12; margin-top: .5in; column-count: 2; column-gap: 0.19in; }
.contact-block { font-size: 4px; line-height: 1.25; margin-bottom: 2px; color: #1a2340; font-family: "Open Sans", Arial, sans-serif; word-break: break-word; }
.left-columns h4 { font-family: "Montserrat", "Open Sans", Arial, sans-serif; font-size: 8.8px; color: #1e3369; text-transform: uppercase; font-weight: 700; margin-bottom: 0.5px; margin-top: 11px; letter-spacing: 0.07em; padding-left: 5px; }
.left-columns p, .left-columns ul, .left-columns li { font-size: 6.2px; color: inherit; font-family: "Montserrat", "Open Sans", Arial, sans-serif; margin: 0 0 3px 0; }
.left-columns ul { padding-left: 12px; }
.right-columns h4 { font-family: "Montserrat", Arial, sans-serif; font-size: 6.3px; color: #233066; text-transform: uppercase; font-weight: 700; margin-bottom: 0.5px; margin-top: 4px; letter-spacing: 0.04em; }
.right-columns p, .right-columns ul, .right-columns li, .right-columns .statement-list { font-size: 4px; color: inherit; font-family: "Open Sans", Arial, sans-serif; margin: 0 0 1.4px 0; list-style: none; padding-left: 0; }
.right-columns .statement-list { margin-bottom: 0.5em; }
.right-columns .statement-list > div { margin-bottom: 1px; }
.right-columns .signal-word { font-size: 4.7px; font-weight: 700; font-family: "Montserrat", Arial, sans-serif; margin-top: 0; margin-bottom: 0.6px; }
.center-content { width: 31%; min-width: 110px; max-width: 32%; display: flex; flex-direction: column; align-items: center; text-align: center; z-index: 5; position: absolute; left: 50%; transform: translateX(-50%); top: 120px; }
.center-content .product-name { font-family: "Montserrat", Arial, sans-serif; font-size: 24px; font-weight: 700; color: #21325b; letter-spacing: 0.01em; margin: 0 0 2px 0; line-height: 1.1; }
.short-description-english { font-family: "Montserrat", Arial, sans-serif; font-size: 12px; font-weight: 600; color: #2453a6; margin: 0 0 1.7px 0; letter-spacing: 0.01em; }
.translated-short-description { font-size: 8px; font-family: "Open Sans", Arial, sans-serif; color: #395073; font-weight: 500; margin: 0 0 1.3px 0; }
.logo-container { position: absolute; left: 50%; transform: translateX(-50%); bottom: 38%; margin: 0; width: 100%; display: flex; justify-content: center; }
.logo-container img { width: 150px; filter: drop-shadow(0 2px 8px #132e5712); }
.center-bottom-content { display: flex; flex-direction: row; gap: 8px; justify-content: space-between; align-items: center; margin-top: 12px; position: absolute; bottom: -40px; left: 50%; transform: translateX(-50%); }
.label-bottom-bar { position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; align-items: center; z-index: 15; }
.corner-icon, .corner-icon-danger { width: 26px; height: 26px; }
.code-row { position: absolute; left: 50%; bottom: 38px; transform: translateX(-50%); width: 550px; height: 60px; z-index: 20; margin: 0; display: flex; align-items: center; justify-content: center; }
.code-info { display: flex; flex-direction: column; align-items: flex-start; min-width: 120px; font-size: 9px; color: #1b2754; font-family: "Open Sans", Arial, sans-serif; gap: 2px; z-index: 2; }
.code-info label { font-size: 9px; font-weight: 600; margin-bottom: 2px; }
.code-info input { font-size: 8px; padding: 1px 3px; border: 1px solid #ddd; border-radius: 2px; width: 80px; }
.qr-code { position: absolute; left: -60px; top: 50%; transform: translateY(-50%); width: 52px; }
.green-conscious-icon { position: absolute; right: -60px; top: 50%; transform: translateY(-50%); width: 52px; }
.package-size, .use-by { font-size: 8px; margin-bottom: 1px; color: #1b2754; }',
    true
);

