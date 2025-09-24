import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    
    let query = supabase
      .from('label_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // If slug is provided, filter by slug
    if (slug) {
      query = query.eq('slug', slug)
    }

    const { data: templates, error } = await query

    if (error) throw error

    // Return templates directly as an array (not wrapped in object)
    return NextResponse.json(templates || [])
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, width_mm, height_mm, html_template, css_template } = await request.json()
    
    const supabase = await createClient()
    
    // Create template
    const { data: template, error: templateError } = await supabase
      .from('label_templates')
      .insert({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        width_mm: parseFloat(width_mm),
        height_mm: parseFloat(height_mm),
        html_template,
        css_template,
        is_active: true
      })
      .select()
      .single()

    if (templateError) throw templateError

    // Create initial version
    const { data: version, error: versionError } = await supabase
      .from('label_template_versions')
      .insert({
        template_id: template.id,
        version_number: 1,
        html_template,
        css_template,
        is_published: true,
        change_notes: 'Initial version'
      })
      .select()
      .single()

    if (versionError) throw versionError

    return NextResponse.json({ template, version })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
