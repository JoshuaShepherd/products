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
