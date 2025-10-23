# SpecChem Product Management System

A comprehensive database-driven product and label management system designed for concrete chemical companies. This system manages hundreds of chemical products with complete safety data, regulatory information, and generates professional labels in multiple formats.

## 🤖 AI Agent System

The system includes a sophisticated AI Agent built with OpenAI's Agent Builder and ChatKit for automated PDF data extraction from Technical Data Sheets (TDS) and Safety Data Sheets (SDS).

**📖 [Complete AI Agent Documentation](./AI_AGENT_SYSTEM_DOCUMENTATION.md)**

### Key Features:
- **PDF Data Extraction**: Automated extraction from TDS/SDS documents
- **Product Matching**: Intelligent matching with existing database entries
- **Data Quality Control**: Confidence scoring and manual review flags
- **Safety Pictogram Processing**: Automatic GHS pictogram identification
- **Multi-language Support**: English, French, and Spanish data extraction

## 🏗️ Architecture Overview

This application is built with a **database-first approach** using a fully normalized PostgreSQL schema to handle complex chemical product data, safety information, and multi-language support.

### Core Database Design

The system uses a sophisticated relational database schema with the following key entities:

- **Products** - Core product information with multi-language support
- **Categories** - Hierarchical product categorization  
- **Pictograms** - Hazard symbols and safety pictograms (22 GHS pictograms)
- **Label Templates** - HTML/CSS templates for different label sizes
- **Product Variants** - Size and packaging variations
- **Application Methods** - Usage instructions and procedures
- **Specifications** - Technical data and test results

## 📊 Database Schema

**Live Documentation**: [LIVE_DATABASE_SCHEMA.md](./LIVE_DATABASE_SCHEMA.md) - Always current, auto-generated database documentation

### Database Extractor Tool

The database schema is automatically documented using our custom extraction tool:

```bash
# Extract current database schema and data
npm run extract-schema

# Extract with documentation update
npm run update-docs
```

This tool:
- ✅ Analyzes live production data
- ✅ Generates comprehensive table documentation  
- ✅ Tracks record counts and relationships
- ✅ Provides sample data for each field
- ✅ Maintains version control with timestamps

### Key Tables

```sql
-- Core Products Table
products (
  id, name, slug, sku, category_id,
  -- Multi-language descriptions
  short_description_english, short_description_french, short_description_spanish,
  -- Technical data
  application, features, coverage, limitations, shelf_life, voc_data,
  -- Safety information
  signal_word, hazard_statements, precautionary_statements, first_aid,
  -- Transportation
  proper_shipping_name, un_number, hazard_class, packing_group,
  -- Special flags
  do_not_freeze, mix_well, green_conscious
)

-- Safety Pictograms
pictograms (id, name, slug, url, description)
product_pictograms (product_id, pictogram_id) -- Many-to-many

-- Categories
categories (id, name, slug, description, parent_id)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository>
   cd products
   npm install
   ```

2. **Environment Setup**
   Create `.env.local`:
   ```bash
   # OpenAI Configuration
   OPENAI_API_KEY=sk-your-api-key-here
   
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Database Setup**
   ```bash
   # Run database migrations
   psql -d your_database -f database/schema.sql
   psql -d your_database -f database/seed.sql
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Test AI Agent**
   - Go to http://localhost:3000
   - Click the database icon (📊) in bottom-right corner
   - Upload a TDS or SDS PDF
   - Review extracted data!

## 📚 Documentation

### Master Documentation

| Document | Status | Description |
|----------|--------|-------------|
| [AI Agent System](./AI_AGENT_SYSTEM_DOCUMENTATION.md) | ✅ Complete | Comprehensive AI agent documentation |
| [System Architecture](./docs/SYSTEM_ARCHITECTURE.md) | 📝 Placeholder | Overall system design and components |
| [Agent Workflow](./docs/AGENT_WORKFLOW.md) | 📝 Placeholder | Step-by-step agent process documentation |
| [Database Schema](./docs/DATABASE_SCHEMA.md) | 📝 Placeholder | Complete database documentation |
| [Error Handling](./docs/ERROR_HANDLING.md) | 📝 Placeholder | Error handling and logging procedures |
| [User Guide](./docs/USER_GUIDE.md) | 📝 Placeholder | User interface and feature guide |
| [Developer Guide](./docs/DEVELOPER_GUIDE.md) | 📝 Placeholder | Technical development documentation |
| [Change Log](./CHANGELOG.md) | 📝 Placeholder | Version history and updates |

### Existing Documentation

- **Database Schema**: `database/schema.sql` - Complete SQL schema
- **Database Documentation**: `docs/database-schema-complete.md` - Detailed table docs
- **Agent Instructions**: `AGENT_BUILDER_INSTRUCTIONS.md` - OpenAI Agent Builder setup
- **CSS Guide**: `docs/CSS_CLEANUP_AND_ORGANIZATION_GUIDE.md` - Label template styling

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: PostgreSQL with Supabase
- **AI**: OpenAI GPT-4o with Agent Builder
- **PDF Processing**: pdftotext, pdf-parse
- **Deployment**: Vercel (recommended)

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run extract-schema  # Extract current database schema
npm run update-docs     # Update documentation

# Utilities
npm run lint            # Run ESLint
npm run setup-puppeteer # Install Puppeteer browsers
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   └── pdf-extract/   # AI agent endpoints
│   ├── products/          # Product management pages
│   └── label-editor/      # Label generation
├── components/            # React components
│   ├── PDFExtractionChatbot.tsx  # AI agent UI
│   └── ProductOverview.tsx       # Product management
├── lib/                   # Utilities and schemas
├── types/                 # TypeScript definitions
└── utils/                 # Helper functions

database/
├── schema.sql            # Database schema
├── seed.sql             # Sample data
└── migrate.sql          # Migration scripts

docs/                     # Documentation
├── archive/             # Archived documentation
└── notes/               # Development notes
```

## 🤝 Contributing

1. **Code Standards**: Follow TypeScript best practices
2. **Database Changes**: Always create migration scripts
3. **Documentation**: Update relevant docs with changes
4. **Testing**: Test AI agent with various PDF types
5. **Error Handling**: Implement comprehensive error handling

## 📈 Performance

- **PDF Processing**: 10-30 seconds per document
- **File Size Limit**: 10MB maximum
- **Database**: Optimized queries with proper indexing
- **Caching**: Implemented for repeated operations

## 🔒 Security

- **File Upload**: Validated file types and sizes
- **API Keys**: Secured environment variables
- **Database**: Row-level security policies
- **Input Validation**: Comprehensive data validation

## 📞 Support

For technical support or questions:
- Review the [AI Agent Documentation](./AI_AGENT_SYSTEM_DOCUMENTATION.md)
- Check the [Developer Guide](./docs/DEVELOPER_GUIDE.md) (when implemented)
- Review existing documentation in the `docs/` directory

---

**Last Updated**: 2025-01-27  
**Version**: 1.0.0  
**Status**: Production Ready