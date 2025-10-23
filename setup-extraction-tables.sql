-- Migration: Create extraction_runs table
-- Run this in your Supabase SQL Editor

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

-- Migration: Create audit_log table
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references extraction_runs(id) on delete cascade,
  product_id uuid null,
  field text not null,
  old_value jsonb,
  new_value jsonb,
  action text not null,               -- write | skip | overwrite
  reason text not null,               -- "db empty", "incoming empty", "lower confidence", etc.
  created_at timestamptz default now()
);

-- Add indexes for common queries
create index if not exists idx_audit_log_run_id on audit_log(run_id);
create index if not exists idx_audit_log_product_id on audit_log(product_id);
create index if not exists idx_audit_log_action on audit_log(action);
create index if not exists idx_audit_log_created_at on audit_log(created_at);

-- Verify tables were created
select 'extraction_runs' as table_name, count(*) as row_count from extraction_runs
union all
select 'audit_log' as table_name, count(*) as row_count from audit_log;
