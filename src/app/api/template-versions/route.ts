import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      template_id,
      version_number,
      html_template,
      css_template,
      is_published = false,
      change_notes
    } = body;

    // Validate required fields
    if (!template_id || !html_template || !css_template) {
      return NextResponse.json(
        { error: 'Missing required fields: template_id, html_template, css_template' },
        { status: 400 }
      );
    }

    const supabase = await createClient()

    // Insert new template version
    const { data, error } = await supabase
      .from('label_template_versions')
      .insert({
        template_id,
        version_number,
        html_template,
        css_template,
        is_published,
        change_notes: change_notes || 'Visual editor update'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create template version' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const template_id = searchParams.get('template_id');

    const supabase = await createClient()

    let query = supabase
      .from('label_template_versions')
      .select('*')
      .order('version_number', { ascending: false });

    if (template_id) {
      query = query.eq('template_id', template_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch template versions' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
