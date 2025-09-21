# HTML/CSS to PDF Conversion Guide for SpecChem Label System

## Overview

This guide outlines how to implement HTML/CSS to PDF conversion in the SpecChem product label management system. The current system generates HTML labels dynamically from database templates and product data. This guide explains how to extend it with PDF generation capabilities.

## Current Architecture

### Existing Label System
The current system consists of:

1. **Database Templates**: Stored in `label_templates` table with HTML and CSS templates
2. **Dynamic Generation**: `/api/label/[title]/route.ts` processes templates with product data
3. **Template Variables**: Product fields are injected into `{{variable}}` placeholders
4. **Conditional Logic**: Support for conditional sections using `{{#if condition}}...{{/if}}`
5. **Preview System**: Labels displayed in iframe for preview in `/labels` page

### Current Data Flow
```
Product Data (Supabase) → Template Processing → HTML/CSS → Browser Rendering → Preview
```

### Existing Infrastructure
- **Database**: `product_labels` table with `pdf_url` field (ready for PDF storage)
- **Templates**: 14x7 and 5x9 label formats with responsive CSS
- **API Routes**: `/api/label/[title]` generates HTML labels
- **Frontend**: React components for label management and preview

## PDF Conversion Implementation Options

### Option 1: Puppeteer (Server-Side Rendering)
**Best for: Production-ready, high-quality PDFs**

#### Dependencies
```bash
npm install puppeteer
npm install @types/puppeteer --save-dev
```

#### Implementation Steps

1. **Create PDF Generation API Route**
   - New route: `/api/label/[title]/pdf/route.ts`
   - Uses existing HTML generation logic
   - Adds Puppeteer PDF conversion

2. **PDF Generation Function**
```typescript
import puppeteer from 'puppeteer';

async function generatePDFFromHTML(html: string, size: 'A4' | 'Letter' = 'Letter') {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  const pdf = await page.pdf({
    format: size,
    printBackground: true,
    margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' }
  });
  
  await browser.close();
  return pdf;
}
```

3. **Storage Integration**
   - Save PDFs to Supabase Storage
   - Update `product_labels.pdf_url` field
   - Implement caching strategy

#### Pros:
- High-quality, production-ready PDFs
- Full control over rendering
- Handles complex CSS layouts
- Can generate different page sizes

#### Cons:
- Requires server resources
- Cold start delays
- Memory intensive

### Option 2: React-PDF (Client-Side Generation)
**Best for: Simple layouts, client-side generation**

#### Dependencies
```bash
npm install @react-pdf/renderer
```

#### Implementation
- Convert existing HTML templates to React-PDF components
- Client-side PDF generation
- No server resources required

#### Pros:
- No server overhead
- Fast generation
- React-native syntax

#### Cons:
- Limited CSS support
- Requires template rewrite
- Less control over styling

### Option 3: jsPDF + html2canvas
**Best for: Quick implementation, browser compatibility**

#### Dependencies
```bash
npm install jspdf html2canvas
npm install @types/jspdf --save-dev
```

#### Implementation
- Convert HTML to canvas
- Generate PDF from canvas images
- Client-side processing

#### Pros:
- Easy to implement
- Works in all browsers
- No server requirements

#### Cons:
- Image-based PDFs (not text-selectable)
- Quality limitations
- Large file sizes

## Recommended Implementation: Puppeteer Server-Side

### Step 1: Create PDF API Route

Create `/src/app/api/label/[title]/pdf/route.ts`:

```typescript
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
    
    // Get HTML from existing label generation logic
    const htmlResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/label/${encodeURIComponent(title)}?size=${size}`
    );
    
    if (!htmlResponse.ok) {
      throw new Error('Failed to generate HTML');
    }
    
    const html = await htmlResponse.text();
    
    // Generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.25in', bottom: '0.25in', left: '0.25in', right: '0.25in' }
    });
    
    await browser.close();
    
    // Optional: Save to Supabase Storage
    const supabase = await createClient();
    const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${size}_${Date.now()}.pdf`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('labels')
      .upload(fileName, pdf, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      });
    
    if (!uploadError) {
      // Update product_labels table with PDF URL
      await supabase
        .from('product_labels')
        .upsert({
          product_id: /* get product ID */,
          template_id: /* get template ID */,
          pdf_url: uploadData.path,
          language: 'en',
          version: 1,
          is_current: true
        });
    }
    
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}
```

### Step 2: Update Labels Page UI

Modify `/src/app/labels/page.tsx` to add PDF download options:

```typescript
// Add to existing button group in the labels interface
<div className="flex gap-2">
  {/* Existing preview button */}
  <Button
    variant="outline"
    size="sm"
    onClick={() => setPreviewProduct(product)}
  >
    <Eye className="h-4 w-4 mr-2" />
    Preview
  </Button>
  
  {/* New PDF download button */}
  <Button
    variant="default"
    size="sm"
    onClick={() => downloadPDF(product.name)}
    disabled={generating}
  >
    <Download className="h-4 w-4 mr-2" />
    PDF
  </Button>
</div>
```

