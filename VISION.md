# TidyFactor Vision

This skill is part of the **TidyFactor Ecosystem**.

The TidyFactor Vision is maintained as the single source of truth at the Skills-LAB level:

👉 **[Read the full TidyFactor Vision](../TidyFactor-VISION.md)**

---

## TidyFactor-Next — Track Summary

**TidyFactor-Next** is the official production-grade Next.js 16, React 19, TypeScript strict, and Supabase multi-tenant SaaS architecture track within the TidyFactor ecosystem.

It provides unbreakable tenant data isolation, RLS policy generation, custom JWT claims authentication, fail-closed edge resolution, and an evidence-based Development Performance & Resource Optimization engine.

### How this track fits the TidyFactor vision

| TidyFactor Principle | How Next.js Track Delivers It |
|---|---|
| **Structure over Complexity** | Shared schema with `tenant_id` + Postgres RLS—zero multi-DB connection pooling hell. |
| **Evidence-First Quality** | Development performance optimization requires diagnostic baseline, confidence rating, and DELTA benchmarking. |
| **Zero Data Leak Guarantee** | Security boundary enforced at the database engine; application bugs cannot leak Tenant A data to Tenant B. |
| **Pluggable Query Layer** | Choice of Supabase JS client, Drizzle ORM, or Prisma made once during `init` and locked in `ARCHITECTURE.md`. |
| **Fail-Closed Resolution** | Edge middleware fails closed (404/403) on unresolved tenant identity—never falling back to default tenant. |
