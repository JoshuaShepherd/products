# Individual SQL Files Archive

## Purpose
Individual SQL files that were previously scattered throughout the project and have been superseded by the canonical schema.

## ⚠️ Status: HISTORICAL REFERENCE ONLY
**DO NOT use these files for development.**

## 🎯 Current/Authoritative Files
For active development, use:
- **docs/canonical-database-schema-2025-09-08.md** ← Primary reference
- **docs/canonical-schema-dump-2025-09-08.sql** ← Complete consolidated SQL schema
- **src/lib/database.types.ts** ← Current types

## Files in This Archive

### `import_products.sql`
- **Purpose:** Product data import script
- **Original Location:** Project root directory
- **Content:** SQL commands for importing product data
- **Status:** Functionality consolidated into canonical schema

### `insert_label_templates.sql`
- **Purpose:** Label template setup script
- **Original Location:** Project root directory  
- **Content:** Template insertion and configuration SQL
- **Status:** Template structure documented in canonical schema

### `increase_css_column.sql`
- **Purpose:** Database column modification script
- **Original Location:** Project root directory
- **Content:** ALTER TABLE commands for CSS column adjustments
- **Status:** Column definitions included in canonical schema

## Historical Context
These individual SQL files were created during iterative database development, addressing specific needs as they arose. Each file served a particular purpose in the database evolution process, from data import to schema modifications.

## What These Files Achieved
- **Data Import:** Populated initial product catalog data
- **Template Setup:** Established label template system foundation
- **Schema Evolution:** Applied necessary column and constraint modifications
- **Development Support:** Enabled rapid prototyping and testing

## Why These Files Were Archived
- **Consolidation:** All SQL definitions now unified in canonical schema
- **Single Source of Truth:** Eliminated fragmented SQL across multiple files
- **Maintenance Reduction:** No longer need to track multiple SQL files for schema understanding
- **Version Control:** Canonical schema provides authoritative, versioned SQL structure

## Migration to Canonical Schema
All functionality from these files has been incorporated into:
- **`docs/canonical-schema-dump-2025-09-08.sql`** - Complete table structures and constraints
- **Database seed scripts** - Data import functionality moved to `database/seed.sql`
- **Migration system** - Schema changes now handled through proper migration workflow

## Recovery Information
If specific SQL commands from these files are needed:
1. Check canonical schema first - likely already included
2. Reference these archived files for historical context
3. Adapt commands to work with current canonical schema structure
4. Test thoroughly against current database state

---
**Archive Date:** September 8, 2025  
**Canonical Reference:** docs/canonical-database-schema-2025-09-08.sql  
**Migration Status:** All functionality consolidated into canonical schema
