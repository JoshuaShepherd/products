# Next.js API Routes Guide: Understanding Your Product Management System

## Table of Contents
1. [How Next.js API Routes Work](#how-nextjs-api-routes-work)
2. [Route Analysis: Your API Endpoints](#route-analysis-your-api-endpoints)
3. [Database Schema Alignment](#database-schema-alignment)

## How Next.js API Routes Work

### The Basics
Next.js API routes are server-side endpoints that run on the backend of your application. They follow a file-based routing system where the file structure determines the URL path.

### File Naming Convention
- **File location**: `src/app/api/[route-name]/route.ts`
- **URL pattern**: `https://yoursite.com/api/[route-name]`
- **Dynamic routes**: Use `[param]` for dynamic segments like `/api/users/[id]`

### HTTP Methods
Each route file exports functions named after HTTP methods:
```typescript
export async function GET(request: NextRequest) { /* ... */ }
export async function POST(request: NextRequest) { /* ... */ }
export async function PUT(request: NextRequest) { /* ... */ }
export async function DELETE(request: NextRequest) { /* ... */ }
```

### Request/Response Pattern
1. **Request**: Comes in with URL parameters, query strings, or JSON body
2. **Processing**: Your code processes the request (usually involving database operations)
3. **Response**: Return JSON data or other content types using `NextResponse`

---

## Route Analysis: Your API Endpoints

### 1. `/api/columns` - Database Schema Inspector
**Purpose**: Provides metadata about your database structure
**HTTP Method**: GET
**What it does in layman's terms**: 
- Takes a peek at your products table to see what columns exist
- Converts technical database names (like `short_description_english`) into human-readable names (like "Short Description English")
- Returns both the original database column names and the prettified versions

**Use case**: Perfect for building dynamic forms or tables where you need to know what fields are available without hardcoding them.

### 2. `/api/product` - Flexible Product Fetcher
**Purpose**: Retrieves either a specific product or all products
**HTTP Method**: GET
**Query Parameters**: `?title=Product Name` (optional)

**What it does in layman's terms**:
- If you give it a title: "Find me the product named X"
- If you don't: "Give me all products"
- Takes the raw database data and transforms it into a format your frontend expects
- Handles multilingual content (English, French, Spanish)

**Data transformation**: Converts snake_case database fields to "Title Case" display names, making the API user-friendly for frontend developers.

### 3. `/api/products` - Simple Product List
**Purpose**: Basic product listing without transformation
**HTTP Method**: GET

**What it does in layman's terms**:
- "Give me all products, exactly as they exist in the database"
- No fancy formatting or data transformation
- Ordered alphabetically by name

**Use case**: When you need raw product data for backend processing or simple displays.

### 4. `/api/product-titles` - Smart Product Search
**Purpose**: Searchable product listing with category information
**HTTP Method**: GET
**Query Parameters**: `?search=search term` (optional)

**What it does in layman's terms**:
- Returns a lightweight version of products (just the essential info for dropdowns/lists)
- Can search across product names, SKUs, and descriptions
- Includes category information by joining with the categories table
- Only shows active products

**Smart features**: 
- Uses PostgreSQL's `ilike` for case-insensitive searching
- Joins with categories table to include category names
- Filters out inactive products automatically

### 5. `/api/update-product` - Product Modifier
**Purpose**: Updates product information
**HTTP Method**: POST
**Body**: `{ "title": "Product Name", "updates": { field: value } }`

**What it does in layman's terms**:
- "Find the product with this name and update these specific fields"
- Only updates the fields you specify, leaves everything else unchanged
- Returns the updated product data to confirm changes

**Safety feature**: Uses title (product name) as the identifier rather than raw database IDs for easier API usage.

### 6. `/api/label/[title]` - Label Generator by Product Name
**Purpose**: Generates printable labels for products using templates
**HTTP Method**: GET
**URL Pattern**: `/api/label/Concrete%20Sealer`
**Query Parameters**: `?size=14x7` or `?size=5x9`

**What it does in layman's terms**:
- "Create a printable label for this specific product"
- Finds the product by name and gets its label template
- Fills in the template with real product data (like a mail merge)
- Handles conditional content (shows/hides sections based on available data)
- Includes safety pictograms if the product has them
- Returns ready-to-print HTML with embedded CSS

**Advanced features**:
- Template variable substitution (`{{product_name}}` becomes "Concrete Sealer")
- Conditional rendering (`{{#if hazard_statements}}...{{/if}}`)
- Multi-language support (English, French, Spanish content)
- Pictogram integration from related tables

### 7. `/api/label/id/[id]` - Label Generator by Product ID
**Purpose**: Same as above but uses product UUID instead of name
**HTTP Method**: GET
**URL Pattern**: `/api/label/id/123e4567-e89b-12d3-a456-426614174000`

**What it does in layman's terms**:
- Identical functionality to the title-based route
- Uses the product's unique ID instead of name
- Better for programmatic access where you already have the product ID

**Why have both?**: 
- Title-based: User-friendly URLs for bookmarking
- ID-based: Reliable for applications (names can change, IDs don't)

### 8. `/api/label-css/template` - Template Asset Provider
**Purpose**: Provides raw label template data
**HTTP Method**: GET
**Query Parameters**: `?labelSize=14x7`

**What it does in layman's terms**:
- "Give me the raw template files for this label size"
- Returns the HTML structure and CSS styles separately
- Useful for template editors or preview functionality

---

## Database Schema Alignment

### Overall Architecture Assessment

Your API routes demonstrate a well-structured approach to database interaction that aligns excellently with your Supabase schema. Here's my analysis:

**Schema Utilization Excellence**:
Your routes make full use of the comprehensive product schema, including multilingual support (English, French, Spanish fields), safety data sheets (SDS) information, and the relational structure with categories, pictograms, and label templates.

**Data Transformation Strategy**:
The system employs a smart dual approach:
1. **Raw data access** (`/api/products`) for backend operations
2. **Transformed data** (`/api/product`) for frontend consumption
This prevents tight coupling between your database schema and UI while maintaining flexibility.

**Relational Data Handling**:
The routes effectively leverage Supabase's relationship features:
- Product-to-category joins in `/api/product-titles`
- Product-to-pictogram relationships in label generation
- Template-to-product associations for dynamic label creation

**Template System Integration**:
The label generation routes (`/api/label/*`) showcase sophisticated integration with your `label_templates` table, implementing a complete mail-merge system that:
- Handles conditional content rendering
- Supports multiple label formats (14x7, 5x9)
- Integrates pictogram relationships
- Processes multilingual content dynamically

**Performance Considerations**:
The API design shows awareness of performance with selective field querying (`select('id, name, subtitle_1...')`) rather than always fetching full records, and appropriate use of database ordering and filtering.

**Areas of Strength**:
1. **Multilingual Support**: Full implementation of English, French, and Spanish content fields
2. **Safety Compliance**: Complete SDS (Safety Data Sheet) field support for chemical products
3. **Template Flexibility**: Dynamic label generation supporting multiple formats and conditional content
4. **Search Functionality**: Intelligent search across multiple fields with case-insensitive matching
5. **Data Integrity**: UUID-based relationships ensuring referential integrity

This API architecture effectively bridges the gap between your comprehensive chemical product database schema and the various client applications that need to consume this data, whether for product management, label printing, or e-commerce functionality.
