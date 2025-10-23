create table if not exists extraction_runs (
  id uuid primary key default gen_random_uuid(),
  product_candidate text,
  product_id uuid null,
  document_type text,                 -- TDS | SDS | BOTH | UNKNOWN
  source_file_path text not null,
  raw_text text null,                 -- optional: snapshot from pdftotext
  extracted_json jsonb not null,      -- full agent JSON
  confidence text,                    -- high | medium | low
  needs_manual_review boolean default false,
  status text not null,               -- processed | matched | updated | skipped | failed
  error text null,
  created_at timestamptz default now()
);

-- Add indexes for common queries
create index if not exists idx_extraction_runs_product_id on extraction_runs(product_id);
create index if not exists idx_extraction_runs_status on extraction_runs(status);
create index if not exists idx_extraction_runs_created_at on extraction_runs(created_at);
create index if not exists idx_extraction_runs_document_type on extraction_runs(document_type);
