import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { title, updates } = await request.json()
    
    if (!title || !updates) {
      return NextResponse.json(
        { error: 'Title and updates are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Update product by title
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('name', title)
      .select()

    if (error) {
      console.error('Error updating product:', error)
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in update-product API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
