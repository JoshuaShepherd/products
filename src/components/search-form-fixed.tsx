import { Search } from "lucide-react"
import { useState, useEffect, useRef } from "react"

import { Label } from "@/components/ui/label"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "@/components/ui/sidebar"

// Interface for the transformed API response from /api/product-titles
interface ProductTitle {
  id: string;
  name: string;
  subtitle_1: string | null;
  subtitle_2: string | null;
  sku: string | null;
  description: string | null;
  short_description_english: string | null;
  category: string | null;
}

export function SearchForm({ onSelectProduct, ...props }: { onSelectProduct: (title: string) => void } & React.ComponentProps<"form">) {
  const [allProducts, setAllProducts] = useState<ProductTitle[]>([])
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<ProductTitle[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Fetch all product data
    fetch("/api/product-titles")
      .then(res => res.json())
      .then(data => setAllProducts(data.products || []))
  }, [])

  useEffect(() => {
    if (query.length > 0) {
      const queryLower = query.toLowerCase();
      
      // Filter and sort products: prioritize those that start with the query
      const filtered = allProducts
        .filter(product =>
          product.name?.toLowerCase().includes(queryLower)
        )
        .sort((a, b) => {
          const aTitle = a.name?.toLowerCase() || '';
          const bTitle = b.name?.toLowerCase() || '';
          
          // Prioritize exact matches first
          if (aTitle === queryLower && bTitle !== queryLower) return -1;
          if (bTitle === queryLower && aTitle !== queryLower) return 1;
          
          // Then prioritize those that start with the query
          const aStarts = aTitle.startsWith(queryLower);
          const bStarts = bTitle.startsWith(queryLower);
          
          if (aStarts && !bStarts) return -1;
          if (bStarts && !aStarts) return 1;
          
          // Finally sort alphabetically
          return aTitle.localeCompare(bTitle);
        })
        .slice(0, 10); // show top 10 matches
      
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, allProducts])

  return (
    <form
      autoComplete="off"
      {...props}
      className="relative"
      onSubmit={e => {
        e.preventDefault()
        if (suggestions.length > 0) {
          onSelectProduct(suggestions[0].name)
          setQuery(suggestions[0].name)
          setShowSuggestions(false)
        }
      }}
    >
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search products
          </Label>
          <SidebarInput
            ref={inputRef}
            id="search"
            placeholder="Search products..."
            className="pl-8"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => query && setShowSuggestions(true)}
            onBlur={() => {
              // Delay hiding to allow click events on suggestions
              setTimeout(() => setShowSuggestions(false), 150)
            }}
          />
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-sidebar-background border border-sidebar-border rounded-md shadow-lg max-h-60 overflow-y-auto">
              <ul className="py-1">
              {suggestions.map((product) => {
                const displayName = (product.name || 'Unnamed Product') +
                  (product.subtitle_1 ? ` - ${product.subtitle_1}` : '') +
                  (product.subtitle_2 ? ` - ${product.subtitle_2}` : '');
                
                return (
                  <li
                    key={`${product.id}-${product.name || 'unnamed'}`}
                    className="px-2 py-1 text-sm cursor-pointer hover:bg-sidebar-accent rounded-sm"
                    onClick={() => {
                      setQuery(product.name || '')
                      setShowSuggestions(false)
                      onSelectProduct(product.name || '')
                    }}
                  >
                    <div className="font-medium text-sidebar-foreground">{displayName}</div>
                    {product.description && (
                      <div className="text-xs text-sidebar-foreground/70 mt-0.5">
                        {product.description.length > 80 
                          ? `${product.description.substring(0, 80)}...` 
                          : product.description
                        }
                      </div>
                    )}
                  </li>
                )
              })}
              </ul>
            </div>
          )}
          
          {showSuggestions && query && suggestions.length === 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-sidebar-background border border-sidebar-border rounded-md shadow-lg">
              <div className="px-2 py-3 text-sm text-sidebar-foreground/70 text-center">
                No products found matching "{query}"
              </div>
            </div>
          )}
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  )
}
