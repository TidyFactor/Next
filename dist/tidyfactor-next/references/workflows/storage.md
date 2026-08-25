# Workflow: storage

Creates and secures tenant-isolated Supabase Storage buckets, upload handlers, and signed URL generators.

---

## Steps

0. **Step 0: CDL Resolution & Brief Check**:
   - Check `.tidyfactor/next-brief.md` for storage security mode (`private-tenant-buckets` vs `signed-urls`).

1. **Bucket Scaffolding**:
   - Define bucket in `supabase/migrations/` with `public: false`.

2. **Scoped Path RLS Policies**:
   - Enforce path structure: `<tenant_id>/<user_id>/<filename>`.
   - Write `storage.objects` RLS policies ensuring users can only read/write files matching their tenant context:
     ```sql
     CREATE POLICY "Tenant storage access" ON storage.objects
     FOR ALL TO authenticated
     USING (bucket_id = '<bucket>' AND (storage.foldername(name))[1] = (auth.jwt() ->> 'tenant_id'));
     ```

3. **Pre-Emit Self-Critique**:
   - `/* Pre-emit critique: P5 H5 E5 S5 R5 V5 D5 */`

---

## Validation checklist

- [ ] Storage bucket is private by default.
- [ ] RLS policy validates that folder root matches authenticated `tenant_id`.
- [ ] Signed URL expiration is configured for sensitive assets.
- [ ] Pre-emit critique stamp included.
