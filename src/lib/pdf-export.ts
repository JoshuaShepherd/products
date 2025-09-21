/**
 * PDF Export Utilities
 * 
 * This file contains helper functions for PDF export functionality.
 * All PDF-related code is isolated here for easy maintenance and removal.
 */

import { getProductIdByTitle } from '@/utils/product-utils';

/**
 * Gets the HTML content for a product label by calling the existing label API using product title
 * This function now tries to use the ID-based API when possible for better reliability
 */
export async function getProductLabelHtml(productTitle: string, size: '5x9' | '14x7' = '14x7'): Promise<string> {
  try {
    // Try to get the product ID first for more reliable lookup
    const productId = await getProductIdByTitle(productTitle);
    
    if (productId) {
      // Use the ID-based API if we found the product ID
      return await getProductLabelHtmlById(productId, size);
    } else {
      // Fall back to title-based API (which now handles duplicates)
      const sizeParam = size !== '14x7' ? `?size=${size}` : '';
      const response = await fetch(`/api/label/${encodeURIComponent(productTitle)}${sizeParam}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch label HTML: ${response.status}`);
      }
      return await response.text();
    }
  } catch (error) {
    console.error('Error fetching label HTML:', error);
    throw error;
  }
}

/**
 * Gets the HTML content for a product label by calling the label API using product ID
 * This is more reliable than using title since IDs are unique
 */
export async function getProductLabelHtmlById(productId: string, size: '5x9' | '14x7' = '14x7'): Promise<string> {
  try {
    const url = `/api/label/id/${productId}${size !== '14x7' ? `?size=${size}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch label HTML: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching label HTML by ID:', error);
    throw error;
  }
}

/**
 * Sanitizes a filename by removing/replacing invalid characters
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\s\-_]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .trim();
}

/**
 * Validates that the HTML content is suitable for PDF generation
 */
export function validateHtmlForPdf(html: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!html || html.trim().length === 0) {
    issues.push('HTML content is empty');
  }
  
  if (html.length < 100) {
    issues.push('HTML content appears to be too short');
  }
  
  // Check for common HTML structure
  if (!html.includes('<html') && !html.includes('<div')) {
    issues.push('HTML content does not appear to contain valid HTML structure');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Configuration for different PDF export services
 * This makes it easy to switch between services or add new ones
 */
export const PDF_EXPORT_CONFIG = {
  // Service priority (first available service will be used)
  servicePriority: ['pdfshift', 'docraptor'] as const,
  
  // Default PDF options
  defaultOptions: {
    format: 'Letter',
    margin: '0.5in',
    printBackground: true,
    landscape: false,
  },
  
  // Maximum HTML size (in characters) to prevent oversized requests
  maxHtmlSize: 1024 * 1024, // 1MB
  
  // Timeout for PDF generation requests (in milliseconds)
  requestTimeout: 30000, // 30 seconds
};

/**
 * Gets the status of PDF export feature (whether it's properly configured)
 */
export function getPdfExportStatus(): {
  available: boolean;
  service: string | null;
  message: string;
} {
  // This would typically check environment variables, but since we're client-side,
  // we'll let the API route handle the actual service detection
  return {
    available: true, // Assume available, API will return error if not configured
    service: 'api-determined', // Let the API determine which service to use
    message: 'PDF export will use the configured service (PDFShift or DocRaptor)'
  };
}

/**
 * Formats error messages for user display
 */
export function formatPdfExportError(error: unknown): string {
  if (error instanceof Error) {
    // Handle common error scenarios with user-friendly messages
    if (error.message.includes('503') || error.message.includes('not configured')) {
      return 'PDF export is not currently available. Please contact support.';
    }
    
    if (error.message.includes('timeout')) {
      return 'PDF generation timed out. Please try again.';
    }
    
    if (error.message.includes('too large')) {
      return 'The label content is too large to export as PDF.';
    }
    
    // Generic error message
    return `Export failed: ${error.message}`;
  }
  
  return 'An unexpected error occurred during PDF export.';
}
