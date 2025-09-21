import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: presets, error } = await supabase
      .from('layout_presets')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json({ presets })
  } catch (error) {
    console.error('Error fetching layout presets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch layout presets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, grid_template, flex_template, preset_css } = await request.json()
    
    const supabase = await createClient()
    
    const { data: preset, error } = await supabase
      .from('layout_presets')
      .insert({
        name,
        description,
        grid_template,
        flex_template,
        preset_css,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ preset })
  } catch (error) {
    console.error('Error creating layout preset:', error)
    return NextResponse.json(
      { error: 'Failed to create layout preset' },
      { status: 500 }
    )
  }
}
