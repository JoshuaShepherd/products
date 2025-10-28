/**
 * Simplified Products Search API Route (Layer 4)
 * 
 * Next.js API route for advanced product search functionality
 * Following the 6-Layer Type Safety Chain
 */

import { NextRequest, NextResponse } from 'next/server';
import { productsService } from '@/lib/services/simplified';
import { ProductsFiltersSchema } from '@/lib/schemas';
import { z } from 'zod';

// Search-specific validation schema
const ProductSearchSchema = ProductsFiltersSchema.extend({
  q: z.string().min(1, 'Search query is required'),
});

// ============================================================================
// GET /api/simplified/products/search?q=query&...filters
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const searchRequest = {
      q: searchParams.get('q') || '',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      signalWord: searchParams.get('signalWord') || undefined,
      hazardClass: searchParams.get('hazardClass') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
    };

    // Validate search parameters
    const validationResult = ProductSearchSchema.safeParse(searchRequest);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid search parameters',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { q: query, ...filters } = validationResult.data;

    // Use service to search products
    const result = await productsService.search(query, filters);
    
    if (!result.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const countResult = await productsService.count(filters);
    const totalCount = countResult.ok ? countResult.data : 0;

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        count: result.data.length,
        totalCount,
        totalPages: Math.ceil(totalCount / (filters.limit || 10))
      },
      search: {
        query,
        filters: {
          categoryId: filters.categoryId,
          signalWord: filters.signalWord,
          hazardClass: filters.hazardClass,
          isActive: filters.isActive
        }
      }
    });

  } catch (error) {
    console.error('Product search error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/simplified/products/search (for complex search)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate search request body
    const validationResult = ProductSearchSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid search request',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { q: query, ...filters } = validationResult.data;

    // Use service to search products
    const result = await productsService.search(query, filters);
    
    if (!result.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const countResult = await productsService.count(filters);
    const totalCount = countResult.ok ? countResult.data : 0;

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        count: result.data.length,
        totalCount,
        totalPages: Math.ceil(totalCount / (filters.limit || 10))
      },
      search: {
        query,
        filters: {
          categoryId: filters.categoryId,
          signalWord: filters.signalWord,
          hazardClass: filters.hazardClass,
          isActive: filters.isActive
        }
      }
    });

  } catch (error) {
    console.error('Product search error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
