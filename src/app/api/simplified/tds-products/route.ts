/**
 * Simplified TDS Products API Route (Layer 4)
 * 
 * Next.js API route using simplified services from Layer 3
 * Following the 6-Layer Type Safety Chain
 */

import { NextRequest, NextResponse } from 'next/server';
import { tdsProductsService } from '@/lib/services/simplified';
import { TdsProductsFiltersSchema, TdsProductsInsertSchema } from '@/lib/schemas';

// ============================================================================
// GET /api/simplified/tds-products
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
      id: searchParams.get('id') ? parseInt(searchParams.get('id')!) : undefined,
      productName: searchParams.get('productName') || undefined,
      category: searchParams.get('category') || undefined,
      documentId: searchParams.get('documentId') || undefined,
    };

    // Validate filters with Zod
    const validationResult = TdsProductsFiltersSchema.safeParse(filters);
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

    // Use service to get TDS products
    const result = await tdsProductsService.findMany(validationResult.data);
    
    if (!result.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('TDS Products API Error:', error);
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
// POST /api/simplified/tds-products
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const validationResult = TdsProductsInsertSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request body',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    // Use service to create TDS product
    const result = await tdsProductsService.create(validationResult.data);
    
    if (!result.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status: 400 }
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
    console.error('TDS Products Create API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
