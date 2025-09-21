/**
 * API Standardization Demo Component
 * 
 * This component demonstrates the difference between legacy and canonical API formats
 * and serves as a reference for developers migrating their components.
 */

'use client';

import { useState, useEffect } from 'react';
import { ProductAPI, Product, LegacyProduct } from '@/lib/product-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function APIStandardizationDemo() {
  const [canonicalProducts, setCanonicalProducts] = useState<Product[]>([]);
  const [legacyProducts, setLegacyProducts] = useState<LegacyProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFormat, setActiveFormat] = useState<'canonical' | 'legacy'>('canonical');

  const loadCanonicalData = async () => {
    setLoading(true);
    try {
      const products = await ProductAPI.getProducts();
      setCanonicalProducts(products.slice(0, 3)); // Show first 3 for demo
    } catch (error) {
      console.error('Failed to load canonical products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLegacyData = async () => {
    setLoading(true);
    try {
      const data = await ProductAPI.getLegacyProducts();
      setLegacyProducts(data.products.slice(0, 3)); // Show first 3 for demo
    } catch (error) {
      console.error('Failed to load legacy products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeFormat === 'canonical') {
      loadCanonicalData();
    } else {
      loadLegacyData();
    }
  }, [activeFormat]);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">API Standardization Demo</h1>
        <p className="text-gray-600">
          Compare legacy transformed data vs canonical database schema data
        </p>
      </div>

      {/* Format Toggle */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={activeFormat === 'canonical' ? 'default' : 'outline'}
          onClick={() => setActiveFormat('canonical')}
        >
          Canonical Format ✅
        </Button>
        <Button
          variant={activeFormat === 'legacy' ? 'default' : 'outline'}
          onClick={() => setActiveFormat('legacy')}
        >
          Legacy Format ⚠️
        </Button>
      </div>

      {/* Data Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Data Structure
              <Badge variant={activeFormat === 'canonical' ? 'default' : 'secondary'}>
                {activeFormat}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeFormat === 'canonical' ? (
              <div className="space-y-2">
                <div className="text-sm font-mono bg-green-50 p-2 rounded">
                  <strong>Canonical Format:</strong>
                  <br />• Uses actual database field names
                  <br />• TypeScript type: <code>Product</code>
                  <br />• Boolean fields are actual booleans
                  <br />• Matches database schema exactly
                </div>
                <div className="text-xs text-gray-600">
                  Fields: id, name, short_description_english, signal_word, do_not_freeze (boolean)
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm font-mono bg-orange-50 p-2 rounded">
                  <strong>Legacy Format:</strong>
                  <br />• Uses transformed "friendly" names
                  <br />• TypeScript type: <code>LegacyProduct</code>
                  <br />• Boolean fields are strings ("true"/"false")
                  <br />• Requires field mapping tables
                </div>
                <div className="text-xs text-gray-600">
                  Fields: ID, Title, "Short Description English", "Signal Word", "Do Not Freeze" (string)
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Code Example */}
        <Card>
          <CardHeader>
            <CardTitle>Code Example</CardTitle>
          </CardHeader>
          <CardContent>
            {activeFormat === 'canonical' ? (
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
{`// ✅ Canonical (Recommended)
import { ProductAPI, Product } from '@/lib/product-api'

const products = await ProductAPI.getProducts()
const product: Product = products[0]

// Direct database field access
console.log(product.name)
console.log(product.short_description_english)
console.log(product.do_not_freeze) // boolean`}</pre>
            ) : (
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
{`// ⚠️ Legacy (For Migration)
import { ProductAPI, LegacyProduct } from '@/lib/product-api'

const data = await ProductAPI.getLegacyProducts()
const product: LegacyProduct = data.products[0]

// Transformed field access
console.log(product.Title)
console.log(product["Short Description English"])
console.log(product["Do Not Freeze"]) // string`}</pre>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Data Examples */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Sample Product Data</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-4">
              {activeFormat === 'canonical' 
                ? canonicalProducts.map((product, index) => (
                    <div key={product.id} className="border-l-4 border-green-500 pl-4">
                      <div className="font-semibold text-green-700">Product {index + 1} (Canonical)</div>
                      <div className="text-sm space-y-1">
                        <div><strong>name:</strong> {product.name}</div>
                        <div><strong>short_description_english:</strong> {product.short_description_english || 'null'}</div>
                        <div><strong>signal_word:</strong> {product.signal_word || 'null'}</div>
                        <div><strong>do_not_freeze:</strong> {String(product.do_not_freeze)} (boolean)</div>
                        <div><strong>id:</strong> {product.id}</div>
                      </div>
                    </div>
                  ))
                : legacyProducts.map((product, index) => (
                    <div key={product.ID} className="border-l-4 border-orange-500 pl-4">
                      <div className="font-semibold text-orange-700">Product {index + 1} (Legacy)</div>
                      <div className="text-sm space-y-1">
                        <div><strong>Title:</strong> {product.Title}</div>
                        <div><strong>"Short Description English":</strong> {product["Short Description English"] || 'null'}</div>
                        <div><strong>"Signal Word":</strong> {product["Signal Word"] || 'null'}</div>
                        <div><strong>"Do Not Freeze":</strong> {product["Do Not Freeze"]} (string)</div>
                        <div><strong>ID:</strong> {product.ID}</div>
                      </div>
                    </div>
                  ))
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Migration Guide */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Migration Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">✅ Canonical Advantages</h4>
              <ul className="text-sm space-y-1">
                <li>• Direct database schema alignment</li>
                <li>• TypeScript type safety</li>
                <li>• No transformation overhead</li>
                <li>• Consistent field naming</li>
                <li>• Future-proof architecture</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-orange-700 mb-2">⚠️ Legacy Issues</h4>
              <ul className="text-sm space-y-1">
                <li>• Field name inconsistencies</li>
                <li>• Runtime transformation costs</li>
                <li>• Complex mapping tables required</li>
                <li>• Type safety violations</li>
                <li>• Developer confusion</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
