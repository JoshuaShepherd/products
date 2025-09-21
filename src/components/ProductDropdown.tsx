"use client";

import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Database } from "@/lib/database.types";

type Product = Database['public']['Tables']['products']['Row'];

interface ProductDropdownProps {
  onSelectProduct: (title: string) => void;
  selectedProduct?: string;
  placeholder?: string;
  className?: string;
}

export function ProductDropdown({ 
  onSelectProduct, 
  selectedProduct, 
  placeholder = "Search SpecChem products (type to search or click to browse)...",
  className = ""
}: ProductDropdownProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const fetchProducts = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const url = search ? `/api/product-titles?search=${encodeURIComponent(search)}` : "/api/product-titles";
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all products initially
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      // Show top products when no search term, sorted alphabetically
      return [...products]
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        .slice(0, 25); // Show first 25 products for better initial UX
    }
    
    const search = searchTerm.toLowerCase();
    return products.filter((product: Product) => {
      return (
        product.name?.toLowerCase().includes(search) ||
        product.sku?.toLowerCase().includes(search) ||
        product.description?.toLowerCase().includes(search) ||
        product.short_description_english?.toLowerCase().includes(search) ||
        product.subtitle_1?.toLowerCase().includes(search) ||
        product.subtitle_2?.toLowerCase().includes(search)
      );
    }).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .slice(0, 20); // Limit search results to 20 for better UX
  }, [products, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleProductSelect = (productTitle: string) => {
    onSelectProduct(productTitle);
    setIsOpen(false);
    setSearchTerm("");
  };

  if (loading && products.length === 0) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center space-x-2 p-3 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-md">
          <Search className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            setIsOpen(true);
            if (products.length === 0) {
              fetchProducts();
            }
          }}
          onClick={() => {
            setIsOpen(true);
            if (products.length === 0) {
              fetchProducts();
            }
          }}
          className="pl-10 pr-10 h-12 text-base"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-md shadow-lg max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-neutral-600 mb-2">
              {loading ? "Loading..." : `${filteredProducts.length}${!searchTerm && products.length > filteredProducts.length ? ' of ' + products.length : ''} products ${searchTerm ? `matching "${searchTerm}"` : "available"}`}
            </div>
            
            {!loading && filteredProducts.length === 0 ? (
              <div className="px-2 py-4 text-center text-gray-500 dark:text-gray-400">
                {searchTerm ? (
                  `No products found matching "${searchTerm}"`
                ) : (
                  "No products available"
                )}
              </div>
            ) : loading ? (
              <div className="px-2 py-4 text-center text-gray-500 dark:text-gray-400">
                Loading products...
              </div>
            ) : (
              filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product.name)}
                  className="w-full px-2 py-2 text-left hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {product.name}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {product.sku && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                        {product.sku}
                      </span>
                    )}
                  </div>
                  {(product.subtitle_1 || product.subtitle_2) && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {[product.subtitle_1, product.subtitle_2].filter(Boolean).join(" - ")}
                    </div>
                  )}
                  {product.description && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                      {product.description}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
