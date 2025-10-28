/**
 * Simplified SDS Products Individual API Route (Layer 4)
 * 
 * Next.js API route for individual SDS product operations
 * Following the 6-Layer Type Safety Chain
 */

import { NextRequest, NextResponse } from 'next/server';
import { sdsProductsService } from '@/lib/services/simplified';
import { SdsProductsUpdateSchema } from '@/lib/schemas';

// ============================================================================
// GET /api/simplified/sds-products/[id]
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid SDS product ID' 
        },
        { status: 400 }
      );
    }

    // Use service to get SDS product by ID
    const result = await sdsProductsService.findById(id);
    
    if (!result.ok) {
      const status = result.error.includes('not found') ? 404 : 400;
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
    console.error('SDS Product Get API Error:', error);
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
// PUT /api/simplified/sds-products/[id]
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid SDS product ID' 
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body with Zod
    const validationResult = SdsProductsUpdateSchema.safeParse(body);
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

    // Use service to update SDS product
    const result = await sdsProductsService.update(id, validationResult.data);
    
    if (!result.ok) {
      const status = result.error.includes('not found') ? 404 : 400;
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
    console.error('SDS Product Update API Error:', error);
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
// DELETE /api/simplified/sds-products/[id]
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid SDS product ID' 
        },
        { status: 400 }
      );
    }

    // Use service to delete SDS product
    const result = await sdsProductsService.delete(id);
    
    if (!result.ok) {
      const status = result.error.includes('not found') ? 404 : 400;
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
      message: 'SDS Product deleted successfully'
    });

  } catch (error) {
    console.error('SDS Product Delete API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
