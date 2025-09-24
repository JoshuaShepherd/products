import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const size = searchParams.get('size') || '14x7'
    const { id } = await params
    const productId = id // UUID string, no need to parse as integer

    // Basic validation for UUID format
    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get product by ID
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (error || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get label template for the specified size
    const templateName = size === '14x7' ? '14x7 Enhanced Large Format' : '5x9 Compact Format';
    const { data: template, error: templateError } = await supabase
      .from('label_templates')
      .select('*')
      .eq('name', templateName)
      .single()

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Label template not found' },
        { status: 404 }
      )
    }

    // Generate HTML by replacing template variables
    let html = template.html_template || ''
    
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
      
      // Pictograms - we'll populate this separately
      pictograms: ''
    };

    // Get pictograms for this product
    const { data: productPictograms } = await supabase
      .from('product_pictograms')
      .select(`
        pictograms (
          name,
          slug,
          url,
          description
        )
      `)
      .eq('product_id', product.id)
      .order('sort_order');

    // Generate pictogram HTML
    if (productPictograms && productPictograms.length > 0) {
      const pictogramHtml = productPictograms
        .map((pp: any) => {
          const p = pp.pictograms;
          return `<img src="${p.url}" alt="${p.description || p.name}" style="width: 26px; height: 26px; object-fit: contain; border-radius: 5px; border: 1px solid #e3e8f1; background: #f7fafc;">`;
        })
        .join('');
      templateVars.pictograms = pictogramHtml;
    } else {
      templateVars.pictograms = '';
    }
    
    // Handle Handlebars-style conditional blocks {{#if variable}}content{{/if}}
    // Process nested conditionals properly by parsing from innermost to outermost
    function processConditionals(html: string, templateVars: Record<string, string>): string {
      let processedHTML = html;
      let changed = true;
      let passCount = 0;
      
      // Keep processing until no more changes (handles nested conditionals)
      while (changed && passCount < 10) {
        passCount++;
        const beforeLength = processedHTML.length;
        
        // Find innermost conditionals first (those without nested {{#if}} blocks inside)
        const conditionals: { start: number, end: number, varName: string, content: string, fullMatch: string }[] = [];
        
        // Use a more precise regex that matches complete conditional blocks
        let match;
        const regex = /\{\{#if\s+([^}]+)\}\}/g;
        
        while ((match = regex.exec(processedHTML)) !== null) {
          const varName = match[1].trim();
          const openTag = match[0];
          const startPos = match.index;
          
          // Find the matching {{/if}} by counting nested levels
          let level = 1;
          let pos = match.index + openTag.length;
          let endPos = -1;
          
          while (pos < processedHTML.length && level > 0) {
            const remainingText = processedHTML.substring(pos);
            const openMatch = remainingText.match(/^\{\{#if\s+[^}]+\}\}/);
            const closeMatch = remainingText.match(/^\{\{\/if\}\}/);
            
            if (openMatch) {
              level++;
              pos += openMatch[0].length;
            } else if (closeMatch) {
              level--;
              if (level === 0) {
                endPos = pos + closeMatch[0].length;
              } else {
                pos += closeMatch[0].length;
              }
            } else {
              pos++;
            }
          }
          
          if (endPos !== -1) {
            const content = processedHTML.substring(startPos + openTag.length, endPos - 7); // -7 for {{/if}}
            const fullMatch = processedHTML.substring(startPos, endPos);
            conditionals.push({ start: startPos, end: endPos, varName, content, fullMatch });
          }
        }
        
        // Process conditionals from last to first (to maintain string positions)
        conditionals.reverse().forEach(conditional => {
          const value = templateVars[conditional.varName];
          const shouldShow = (value && value.trim() !== '');
          const replacement = shouldShow ? conditional.content : '';
          
          console.log(`🔍 DEBUG - Pass ${passCount} {{#if ${conditional.varName}}}: value="${value}" -> ${shouldShow ? 'SHOW' : 'HIDE'}`);
          
          processedHTML = processedHTML.substring(0, conditional.start) + 
                         replacement + 
                         processedHTML.substring(conditional.end);
        });
        
        changed = processedHTML.length !== beforeLength;
      }
      
      return processedHTML;
    }
    
    // Debug: Log template processing
    console.log('🔍 DEBUG - Template before processing conditionals (length):', html.length);
    console.log('🔍 DEBUG - Checking key SDS variables:');
    console.log('  - proper_shipping_name:', templateVars.proper_shipping_name);
    console.log('  - components_determining_hazard:', templateVars.components_determining_hazard);
    console.log('  - pictograms:', templateVars.pictograms);
    
    // Process conditionals with proper nesting support
    const processedHTML = processConditionals(html, templateVars);
    
    html = processedHTML;
    
    // Replace simple template variables {{variable}}
    Object.keys(templateVars).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      html = html.replace(regex, templateVars[key]);
    });
    
    // Add CSS styles if specified in template
    html = html.replace(/\{\{css_styles\}\}/g, template.css_template || '');

    // Return HTML with appropriate content type
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('Error generating label:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
