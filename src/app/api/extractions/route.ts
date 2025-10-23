import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const filePath = searchParams.get('filePath');
    const limit = Number(searchParams.get('limit') ?? 20);

    let query = supabase
      .from('extraction_runs')
      .select(`
        id,
        product_candidate,
        product_id,
        document_type,
        source_file_path,
        confidence,
        needs_manual_review,
        status,
        error,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (filePath) {
      query = query.eq('source_file_path', filePath);
    }

    const { data: rows, error } = await query;

    if (error) {
      console.error('Error fetching extraction runs:', error);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }

    return NextResponse.json({ rows: rows || [] });
  } catch (error) {
    console.error('Error in extractions endpoint:', error);
    return NextResponse.json({ error: 'internal_server_error' }, { status: 500 });
  }
}
