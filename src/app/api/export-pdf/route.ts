import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const { html, filename } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    // Generate PDF using Puppeteer
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
      });

      const page = await browser.newPage();
      
      // Set page content with proper encoding
      await page.setContent(html, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 30000
      });

      // Generate PDF with high quality settings
      const pdf = await page.pdf({
        format: 'Letter',
        printBackground: true,
        margin: {
          top: '0.5in',
          bottom: '0.5in',
          left: '0.5in',
          right: '0.5in'
        },
        preferCSSPageSize: true,
      });

      await browser.close();

      // Return PDF as response
      return new NextResponse(Buffer.from(pdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename || 'label.pdf'}"`,
          'Cache-Control': 'public, max-age=3600'
        }
      });

    } catch (puppeteerError) {
      if (browser) {
        await browser.close();
      }
      throw puppeteerError;
    }

  } catch (error) {
    console.error('PDF Export Error:', error);
    
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