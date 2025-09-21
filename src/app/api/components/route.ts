import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: components, error } = await supabase
      .from('template_components')
      .select('*')
      .eq('is_active', true)
      .order('component_type', { ascending: true })

    if (error) throw error

    return NextResponse.json({ components })
  } catch (error) {
    console.error('Error fetching components:', error)
    return NextResponse.json(
      { error: 'Failed to fetch components' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, component_type, html_template, css_template } = await request.json()
    
    const supabase = await createClient()
    
    const { data: component, error } = await supabase
      .from('template_components')
      .insert({
        name,
        component_type,
        html_template,
        css_template,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ component })
  } catch (error) {
    console.error('Error creating component:', error)
    return NextResponse.json(
      { error: 'Failed to create component' },
      { status: 500 }
    )
  }
}
