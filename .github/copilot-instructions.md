# Next.js Project with Tailwind CSS, shadcn/ui, and Supabase

## Project Setup Checklist

- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify Project Requirements - Next.js with TypeScript, Tailwind CSS, shadcn/ui, Supabase prep
- [x] Scaffold the Project - Created with Next.js CLI
- [x] Customize the Project - Added shadcn/ui, Supabase client, environment setup
- [ ] Install Required Extensions
- [x] Compile the Project - Dependencies installed successfully
- [ ] Create and Run Task
- [ ] Launch the Project
- [x] Ensure Documentation is Complete - README.md updated

## Project Details
- Framework: Next.js 15+ with App Router and TypeScript
- Styling: Tailwind CSS v4
- Components: shadcn/ui (initialized with Neutral base color)
- Database: Supabase client configured
- Features: ESLint, empty homepage, src directory structure
- Environment: .env.local setup with Supabase placeholders

## Project Structure Complete
- `src/app/` - App Router with blank homepage
- `src/lib/` - Utilities including Supabase client
- `src/components/` - Ready for shadcn/ui components
- Environment variables configured for Supabase
- TypeScript and ESLint configured

## Database Schema

**Current Schema Documentation**: [LIVE_DATABASE_SCHEMA.md](../LIVE_DATABASE_SCHEMA.md)  
**Last Updated**: September 23, 2025 (Live Production Analysis)  
**Status**: ✅ Production-Verified with Live Data

### Schema Overview
- **9 Tables**: 7 active with data, 2 ready for expansion  
- **1,337 Total Records**: Products (259), Categories (36), Pictograms (22), Relationships (499), Templates (2), Labels (518), Individual Templates (1)
- **Multi-language**: English, French, Spanish support
- **Label System**: Base templates + individual CSS customizations
- **PDF Generation**: ✅ Functional (Puppeteer + Chrome)

### Key Tables
- **`products`** (259 records) - Core product catalog with 56 columns
- **`categories`** (36 records) - Product hierarchy and classification  
- **`pictograms`** (22 records) - GHS safety symbols
- **`product_pictograms`** (499 records) - Product-to-pictogram relationships
- **`label_templates`** (2 records) - Base templates (14x7", 5x9")
- **`individual_label_templates`** (1 record) - Product-specific CSS overrides
- **`product_labels`** (518 records) - Generated label cache

### Label Editor System
The new label editor (`/src/app/new-label-editor/`) works with:
1. **Base Templates**: `label_templates.css_template` (default styling)
2. **Individual Overrides**: `individual_label_templates.css_overrides` (product-specific)
3. **Hierarchy**: Individual CSS → Base CSS → Default CSS (fallback)

For complete schema details, foreign keys, relationships, and sample data, see the comprehensive documentation.

### ⚠️ CRITICAL DATABASE MAINTENANCE PROTOCOL

**IMPORTANT**: The database schema documentation MUST be kept current with any database changes. 

#### Required Actions When Database Changes:
1. **Immediately run**: `node database-extractor.js` after any database modifications
2. **Update this section** in copilot-instructions.md with new table counts and key changes
3. **Delete outdated files**: Remove any old database documentation files that conflict with LIVE_DATABASE_SCHEMA.md
4. **Files to maintain as single source of truth**:
   - `LIVE_DATABASE_SCHEMA.md` (automatically generated - primary reference)
   - This section in `copilot-instructions.md` (manual summary updates)

#### Files to Ignore/Delete When Outdated:
- `DATABASE_SCHEMA.md` (static, becomes outdated)
- `docs/database-schema-complete.md` (static, becomes outdated)  
- Any SQL files in `/database/` folder that don't reflect current state
- Old JavaScript test files that query outdated schema
- Any `.csv` files with old data exports

#### Quick Commands:
```bash
# Extract current database schema
npm run extract-schema

# Update documentation (includes extraction)
npm run update-docs
```

#### Automation Setup:
- Run `database-extractor.js` weekly or after major database changes
- The script generates timestamp tracking in `.db-extract-timestamp`
- Always verify the extraction succeeded before relying on the documentation

**The goal is to maintain LIVE_DATABASE_SCHEMA.md as the single, authoritative, always-current source of database truth.**

