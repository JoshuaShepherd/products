/**
 * Simplified Product by ID API Route (Layer 4)
 * 
 * Next.js API route for individual product operations
 * Following the 6-Layer Type Safety Chain
 */

import { NextRequest, NextResponse } from 'next/server';
import { productsService } from '@/lib/services/simplified';
import { ProductsUpdateSchema, IdSchema } from '@/lib/schemas';

// ============================================================================
// GET /api/simplified/products/[id]
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const validationResult = IdSchema.safeParse(params.id);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid product ID format' 
        },
        { status: 400 }
      );
    }

    // Use service to get product
    const result = await productsService.findById(validationResult.data);
    
    if (!result.ok) {
      const status = result.error.code === 'NOT_FOUND' ? 404 : 500;
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Product fetch error:', error);
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
// PUT /api/simplified/products/[id]
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const idValidation = IdSchema.safeParse(params.id);
    if (!idValidation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid product ID format' 
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate update data with Zod
    const validationResult = ProductsUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid product update data',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    // Use service to update product (with slug refresh if name changes)
    const result = await productsService.updateWithSlugRefresh(
      idValidation.data, 
      validationResult.data
    );
    
    if (!result.ok) {
      let status = 500;
      if (result.error.code === 'NOT_FOUND') status = 404;
      if (result.error.code === 'SLUG_EXISTS') status = 409;
      
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Product update error:', error);
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
// DELETE /api/simplified/products/[id]
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const validationResult = IdSchema.safeParse(params.id);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid product ID format' 
        },
        { status: 400 }
      );
    }

    // Use service to delete product
    const result = await productsService.delete(validationResult.data);
    
    if (!result.ok) {
      const status = result.error.code === 'NOT_FOUND' ? 404 : 500;
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
