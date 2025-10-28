/**
 * Simplified Products API Route (Layer 4)
 * 
 * Next.js API route using simplified services from Layer 3
 * Following the 6-Layer Type Safety Chain
 */

import { NextRequest, NextResponse } from 'next/server';
import { productsService } from '@/lib/services/simplified';
import { ProductsFiltersSchema, ProductsInsertSchema } from '@/lib/schemas';

// ============================================================================
// GET /api/simplified/products
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      signalWord: searchParams.get('signalWord') || undefined,
      hazardClass: searchParams.get('hazardClass') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
    };

    // Validate filters with Zod
    const validationResult = ProductsFiltersSchema.safeParse(filters);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    // Use service to get products
    const result = await productsService.findMany(validationResult.data);
    
    if (!result.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.data.length
    });

  } catch (error) {
    console.error('Products API error:', error);
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
// POST /api/simplified/products
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input with Zod
    const validationResult = ProductsInsertSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid product data',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    // Use service to create product
    const result = await productsService.create(validationResult.data);
    
    if (!result.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status: result.error.code === 'SLUG_EXISTS' ? 409 : 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Products creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
