import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const labelSize = searchParams.get('labelSize') || '14x7'

    const supabase = await createClient()

    // Get label template for the specified size
    const { data: template, error } = await supabase
      .from('label_templates')
      .select('*')
      .eq('name', `Label ${labelSize}`)
      .single()

    if (error || !template) {
      return NextResponse.json(
        { error: 'Label template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      css: template.css_template || '',
      html: template.html_template || '',
      name: template.name,
      size: labelSize
    })
  } catch (error) {
    console.error('Error in label-css template API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
