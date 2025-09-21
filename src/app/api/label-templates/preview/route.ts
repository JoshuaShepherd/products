import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { html_template, css_template, sample_data } = await request.json();
    
    // Process template with sample data (similar to existing label generation)
    let processedHTML = html_template;
    
    // Replace template variables with sample data
    if (sample_data) {
      Object.keys(sample_data).forEach(key => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        processedHTML = processedHTML.replace(regex, sample_data[key] || '');
      });
    }

    // Process conditional sections
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

    // Process conditionals if sample data is provided
    if (sample_data) {
      processedHTML = processConditionals(processedHTML, sample_data);
    }

    // Create complete HTML document
    const completeHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Label Preview</title>
          <style>
            ${css_template}
            
            /* Preview-specific styles */
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 10px;
              background: #f5f5f5;
            }
            
            .preview-container {
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              max-width: 100%;
              overflow: auto;
            }
            
            .pictogram {
              width: 24px;
              height: 24px;
              margin: 2px;
            }
          </style>
        </head>
        <body>
          <div class="preview-container">
            ${processedHTML}
          </div>
        </body>
      </html>
    `;

    return new NextResponse(completeHTML, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Preview generation error:', error);
    return NextResponse.json({ error: 'Preview generation failed' }, { status: 500 });
  }
}