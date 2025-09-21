import requests
import json

# Production CSS templates
templates = [
    {
        "name": "Enhanced 14x7 Fixed",
        "description": "Production 14x7 inch landscape label template with proper styling",
        "width_mm": 377.825,
        "height_mm": 193.675,
        "html_template": '''<div class="label-container">
    <div class="columns-container">
      <div class="left-columns">
        {{#if application}}<h4>Application</h4><p>{{application}}</p>{{/if}}
        {{#if features}}<h4>Features</h4><p>{{features}}</p>{{/if}}
        {{#if coverage}}<h4>Coverage</h4><p>{{coverage}}</p>{{/if}}
        {{#if limitations}}<h4>Limitations</h4><p>{{limitations}}</p>{{/if}}
        {{#if shelf_life}}<h4>Shelf Life</h4><p>{{shelf_life}}</p>{{/if}}
        {{#if voc_data}}<h4>VOC Data</h4><p>{{voc_data}}</p>{{/if}}
      </div>
      <div class="center-content">
        <h1 class="product-name">{{name}}</h1>
        {{#if short_description_english}}<div class="short-description-english">{{short_description_english}}</div>{{/if}}
        {{#if short_description_french}}<div class="translated-short-description">{{short_description_french}}</div>{{/if}}
        {{#if short_description_spanish}}<div class="translated-short-description">{{short_description_spanish}}</div>{{/if}}
        {{#if subtitle_1}}<div class="subtitle">{{subtitle_1}}</div>{{/if}}
        {{#if subtitle_2}}<div class="subtitle subtitle-2">{{subtitle_2}}</div>{{/if}}
        <div class="logo-container">
          <img src="/sc_white_alt.webp" alt="SpecChem Logo" />
        </div>
      </div>
      <div class="right-columns">
        {{#if signal_word}}<div class="signal-word">{{signal_word}}</div>{{/if}}
        {{#if hazard_statements}}<h4>Hazard Statements</h4><div class="statement-list">{{hazard_statements}}</div>{{/if}}
        {{#if precautionary_statements}}<h4>Precautionary Statements</h4><div class="statement-list">{{precautionary_statements}}</div>{{/if}}
        {{#if response_statements}}<h4>Response Statements</h4><div class="statement-list">{{response_statements}}</div>{{/if}}
        {{#if first_aid}}<h4>First Aid</h4><p>{{first_aid}}</p>{{/if}}
        {{#if storage}}<h4>Storage</h4><p>{{storage}}</p>{{/if}}
        {{#if disposal}}<h4>Disposal</h4><p>{{disposal}}</p>{{/if}}
        <div class="contact-block">
          SpecChem LLC<br>
          1511 Baltimore Ave. Suite 600<br>
          Kansas City, MO 64108<br>
          816-968-5600
        </div>
      </div>
    </div>
  </div>''',
        "css_template": '''@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&family=Lato:wght@400;700&display=swap');

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
}'''
    },
    {
        "name": "BioStrip 5x9",
        "description": "Production 5x9 inch portrait label template with proper styling",
        "width_mm": 127,
        "height_mm": 228.6,
        "html_template": '''<div class="label-container">
    <div class="watermark">
      <img src="/sc_black_watermark.webp" alt="SpecChem Watermark" />
    </div>
    <div class="columns-container">
      <div class="left-columns">
        {{#if application}}<h4>Application</h4><p>{{application}}</p>{{/if}}
        {{#if features}}<h4>Features</h4><p>{{features}}</p>{{/if}}
        {{#if coverage}}<h4>Coverage</h4><p>{{coverage}}</p>{{/if}}
        {{#if limitations}}<h4>Limitations</h4><p>{{limitations}}</p>{{/if}}
        {{#if shelf_life}}<h4>Shelf Life</h4><p>{{shelf_life}}</p>{{/if}}
        {{#if voc_data}}<h4>VOC Data</h4><p>{{voc_data}}</p>{{/if}}
      </div>
      <div class="center-content">
        <h1 class="product-name">{{name}}</h1>
        {{#if short_description_english}}<div class="short-description-english">{{short_description_english}}</div>{{/if}}
        {{#if short_description_french}}<div class="translated-short-description">{{short_description_french}}</div>{{/if}}
        {{#if short_description_spanish}}<div class="translated-short-description">{{short_description_spanish}}</div>{{/if}}
        {{#if subtitle_1}}<div class="subtitle">{{subtitle_1}}</div>{{/if}}
        {{#if subtitle_2}}<div class="subtitle subtitle-2">{{subtitle_2}}</div>{{/if}}
      </div>
      <div class="right-columns">
        {{#if signal_word}}<div class="signal-word">{{signal_word}}</div>{{/if}}
        {{#if hazard_statements}}<h4>Hazard Statements</h4><div class="statement-list">{{hazard_statements}}</div>{{/if}}
        {{#if precautionary_statements}}<h4>Precautionary Statements</h4><div class="statement-list">{{precautionary_statements}}</div>{{/if}}
        {{#if response_statements}}<h4>Response Statements</h4><div class="statement-list">{{response_statements}}</div>{{/if}}
        {{#if first_aid}}<h4>First Aid</h4><p>{{first_aid}}</p>{{/if}}
        {{#if storage}}<h4>Storage</h4><p>{{storage}}</p>{{/if}}
        {{#if disposal}}<h4>Disposal</h4><p>{{disposal}}</p>{{/if}}
        <div class="contact-block">
          SpecChem LLC<br>
          1511 Baltimore Ave. Suite 600<br>
          Kansas City, MO 64108<br>
          816-968-5600
        </div>
      </div>
    </div>
    <div class="logo-container">
      <img src="/sc_white_alt.webp" alt="SpecChem Logo" />
    </div>
  </div>''',
        "css_template": '''@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&family=Lato:wght@400;700&display=swap');

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
    font-family: 'Montserrat', Arial, sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: #21325b;
    letter-spacing: 0.01em;
    margin: 0 0 2px 0;
    line-height: 1.1;
}

.short-description-english {
    font-family: 'Montserrat', Arial, sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #2453a6;
    margin: 0 0 1.7px 0;
    letter-spacing: 0.01em;
}

.translated-short-description {
    font-size: 8px;
    font-family: 'Open Sans', Arial, sans-serif;
    color: #395073;
    font-weight: 500;
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
    width: 150px;
    filter: drop-shadow(0 2px 8px #132e5712);
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
}'''
    }
]

def create_templates():
    """Create the production templates via API"""
    api_url = "http://localhost:3002/api/templates"
    
    for i, template in enumerate(templates):
        try:
            print(f"\n🔄 Creating template {i+1}/{len(templates)}: {template['name']}")
            
            response = requests.post(api_url, json=template)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Created template: {template['name']}")
                print(f"   - Template ID: {result['template']['id']}")
                print(f"   - Slug: {result['template']['slug']}")
                print(f"   - CSS Length: {len(template['css_template'])} chars")
            else:
                print(f"❌ Failed to create {template['name']}")
                print(f"   Status: {response.status_code}")
                print(f"   Error: {response.text}")
                
        except Exception as e:
            print(f"❌ Exception creating {template['name']}: {e}")
    
    # Verify templates were created
    print("\n🔍 Verifying templates...")
    try:
        response = requests.get(api_url)
        if response.status_code == 200:
            templates_list = response.json()
            print(f"✅ Found {len(templates_list)} templates total")
            for t in templates_list:
                print(f"   - {t['name']} (slug: {t['slug']})")
        else:
            print(f"❌ Failed to verify: {response.status_code}")
    except Exception as e:
        print(f"❌ Failed to verify: {e}")

if __name__ == "__main__":
    create_templates()