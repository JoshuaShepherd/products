# API Standardization & Legacy Field Migration Guide

**Updated:** September 8, 2025  
**Status:** 🔄 Migration in Progress  
**Impact:** All components using product data

## Overview

The product API system has been standardized to eliminate the legacy `Title` field mapping inconsistencies and provide a unified approach to product data access.

## Changes Made

### 1. Enhanced `/api/product` Endpoint

The `/api/product` endpoint now supports two response formats:

**Canonical Format (Recommended):**
```typescript
// GET /api/product?format=canonical
// GET /api/product?title=ProductName&format=canonical

// Returns: Product[] or { product: Product }
// Uses actual database field names (name, short_description_english, etc.)
```

**Legacy Format (Backward Compatibility):**
```typescript
// GET /api/product (default)
// GET /api/product?title=ProductName

// Returns: { products: LegacyProduct[] } or { product: LegacyProduct }
// Uses transformed field names (Title, "Short Description English", etc.)
```

### 2. New ProductAPI Utility Class

Created `/src/lib/product-api.ts` with standardized methods:

```typescript
import { ProductAPI, Product } from '@/lib/product-api'

// Canonical methods (recommended)
const product = await ProductAPI.getProduct(title)
const products = await ProductAPI.getProducts()

// Legacy methods (for migration)
const legacyProduct = await ProductAPI.getLegacyProduct(title)
const legacyProducts = await ProductAPI.getLegacyProducts()

// Format conversion utilities
const legacy = ProductAPI.toLegacyFormat(canonicalProduct)
const canonical = ProductAPI.fromLegacyFormat(legacyProduct)
```

### 3. Components Updated

#### ✅ Fully Migrated to Canonical Format
- **New Label Editor** (`/src/app/new-label-editor/page.tsx`)
  - Uses `ProductAPI.getProducts()` 
  - Uses canonical `Product` type from database
  - Accesses `product.name` instead of `product.Title`

#### ⚠️ Still Using Legacy Format (Migration Pending)
- **FieldViewer** (`/src/components/FieldViewer.tsx`)
  - Uses complex field name mapping
  - Expects `product.Title` transformed field
  - **Migration needed**

- **ProductPanel** (`/src/components/ProductPanel.tsx`)
  - Displays `product.Title`
  - **Migration needed**

- **ProductOverview** (`/src/components/ProductOverview.tsx`)
  - Navigation uses `product.Title`
  - **Migration needed**

- **Bulk Import** (`/src/app/products/bulk-import/page.tsx`)
  - Displays `product.Title` in results
  - **Migration needed**

## Migration Strategy

### For New Components
**✅ Use canonical format from the start:**

```typescript
import { ProductAPI, Product } from '@/lib/product-api'

function NewComponent() {
  const [products, setProducts] = useState<Product[]>([])
  
  useEffect(() => {
    ProductAPI.getProducts().then(setProducts)
  }, [])
  
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div> // Use .name, not .Title
      ))}
    </div>
  )
}
```

### For Existing Components
**🔄 Gradual migration approach:**

```typescript
// Phase 1: Add dual support
import { ProductAPI, Product, LegacyProduct } from '@/lib/product-api'

function ExistingComponent() {
  const [product, setProduct] = useState<Product | LegacyProduct | null>(null)
  const [useCanonical, setUseCanonical] = useState(false) // Feature flag
  
  useEffect(() => {
    if (useCanonical) {
      ProductAPI.getProduct(title).then(setProduct)
    } else {
      ProductAPI.getLegacyProduct(title).then(setProduct)
    }
  }, [title, useCanonical])
  
  // Safe field access
  const productName = useCanonical 
    ? (product as Product)?.name 
    : (product as LegacyProduct)?.Title
  
  return <div>{productName}</div>
}

// Phase 2: Remove legacy support
function MigratedComponent() {
  const [product, setProduct] = useState<Product | null>(null)
  
  useEffect(() => {
    ProductAPI.getProduct(title).then(setProduct)
  }, [title])
  
  return <div>{product?.name}</div> // Clean canonical access
}
```

## Field Name Reference

| Database Field | Legacy API Field | Canonical API Field |
|----------------|------------------|-------------------|
| `name` | `Title` | `name` |
| `short_description_english` | `"Short Description English"` | `short_description_english` |
| `components_determining_hazard` | `"Components Determining Hazard"` | `components_determining_hazard` |
| `signal_word` | `"Signal Word"` | `signal_word` |
| `do_not_freeze` | `"Do Not Freeze"` (string) | `do_not_freeze` (boolean) |

## Benefits of Migration

### ✅ Schema Consistency
- Field names match database exactly
- No transformation layer confusion
- TypeScript type safety with database types

### ✅ Reduced Complexity
- Eliminates field name mapping tables
- Reduces cognitive load for developers
- Unified data access patterns

### ✅ Better Performance
- No runtime field transformations
- Smaller API responses (no duplicate field names)
- More efficient database queries

### ✅ Future-Proof
- Direct database schema alignment
- Easier to maintain and extend
- Consistent with new components

## Migration Checklist

### Components to Migrate
- [ ] `/src/components/FieldViewer.tsx`
- [ ] `/src/components/ProductPanel.tsx` 
- [ ] `/src/components/ProductOverview.tsx`
- [ ] `/src/app/products/bulk-import/page.tsx`
- [ ] `/src/components/CSSLiveEditor.tsx` (partially canonical)
- [ ] `/src/app/page.tsx` (homepage)

### Testing Strategy
1. **Dual Support Phase**: Add canonical support alongside legacy
2. **Feature Flag**: Use environment variable to toggle between formats
3. **Gradual Rollout**: Migrate one component at a time
4. **Validation**: Ensure UI behavior remains identical
5. **Cleanup**: Remove legacy code once all components migrated

## Breaking Changes

### ⚠️ For Components Using Legacy Format
When migrating to canonical format, these changes are required:

```typescript
// OLD (Legacy)
product.Title → product.name
product["Short Description English"] → product.short_description_english
product["Do Not Freeze"] === "true" → product.do_not_freeze === true

// NEW (Canonical)
// Use actual database field names and types
```

### ⚠️ For API Consumers
Components must explicitly request canonical format:

```typescript
// OLD
fetch('/api/product')

// NEW
fetch('/api/product?format=canonical')
// OR use ProductAPI utility
ProductAPI.getProducts()
```

## Backward Compatibility

### ✅ Maintained
- Legacy `/api/product` format still works (default behavior)
- Existing components continue to function
- No immediate breaking changes

### 🔄 Gradual Deprecation Plan
1. **Phase 1** (Current): Dual support with canonical format available
2. **Phase 2** (Next): Deprecation warnings for legacy format usage
3. **Phase 3** (Future): Remove legacy transformation code

## Support

For questions about migration:
- Check this guide for field name mappings
- Use `ProductAPI` utility for standardized access
- Test with both formats during migration
- Refer to New Label Editor as canonical implementation example

---

**Migration Status**: 1/6 components fully migrated to canonical format  
**Next Priority**: FieldViewer component (highest impact)  
**Timeline**: Complete migration by end of Sprint 2025-09-15
