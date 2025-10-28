/**
 * Simplified Categories API Route (Layer 4)
 * 
 * Next.js API route using simplified services from Layer 3
 * Following the 6-Layer Type Safety Chain
 */

import { NextRequest, NextResponse } from 'next/server';
import { categoriesService } from '@/lib/services/simplified';
import { CategoriesFiltersSchema, CategoriesInsertSchema } from '@/lib/schemas';

// ============================================================================
// GET /api/simplified/categories
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
      parentId: searchParams.get('parentId') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
    };

    // Special handling for root categories
    const rootOnly = searchParams.get('rootOnly') === 'true';

    // Validate filters with Zod
    const validationResult = CategoriesFiltersSchema.safeParse(filters);
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

    // Use appropriate service method based on query type
    let result;
    if (rootOnly) {
      result = await categoriesService.findRootCategories(validationResult.data);
    } else {
      result = await categoriesService.findMany(validationResult.data);
    }
    
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
    console.error('Categories API error:', error);
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
// POST /api/simplified/categories
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input with Zod
    const validationResult = CategoriesInsertSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid category data',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    // Use service to create category (with auto-generated slug)
    const result = await categoriesService.createWithSlug(validationResult.data);
    
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
    console.error('Categories creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
