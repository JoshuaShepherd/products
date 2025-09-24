# Database Schema Extractor

This script automatically extracts the complete database schema and data from the SpecChem Products Supabase database and generates comprehensive documentation.

## Quick Start

```bash
# Extract current database schema
npm run extract-schema

# Or run directly
node database-extractor.js
```

## Output

- **LIVE_DATABASE_SCHEMA.md** - Comprehensive database documentation
- **.db-extract-timestamp** - Timestamp of last extraction for tracking

## Features

- ✅ Live data analysis and schema inference
- ✅ Table relationships and foreign key detection
- ✅ Sample data and record counts
- ✅ Comprehensive documentation generation
- ✅ Timestamp tracking for change monitoring

## Maintenance Protocol

### When Database Changes:
1. **Run extraction**: `npm run extract-schema`
2. **Review output**: Check `LIVE_DATABASE_SCHEMA.md` for accuracy
3. **Update instructions**: Modify `.github/copilot-instructions.md` with summary changes
4. **Clean outdated files**: Remove any conflicting documentation

### Files to Maintain:
- ✅ `LIVE_DATABASE_SCHEMA.md` (auto-generated, primary source)
- ✅ `.github/copilot-instructions.md` (manual summary)

### Files to Delete When Outdated:
- ❌ `DATABASE_SCHEMA.md`
- ❌ `docs/database-schema-complete.md`
- ❌ Old `.csv` exports in `/public/data/`
- ❌ Outdated test files that reference old schema

## Environment Requirements

Requires `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Automation

Consider setting up:
- Weekly automated runs
- Git hooks for database migrations
- CI/CD integration for documentation updates

---

**Goal**: Maintain `LIVE_DATABASE_SCHEMA.md` as the single, authoritative, always-current source of database truth.