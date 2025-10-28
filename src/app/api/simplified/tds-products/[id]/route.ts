/**
 * Simplified TDS Products Individual API Route (Layer 4)
 * 
 * Next.js API route for individual TDS product operations
 * Following the 6-Layer Type Safety Chain
 */

import { NextRequest, NextResponse } from 'next/server';
import { tdsProductsService } from '@/lib/services/simplified';
import { TdsProductsUpdateSchema } from '@/lib/schemas';

// ============================================================================
// GET /api/simplified/tds-products/[id]
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
          error: 'Invalid TDS product ID' 
        },
        { status: 400 }
      );
    }

    // Use service to get TDS product by ID
    const result = await tdsProductsService.findById(id);
    
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
    console.error('TDS Product Get API Error:', error);
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
// PUT /api/simplified/tds-products/[id]
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
          error: 'Invalid TDS product ID' 
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body with Zod
    const validationResult = TdsProductsUpdateSchema.safeParse(body);
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

    // Use service to update TDS product
    const result = await tdsProductsService.update(id, validationResult.data);
    
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
    console.error('TDS Product Update API Error:', error);
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
// DELETE /api/simplified/tds-products/[id]
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
          error: 'Invalid TDS product ID' 
        },
        { status: 400 }
      );
    }

    // Use service to delete TDS product
    const result = await tdsProductsService.delete(id);
    
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
      message: 'TDS Product deleted successfully'
    });

  } catch (error) {
    console.error('TDS Product Delete API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
