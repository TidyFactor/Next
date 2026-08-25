# Workflow: data

Authors multi-tenant database schemas, migrations, indexes, and relations with guaranteed tenant isolation.

---

## Steps

0. **Step 0: CDL Resolution & Brief Check**:
   - Check `.tidyfactor/next-brief.md`. If missing, apply default Query Layer (`supabase-js` or `drizzle`).

1. **Draft Migration**:
   - Create SQL migration file under `supabase/migrations/<timestamp>_<name>.sql`.
   - Ensure every tenant-owned table has:
     ```sql
     tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
     created_at timestamptz DEFAULT now() NOT NULL,
     updated_at timestamptz DEFAULT now() NOT NULL
     ```

2. **Index Tenant Columns**:
   - Add composite indexes on `(tenant_id, id)` and foreign key lookups.

3. **Enable & Force RLS**:
   - Add `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;`
   - Add `ALTER TABLE <table_name> FORCE ROW LEVEL SECURITY;`

4. **Pre-Emit Self-Critique**:
   - Evaluate against 7-axis quality gate:
     `/* Pre-emit critique: P5 H5 E5 S5 R5 V5 D5 */`

---

## Validation checklist

- [ ] `tenant_id` column present with foreign key cascade.
- [ ] Row Level Security is explicitly enabled and forced.
- [ ] Composite index on `tenant_id` exists for fast queries.
- [ ] Pre-emit critique stamp included.
