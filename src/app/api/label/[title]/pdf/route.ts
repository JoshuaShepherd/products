import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ title: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const size = searchParams.get('size') || '14x7';
    const { title } = await params;
    
    // Enhanced URL decoding to handle special characters properly
    let decodedTitle = decodeURIComponent(title);
    
    // Handle common URL encoding issues
    decodedTitle = decodedTitle
      .replace(/\+/g, ' ')           // + signs to spaces
      .replace(/%20/g, ' ')          // Encoded spaces
      .replace(/%26/g, '&')          // Encoded ampersands
      .replace(/%2F/g, '/')          // Encoded slashes
      .replace(/%28/g, '(')          // Encoded parentheses
      .replace(/%29/g, ')')
      .trim();

    console.log(`🔍 PDF Request - Original: "${title}" → Decoded: "${decodedTitle}"`);

    // Basic validation for title
    if (!decodedTitle || typeof decodedTitle !== 'string') {
      return NextResponse.json(
        { 
          error: 'Invalid product title',
          received: title,
          decoded: decodedTitle
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Enhanced product lookup with multiple fallback strategies
    async function findProduct(searchTerm: string) {
      // Strategy 1: Exact name match
      let { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          product_pictograms(
            pictograms(*)
          )
        `)
        .eq('name', searchTerm)
        .single();

      if (product && !error) {
        console.log(`✅ Found product by exact name: ${searchTerm}`);
        return product;
      }

      // Strategy 2: Slug match (URL-friendly version)
      const slug = searchTerm.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Remove duplicate hyphens
        .trim();

      ({ data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          product_pictograms(
            pictograms(*)
          )
        `)
        .eq('slug', slug)
        .single());

      if (product && !error) {
        console.log(`✅ Found product by slug: ${slug} (from: ${searchTerm})`);
        return product;
      }

      // Strategy 3: Case-insensitive name match
      ({ data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          product_pictograms(
            pictograms(*)
          )
        `)
        .ilike('name', searchTerm)
        .single());

      if (product && !error) {
        console.log(`✅ Found product by case-insensitive name: ${searchTerm}`);
        return product;
      }

      // Strategy 4: Partial name match (contains)
      ({ data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          product_pictograms(
            pictograms(*)
          )
        `)
        .ilike('name', `%${searchTerm}%`)
        .single());

      if (product && !error) {
        console.log(`✅ Found product by partial match: ${searchTerm}`);
        return product;
      }

      // Strategy 5: Handle common naming variations
      const nameVariations = [
        searchTerm.replace(/&/g, 'and'),        // & to and
        searchTerm.replace(/\band\b/g, '&'),    // and to &
        searchTerm.replace(/\s+/g, ''),         // Remove all spaces
        searchTerm.replace(/\s+/g, ' '),        // Normalize spaces
        searchTerm.replace(/-/g, ' '),          // Hyphens to spaces
        searchTerm.replace(/\s/g, '-'),         // Spaces to hyphens
      ];

      for (const variation of nameVariations) {
        if (variation === searchTerm) continue; // Skip if same as original

        ({ data: product, error } = await supabase
          .from('products')
          .select(`
            *,
            product_pictograms(
              pictograms(*)
            )
          `)
          .ilike('name', variation)
          .single());

        if (product && !error) {
          console.log(`✅ Found product by variation: ${variation} (from: ${searchTerm})`);
          return product;
        }
      }

      // Strategy 6: Get all similar products for better error reporting
      const { data: similarProducts } = await supabase
        .from('products')
        .select('id, name, slug')
        .or(`name.ilike.%${searchTerm}%,slug.ilike.%${slug}%`)
        .limit(5);

      console.warn(`❌ Product not found: ${searchTerm}`);
      if (similarProducts && similarProducts.length > 0) {
        console.warn('Similar products found:', similarProducts.map(p => p.name));
      }

      return null;
    }

    // Use enhanced product lookup
    const product = await findProduct(decodedTitle);

    if (!product) {
      // Get similar products for helpful error message
      const { data: similarProducts } = await supabase
        .from('products')
        .select('id, name, slug')
        .or(`name.ilike.%${decodedTitle}%,slug.ilike.%${decodedTitle.toLowerCase().replace(/[^a-z0-9]/g, '')}%`)
        .limit(5);

      return NextResponse.json(
        { 
          error: 'Product not found',
          searchTerm: decodedTitle,
          suggestions: similarProducts?.map(p => ({
            name: p.name,
            slug: p.slug,
            correctUrl: `/api/label/${encodeURIComponent(p.name)}/pdf?size=${size}`
          })) || [],
          totalProducts: 259,
          hint: 'Try using the exact product name or slug from the database'
        },
        { status: 404 }
      );
    }

    // Get label template for the specified size
    const templateName = size === '14x7' ? '14x7 Enhanced Large Format' : '5x9 Compact Format';
    const { data: template, error: templateError } = await supabase
      .from('label_templates')
      .select('*')
      .eq('name', templateName)
      .single();

    if (templateError || !template) {
      // Get available templates for error message
      const { data: availableTemplates } = await supabase
        .from('label_templates')
        .select('name')
        .eq('is_active', true);

      return NextResponse.json(
        { 
          error: 'Label template not found',
          requestedTemplate: templateName,
          requestedSize: size,
          availableTemplates: availableTemplates?.map(t => t.name) || [],
          validSizes: ['14x7', '5x9']
        },
        { status: 404 }
      );
    }

    // Check for individual label template CSS overrides for this product
    const { data: individualTemplate, error: individualError } = await supabase
      .from('individual_label_templates')
      .select('custom_css, css_overrides, template_id, notes')
      .eq('product_id', product.id)
      .maybeSingle();

    console.log(`🎨 Individual CSS for ${product.name}: ${individualTemplate ? 'Found' : 'Not found'}`);

    // Extract pictogram data from the joined query
    const pictogramData = product.product_pictograms?.map((pp: any) => pp.pictograms) || [];

    console.log(`📄 Product: ${product.name}, Pictograms: ${pictogramData.length}, Template: ${template.name}`);

    // Create a comprehensive mapping of template variables to product data
    const templateVars: Record<string, string> = {
      product_name: product.name || '',
      name: product.name || '',
      description: product.description || '',
      application: product.application || '',
      features: product.features || '',
      limitations: product.limitations || '',
      shelf_life: product.shelf_life || '',
      short_description_english: product.short_description_english || '',
      short_description_french: product.short_description_french || '',
      short_description_spanish: product.short_description_spanish || '',
      signal_word: product.signal_word || '',
      hazard_statements: product.hazard_statements || '',
      precautionary_statements: product.precautionary_statements || '',
      response_statements: product.response_statements || '',
      first_aid: product.first_aid || '',
      storage: product.storage || '',
      disposal: product.disposal || '',
      proper_shipping_name: product.proper_shipping_name || '',
      un_number: product.un_number || '',
      hazard_class: product.hazard_class || '',
      packing_group: product.packing_group || '',
      emergency_response_guide: product.emergency_response_guide || '',
      components_determining_hazard: product.components_determining_hazard || '',
      coverage: product.coverage || '',
      voc_data: product.voc_data || '',
      // Boolean flags
      do_not_freeze: product.do_not_freeze ? 'Yes' : 'No',
      mix_well: product.mix_well ? 'Yes' : 'No',
      green_conscious: product.green_conscious ? 'Yes' : 'No',
      // French fields
      composants_determinant_le_danger: product.composants_determinant_le_danger || '',
      mot_de_signalement: product.mot_de_signalement || '',
      mentions_de_danger: product.mentions_de_danger || '',
      conseils_de_prudence: product.conseils_de_prudence || '',
      premiers_soins: product.premiers_soins || '',
      mesures_de_premiers_secours: product.mesures_de_premiers_secours || '',
      consignes_de_stockage: product.consignes_de_stockage || '',
      consignes_delimination: product.consignes_delimination || '',
      // Dynamic pictograms
      pictograms: pictogramData
        .map((pictogram: any) => `<img src="${pictogram.url}" alt="${pictogram.name}" class="pictogram" />`)
        .join(''),
    };

    // Get HTML and CSS templates
    let html = template.html_template;
    let finalCSS = template.css_template;

    // Add individual label template CSS overrides if they exist
    if (individualTemplate) {
      if (individualTemplate.custom_css) {
        finalCSS += `\n\n/* INDIVIDUAL TEMPLATE CUSTOM CSS */\n${individualTemplate.custom_css}`;
      }
      if (individualTemplate.css_overrides) {
        finalCSS += `\n\n/* INDIVIDUAL TEMPLATE CSS OVERRIDES */\n${individualTemplate.css_overrides}`;
      }
    }

    // Process conditional sections in HTML template
    function processConditionals(html: string, vars: Record<string, string>): string {
      let processedHTML = html;
      let changed = true;
      
      while (changed) {
        const beforeLength = processedHTML.length;
        
        // Find all conditional blocks
        const conditionalRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
        const conditionals: Array<{
          match: string;
          condition: string;
          content: string;
          start: number;
          end: number;
        }> = [];
        
        let match;
        while ((match = conditionalRegex.exec(processedHTML)) !== null) {
          conditionals.push({
            match: match[0],
            condition: match[1].trim(),
            content: match[2],
            start: match.index,
            end: match.index + match[0].length
          });
        }
        
        conditionals.reverse().forEach(conditional => {
          const conditionValue = vars[conditional.condition] || '';
          const shouldShow = conditionValue && 
                           conditionValue !== 'No' && 
                           conditionValue !== 'false' && 
                           conditionValue !== '0' && 
                           conditionValue.trim() !== '';
          
          const replacement = shouldShow ? conditional.content : '';
          processedHTML = processedHTML.substring(0, conditional.start) + 
                         replacement + 
                         processedHTML.substring(conditional.end);
        });
        
        changed = processedHTML.length !== beforeLength;
      }
      
      return processedHTML;
    }

    // Process conditionals with proper nesting support
    const processedHTML = processConditionals(html, templateVars);
    html = processedHTML;

    // Replace simple template variables {{variable}}
    Object.keys(templateVars).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      html = html.replace(regex, templateVars[key]);
    });

    // Add CSS styles if specified in template
    html = html.replace(/\{\{css_styles\}\}/g, finalCSS || '');

    // Create complete HTML document for PDF generation
    const completeHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${product.name} - Label</title>
          <style>
            /* Template CSS with Individual Overrides Applied */
            ${finalCSS}
            
            /* PDF-specific styles */
            @media print {
              body { margin: 0; }
              .page-break { page-break-before: always; }
            }
            
            /* Ensure proper sizing for PDF */
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 10px;
            }
            
            .pictogram {
              width: 24px;
              height: 24px;
              margin: 2px;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    // Generate PDF using Puppeteer with fallback options
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      });
    } catch (launchError) {
      console.error('Failed to launch browser with default settings:', launchError);
      
      // Try alternative approach with system Chrome as fallback
      try {
        browser = await puppeteer.launch({
          headless: true,
          executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
          ]
        });
      } catch (systemChromeError) {
        console.error('System Chrome also failed:', systemChromeError);
        throw new Error('Chrome browser not available. Please ensure Chrome is installed or run: npx puppeteer browsers install chrome');
      }
    }

    const page = await browser.newPage();
    await page.setContent(completeHTML, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Set page format based on label size
    const pdfOptions = {
      format: 'Letter' as const,
      printBackground: true,
      margin: { 
        top: '0.25in', 
        bottom: '0.25in', 
        left: '0.25in', 
        right: '0.25in' 
      }
    };

    if (size === '5x9') {
      // Adjust for smaller label format
      pdfOptions.margin = { 
        top: '0.5in', 
        bottom: '0.5in', 
        left: '0.5in', 
        right: '0.5in' 
      };
    }

    const pdf = await page.pdf(pdfOptions);
    await browser.close();

    // Optional: Save to Supabase Storage for caching
    try {
      const fileName = `${decodedTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${size}_${Date.now()}.pdf`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('labels')
        .upload(fileName, pdf, {
          contentType: 'application/pdf',
          cacheControl: '3600'
        });

      if (!uploadError && uploadData) {
        // Update product_labels table with PDF URL
        await supabase
          .from('product_labels')
          .upsert({
            product_id: product.id,
            template_id: template.id,
            pdf_url: uploadData.path,
            language: 'en',
            version: 1,
            is_current: true
          });
      }
    } catch (storageError) {
      console.error('Storage error (non-fatal):', storageError);
      // Continue with PDF download even if storage fails
    }

    const fileName = `${decodedTitle.replace(/[^a-zA-Z0-9\s]/g, '')}_${size}_label.pdf`;

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('PDF Generation Error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Chrome browser not available')) {
        return NextResponse.json(
          { 
            error: 'Chrome browser not found',
            details: 'PDF generation requires Chrome browser. Please run: npx puppeteer browsers install chrome',
            suggestion: 'Install Chrome for Puppeteer to enable PDF generation'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'PDF generation failed',
          details: error.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'PDF generation failed' },
      { status: 500 }
    );
  }
}