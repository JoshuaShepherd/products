import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supabase = await createClient()
    
    const { data: template, error } = await supabase
      .from('label_templates')
      .select(`
        *,
        label_template_versions(
          id,
          version_number,
          html_template,
          css_template,
          is_published,
          created_at,
          change_notes
        ),
        template_css_variables(
          variable_name,
          variable_value,
          variable_type
        )
      `)
      .eq('id', resolvedParams.id)
      .single()

    if (error) throw error

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { error: 'Template not found' },
      { status: 404 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { html_template, css_template, css_variables, change_notes } = await request.json()
    const resolvedParams = await params
    
    const supabase = await createClient()
    
    // Get current version number
    const { data: currentVersions, error: versionError } = await supabase
      .from('label_template_versions')
      .select('version_number')
      .eq('template_id', resolvedParams.id)
      .order('version_number', { ascending: false })
      .limit(1)

    if (versionError) throw versionError

    const nextVersion = (currentVersions[0]?.version_number || 0) + 1

    // Create new version
    const { data: version, error: newVersionError } = await supabase
      .from('label_template_versions')
      .insert({
        template_id: resolvedParams.id,
        version_number: nextVersion,
        html_template,
        css_template,
        is_published: false,
        change_notes: change_notes || `Version ${nextVersion}`
      })
      .select()
      .single()

    if (newVersionError) throw newVersionError

    // Update CSS variables if provided
    if (css_variables && css_variables.length > 0) {
      // Delete existing variables
      await supabase
        .from('template_css_variables')
        .delete()
        .eq('template_id', resolvedParams.id)

      // Insert new variables
      const variablesToInsert = css_variables.map((variable: any) => ({
        template_id: resolvedParams.id,
        variable_name: variable.name,
        variable_value: variable.value,
        variable_type: variable.type || 'custom'
      }))

      const { error: variablesError } = await supabase
        .from('template_css_variables')
        .insert(variablesToInsert)

      if (variablesError) throw variablesError
    }

    return NextResponse.json({ version })
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
}
