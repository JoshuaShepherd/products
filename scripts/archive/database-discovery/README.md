# Database Discovery Scripts Archive

## Purpose
Scripts and utilities used during database discovery and setup phases of development.

## ⚠️ Status: HISTORICAL REFERENCE ONLY
**DO NOT use these files for development.**

## 🎯 Current/Authoritative Files
For active development, use:
- **docs/canonical-database-schema-2025-09-08.md** ← Primary reference
- **docs/canonical-schema-dump-2025-09-08.sql** ← Complete SQL schema
- **src/lib/database.types.ts** ← Current types

## Files in This Archive

### `setup_database.mjs`
- **Purpose:** Database setup and configuration script
- **Original Location:** Project root directory
- **Type:** Node.js module (ESM)
- **Content:** Database initialization, connection testing, schema setup
- **Status:** Functionality superseded by canonical schema and Supabase CLI tools

## Historical Context
This script was created during the initial database setup phase to automate database configuration, connection testing, and schema initialization. It provided a programmatic way to bootstrap the database environment during development.

## What This Script Achieved
- **Database Initialization:** Automated initial database setup procedures
- **Connection Validation:** Tested database connectivity and credentials
- **Schema Bootstrap:** Applied initial schema structure programmatically
- **Development Workflow:** Streamlined database setup for development environments

## Why This Script Was Archived
- **Supabase CLI Integration:** Database operations now handled via official Supabase CLI
- **Canonical Schema:** Database structure now defined in authoritative SQL files
- **Production Process:** Database management moved to proper deployment workflows
- **Tool Consolidation:** Eliminated custom scripts in favor of standard tools

## Modern Equivalents
The functionality previously provided by this script is now handled by:

```bash
# Database connection and type generation
supabase gen types typescript --linked > src/lib/database.types.ts

# Schema management
supabase db dump --linked --file schema.sql

# Database status and validation
supabase status
```

## Recovery Information
If functionality from this script is needed:
1. **Check Supabase CLI** - Most database operations now available via CLI
2. **Reference canonical schema** - Schema structure definitively documented
3. **Use proper deployment tools** - Avoid custom database setup scripts
4. **Follow current workflow** - Use established database management procedures

## Migration Notes
- Database initialization now handled through Supabase dashboard and CLI
- Schema changes managed through migration files in `database/` directory
- Type generation automated via Supabase CLI tools
- Connection management handled by Supabase client libraries

---
**Archive Date:** September 8, 2025  
**Canonical Reference:** docs/canonical-database-schema-2025-09-08.md  
**Replaced By:** Supabase CLI tools and canonical schema documentation
