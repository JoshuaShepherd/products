import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ProductUpdateSchema } from '@/lib/schemas/product.schema'
import { mapFormDataToDatabase } from '@/lib/schemas/form-mappings'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔄 Product update request received for ID:', id)
    
    const body = await request.json()
    console.log('📦 Update request body:', body)

    // Map form data to database format
    const mappedData = mapFormDataToDatabase(body)
    console.log('🔄 Mapped data:', mappedData)
    
    // Validate using Zod
    const validationResult = ProductUpdateSchema.safeParse(mappedData)
    
    if (!validationResult.success) {
      console.error('❌ Validation failed:', validationResult.error.issues)
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    const updateData = validationResult.data
    console.log('✅ Validated update data:', updateData)

    // Initialize Supabase client
    const supabase = await createClient()
    
    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id, name, slug')
      .eq('id', id)
      .single()

    if (fetchError || !existingProduct) {
      console.error('❌ Product not found:', fetchError)
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check for slug conflicts (if slug is being updated)
    if (updateData.slug && updateData.slug !== existingProduct.slug) {
      const { data: duplicateSlug } = await supabase
        .from('products')
        .select('id')
        .eq('slug', updateData.slug)
        .neq('id', id)
        .single()

      if (duplicateSlug) {
        return NextResponse.json(
          { error: 'A product with this URL slug already exists' },
          { status: 409 }
        )
      }
    }

    // Update the product
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Database update error:', updateError)
      return NextResponse.json(
        { error: 'Database error occurred while updating product' },
        { status: 500 }
      )
    }

    console.log('✅ Product updated successfully:', updatedProduct.name)
    
    return NextResponse.json({
      message: 'Product updated successfully',
      product: updatedProduct
    })

  } catch (error) {
    console.error('❌ Unexpected error during product update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('📖 Fetching product with ID:', id)
    
    const supabase = await createClient()
    
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !product) {
      console.error('❌ Product not found:', error)
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    console.log('✅ Product fetched successfully:', product.name)
    
    return NextResponse.json({
      product
    })

  } catch (error) {
    console.error('❌ Unexpected error during product fetch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🗑️ Deleting product with ID:', id)
    
    const supabase = await createClient()
    
    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', id)
      .single()

    if (fetchError || !existingProduct) {
      console.error('❌ Product not found:', fetchError)
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Delete the product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('❌ Database delete error:', deleteError)
      return NextResponse.json(
        { error: 'Database error occurred while deleting product' },
        { status: 500 }
      )
    }

    console.log('✅ Product deleted successfully:', existingProduct.name)
    
    return NextResponse.json({
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('❌ Unexpected error during product deletion:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