Add PDF download function:

```typescript
const downloadPDF = async (productName: string) => {
  try {
    setGenerating(true);
    
    const response = await fetch(
      `/api/label/${encodeURIComponent(productName)}/pdf?size=${labelSize}`
    );
    
    if (!response.ok) {
      throw new Error('PDF generation failed');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${productName}_${labelSize}_label.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
  } catch (error) {
    console.error('PDF download failed:', error);
    setError('Failed to download PDF');
  } finally {
    setGenerating(false);
  }
};
```

### Step 3: Bulk PDF Generation

Add bulk PDF generation for multiple products:

```typescript
const generateBulkPDFs = async () => {
  if (selectedProducts.size === 0) return;
  
  setGenerating(true);
  const errors: string[] = [];
  
  for (const productName of selectedProducts) {
    try {
      await downloadPDF(productName);
      // Add delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      errors.push(`Failed to generate PDF for ${productName}`);
    }
  }
  
  if (errors.length > 0) {
    setError(`Some PDFs failed to generate: ${errors.join(', ')}`);
  }
  
  setGenerating(false);
};
```

### Step 4: Environment Configuration

Add to `.env.local`:

```env
# PDF Generation
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser  # For production
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # For development
```

For production deployment, ensure Puppeteer dependencies are installed:

```dockerfile
# In Dockerfile or deployment config
RUN apt-get update && apt-get install -y \
  chromium-browser \
  fonts-liberation \
  fonts-freefont-ttf
```

## Integration with Labels Page

### Enhanced UI Features

1. **PDF Download Buttons**
   - Individual product PDF download
   - Bulk PDF generation for selected products
   - Progress indicators during generation

2. **Format Options**
   - Choose PDF page size (Letter, A4)
   - Quality settings (print vs. screen)
   - Margin adjustments

3. **Storage Management**
   - View previously generated PDFs
   - Cache management
   - Version control for updated labels

### User Workflow

1. **Single Label PDF**:
   - Browse products in labels page
   - Select label size (14x7 or 5x9)
   - Click "PDF" button next to desired product
   - PDF downloads automatically

2. **Bulk Label Generation**:
   - Select multiple products using checkboxes
   - Choose label size for all selected
   - Click "Generate PDFs" button
   - All PDFs download sequentially

3. **Preview Before Download**:
   - Click "Preview" to see HTML version
   - Verify layout and content
   - Click "Download PDF" from preview modal

## Performance Considerations

### Optimization Strategies

1. **Caching**
   - Cache generated PDFs in Supabase Storage
   - Use Redis for temporary storage
   - Implement cache invalidation on product updates

2. **Queue System**
   - Use background job queue for bulk generation
   - Prevent server overload with rate limiting
   - Email notifications for large batch completions

3. **Resource Management**
   - Pool Puppeteer browser instances
   - Implement memory limits
   - Auto-cleanup of temporary files

### Monitoring and Error Handling

1. **Logging**
   - Track PDF generation success/failure rates
   - Monitor performance metrics
   - Alert on generation failures

2. **Fallback Options**
   - Retry failed generations
   - Fallback to HTML download if PDF fails
   - User-friendly error messages

## Security Considerations

1. **Input Validation**
   - Sanitize product names and parameters
   - Prevent injection attacks in templates
   - Validate file sizes and formats

2. **Access Control**
   - Authenticate PDF generation requests
   - Rate limiting per user/IP
   - Audit log for PDF downloads

3. **Storage Security**
   - Secure PDF storage in Supabase
   - Temporary URL generation
   - Automatic cleanup of old files

## Testing Strategy

### Unit Tests
```typescript
// Test PDF generation
describe('PDF Generation', () => {
  it('should generate PDF from product data', async () => {
    const pdf = await generatePDFFromHTML(mockHTML);
    expect(pdf).toBeDefined();
    expect(pdf.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests
- Test full workflow from product selection to PDF download
- Verify PDF quality and content accuracy
- Test bulk generation performance

### End-to-End Tests
- Automate user workflows with Playwright
- Test in different browsers and devices
- Verify download functionality

## Deployment Checklist

- [ ] Install Puppeteer dependencies
- [ ] Configure environment variables
- [ ] Set up Supabase Storage bucket for PDFs
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerts
- [ ] Test PDF generation in production environment
- [ ] Create user documentation

## Future Enhancements

1. **Advanced Features**
   - Batch processing with progress tracking
   - PDF templates with fillable forms
   - Digital signatures for compliance labels
   - Multi-language PDF generation

2. **Integration Options**
   - Email PDF labels directly
   - Print queue integration
   - External storage providers (AWS S3, Google Cloud)
   - API for third-party integrations

This implementation provides a robust, scalable solution for converting the existing HTML/CSS label system to PDF format while maintaining the current template-based architecture and adding powerful new capabilities for users.