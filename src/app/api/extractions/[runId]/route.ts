import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(_req: Request, { params }: { params: { runId: string }}) {
  try {
    const { data: run, error } = await supabase
      .from('extraction_runs')
      .select(`
        *,
        audit_log (
          id,
          field,
          old_value,
          new_value,
          action,
          reason,
          created_at
        )
      `)
      .eq('id', params.runId)
      .single();

    if (error) {
      console.error('Error fetching extraction run:', error);
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    if (!run) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    return NextResponse.json(run);
  } catch (error) {
    console.error('Error in extraction run endpoint:', error);
    return NextResponse.json({ error: 'internal_server_error' }, { status: 500 });
  }
}
