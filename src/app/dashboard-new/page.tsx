'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, Save, X, Loader2, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTdsProductsQuery, useSdsProductsCompleteQuery, useUpdateTdsProduct, useUpdateSdsProductComplete } from '@/hooks/simplified';
import type { TdsProducts, SdsProductsComplete } from '@/lib/schemas';

interface EditableField {
  key: string;
  label: string;
  value: string | number | null;
  type: 'text' | 'textarea' | 'date';
}

type ProductType = 'tds' | 'sds' | 'both';

interface MatchedProduct {
  productName: string;
  tds?: TdsProducts;
  sds?: SdsProductsComplete;
}

export default function DashboardNew() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<MatchedProduct | null>(null);
  const [productType, setProductType] = useState<ProductType | null>(null);
  const [searchResults, setSearchResults] = useState<MatchedProduct[]>([]);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch TDS and SDS products complete
  const { data: tdsProducts, isLoading: tdsLoading } = useTdsProductsQuery();
  const { data: sdsProducts, isLoading: sdsLoading } = useSdsProductsCompleteQuery();
  
  const isLoading = tdsLoading || sdsLoading;

  // Mutation hooks
  const updateTdsMutation = useUpdateTdsProduct();
  const updateSdsMutation = useUpdateSdsProductComplete();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Combine and filter products by matching productName
  const filteredProducts = useMemo(() => {
    if (isLoading || !debouncedSearchQuery.trim()) {
      return [];
    }

    const query = debouncedSearchQuery.toLowerCase();
    
    // Create maps of products by productName
    const tdsMap = new Map<string, TdsProducts>();
    const sdsMap = new Map<string, SdsProductsComplete>();
    
    (tdsProducts || []).forEach((p: TdsProducts) => {
      if (p.productName?.toLowerCase().includes(query)) {
        tdsMap.set(p.productName, p);
      }
    });
    
    (sdsProducts || []).forEach((p: SdsProductsComplete) => {
      if (p.productName?.toLowerCase().includes(query)) {
        sdsMap.set(p.productName, p);
      }
    });
    
    // Get all unique product names
    const allProductNames = new Set([...tdsMap.keys(), ...sdsMap.keys()]);
    
    // Create matched products
    return Array.from(allProductNames).map((productName): MatchedProduct => {
      const tds = tdsMap.get(productName);
      const sds = sdsMap.get(productName);
      return {
        productName,
        ...(tds && { tds }),
        ...(sds && { sds }),
      } as MatchedProduct;
    });
  }, [debouncedSearchQuery, tdsProducts, sdsProducts, isLoading]);

  // Update search results when filtered products change
  useEffect(() => {
    setSearchResults(filteredProducts);
  }, [filteredProducts]);

  // Handle dropdown visibility
  useEffect(() => {
    if (isSearchFocused && debouncedSearchQuery.trim() && !isLoading) {
      setShowDropdown(true);
    } else if (!isSearchFocused || !debouncedSearchQuery.trim()) {
      setShowDropdown(false);
    }
  }, [isSearchFocused, debouncedSearchQuery, isLoading]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProductSelect = useCallback((match: MatchedProduct) => {
    const type = match.tds && match.sds ? 'both' : match.tds ? 'tds' : 'sds';
    
    setSelectedMatch(match);
    setProductType(type);
    setSearchQuery(match.productName);
    setSearchResults([]);
    setShowDropdown(false);
    setIsSearchFocused(false);
  }, []);

  const handleEditStart = useCallback((field: EditableField) => {
    setEditingField(field.key);
    setEditValue(field.value?.toString() || '');
  }, []);

  const handleEditCancel = useCallback(() => {
    setEditingField(null);
    setEditValue('');
  }, []);

  const handleEditSave = useCallback(async (field: EditableField) => {
    if (!selectedMatch || !productType) return;

    try {
      const updateData = { [field.key]: editValue };

      if (productType === 'tds' && selectedMatch.tds) {
        const productId = selectedMatch.tds.id;
        await updateTdsMutation.mutateAsync({ id: productId, data: updateData });
        // Update local state
        setSelectedMatch({ ...selectedMatch, tds: { ...selectedMatch.tds, [field.key]: editValue } });
      } else if ((productType === 'sds' || productType === 'both') && selectedMatch.sds) {
        const productId = selectedMatch.sds.id;
        await updateSdsMutation.mutateAsync({ id: productId, data: updateData });
        // Update local state
        setSelectedMatch({ ...selectedMatch, sds: { ...selectedMatch.sds, [field.key]: editValue } });
      }

      setEditingField(null);
      setEditValue('');
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  }, [selectedMatch, productType, editValue, updateTdsMutation, updateSdsMutation]);

  const getEditableFields = useCallback((): EditableField[] => {
    if (!selectedMatch) return [];
    
    const fields: EditableField[] = [];
    
    // Add TDS fields if available
    if (selectedMatch.tds) {
      const tds = selectedMatch.tds;
      fields.push(
        { key: 'TDS_SECTION', label: 'TDS Information', value: null, type: 'text' },
        { key: 'productName', label: 'Product Name (TDS)', value: tds.productName, type: 'text' },
        { key: 'category', label: 'Category (TDS)', value: tds.category, type: 'text' },
        { key: 'shortDescription', label: 'Short Description', value: tds.shortDescription, type: 'textarea' },
        { key: 'descriptionFull', label: 'Full Description', value: tds.descriptionFull, type: 'textarea' },
        { key: 'featuresBenefits', label: 'Features & Benefits', value: tds.featuresBenefits, type: 'textarea' },
        { key: 'applicationInstructions', label: 'Application Instructions', value: tds.applicationInstructions, type: 'textarea' },
        { key: 'packagingInfo', label: 'Packaging Info', value: tds.packagingInfo, type: 'textarea' },
        { key: 'shelfLifeStorage', label: 'Shelf Life & Storage', value: tds.shelfLifeStorage, type: 'textarea' },
        { key: 'limitations', label: 'Limitations', value: tds.limitations, type: 'textarea' },
        { key: 'warrantyInfo', label: 'Warranty Info', value: tds.warrantyInfo, type: 'textarea' },
        { key: 'cleanupInstructions', label: 'Cleanup Instructions', value: tds.cleanupInstructions, type: 'textarea' },
        { key: 'documentId', label: 'Document ID', value: tds.documentId, type: 'text' },
      );
    } else {
      fields.push({ key: 'TDS_NOT_FOUND', label: 'TDS Data', value: 'No TDS data found for this product', type: 'text' });
    }
    
    // Add SDS fields if available
    if (selectedMatch.sds) {
      const sds = selectedMatch.sds;
      fields.push(
        { key: 'SDS_SECTION', label: 'SDS Information', value: null, type: 'text' },
        { key: 'productName_sds', label: 'Product Name (SDS)', value: sds.productName, type: 'text' },
        { key: 'category_sds', label: 'Category (SDS)', value: sds.category, type: 'text' },
        { key: 'fileName', label: 'File Name', value: sds.fileName, type: 'text' },
        { key: 'filePath', label: 'File Path', value: sds.filePath, type: 'text' },
        { key: 'tradeName', label: 'Trade Name', value: sds.tradeName, type: 'text' },
        { key: 'synonyms', label: 'Synonyms', value: sds.synonyms, type: 'textarea' },
        { key: 'casNo', label: 'CAS Number', value: sds.casNo, type: 'text' },
        { key: 'productUse', label: 'Product Use', value: sds.productUse, type: 'textarea' },
        { key: 'companyName', label: 'Company Name', value: sds.companyName, type: 'text' },
        { key: 'companyAddress', label: 'Company Address', value: sds.companyAddress, type: 'textarea' },
        { key: 'businessPhone', label: 'Business Phone', value: sds.businessPhone, type: 'text' },
        { key: 'emergencyPhone', label: 'Emergency Phone', value: sds.emergencyPhone, type: 'text' },
        { key: 'signalWord', label: 'Signal Word', value: sds.signalWord, type: 'text' },
        { key: 'hazardStatements', label: 'Hazard Statements', value: sds.hazardStatements, type: 'textarea' },
        { key: 'precautionaryStatements', label: 'Precautionary Statements', value: sds.precautionaryStatements, type: 'textarea' },
        { key: 'healthHazards', label: 'Health Hazards', value: sds.healthHazards, type: 'textarea' },
        { key: 'flammabilityHazards', label: 'Flammability Hazards', value: sds.flammabilityHazards, type: 'textarea' },
        { key: 'reactivityHazards', label: 'Reactivity Hazards', value: sds.reactivityHazards, type: 'textarea' },
        { key: 'environmentalHazards', label: 'Environmental Hazards', value: sds.environmentalHazards, type: 'textarea' },
        { key: 'emergencyOverview', label: 'Emergency Overview', value: sds.emergencyOverview, type: 'textarea' },
        { key: 'compositionIngredients', label: 'Composition Ingredients', value: sds.compositionIngredients, type: 'textarea' },
      );
    } else {
      fields.push({ key: 'SDS_NOT_FOUND', label: 'SDS Data', value: 'No SDS data found for this product', type: 'text' });
    }
    
    return fields;
  }, [selectedMatch]);

  const renderFieldValue = (field: EditableField) => {
    // Handle section headers
    if (field.key.endsWith('_SECTION')) {
      return (
        <div className="text-lg font-bold text-gray-900 mb-2 mt-4">
          {field.label}
        </div>
      );
    }
    
    // Handle "not found" messages
    if (field.key.endsWith('_NOT_FOUND')) {
      return (
        <div className="text-sm text-gray-500 italic bg-gray-100 p-4 rounded-md">
          {field.value}
        </div>
      );
    }

    if (editingField === field.key) {
      return (
        <div className="flex items-center gap-2">
          {field.type === 'textarea' ? (
            <textarea
              value={editValue}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditValue(e.target.value)}
              className="flex-1 min-h-[80px] p-2 border rounded-md resize-none"
              placeholder={`Enter ${field.label.toLowerCase()}...`}
            />
          ) : (
            <input
              type="text"
              value={editValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
              className="flex-1 p-2 border rounded-md"
              placeholder={`Enter ${field.label.toLowerCase()}...`}
            />
          )}
          <Button
            size="sm"
            onClick={() => handleEditSave(field)}
            disabled={updateTdsMutation.isPending || updateSdsMutation.isPending}
            className="h-8 w-8 p-0"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleEditCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between group">
        <div className="flex-1">
          {field.value ? (
            <span className="text-sm text-gray-700">{field.value}</span>
          ) : (
            <span className="text-sm text-gray-400 italic">No {field.label.toLowerCase()} set</span>
          )}
        </div>
        {field.key !== 'TDS_SECTION' && field.key !== 'SDS_SECTION' && !field.key.endsWith('_NOT_FOUND') && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEditStart(field)}
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <div ref={searchRef} className="relative w-full max-w-2xl">
            <div className="relative">
              {isLoading ? (
                <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              )}
              <Input
                type="text"
                placeholder={isLoading ? "Loading products..." : "Search TDS and SDS products..."}
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                disabled={isLoading}
                onFocus={() => {
                  setIsSearchFocused(true);
                  if (debouncedSearchQuery.trim() && !isLoading) {
                    setShowDropdown(true);
                  }
                }}
                className="pl-10 pr-4 py-3 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Search Results Dropdown */}
            {showDropdown && searchResults.length > 0 && !isLoading && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                {searchResults.map((match: MatchedProduct, index: number) => {
                  const hasTds = !!match.tds;
                  const hasSds = !!match.sds;
                  const category = match.tds?.category || match.sds?.category || '';
                  return (
                    <div
                      key={index}
                      onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                      onClick={() => handleProductSelect(match)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{match.productName}</div>
                      {category && (
                        <div className="text-sm text-gray-600 mt-1">{category}</div>
                      )}
                      <div className="flex gap-2 mt-1">
                        {hasTds && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">TDS</span>}
                        {hasSds && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">SDS</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        {selectedMatch && productType && (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900">
                {selectedMatch.productName}
              </CardTitle>
              <div className="flex gap-2 mt-2">
                {selectedMatch.tds && <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded">TDS Available</span>}
                {selectedMatch.sds && <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded">SDS Available</span>}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {getEditableFields().map((field: EditableField, index: number, array: EditableField[]) => (
                <div key={field.key}>
                  {!field.key.endsWith('_SECTION') && (
                    <div className="mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        {field.label}
                      </label>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-4">
                    {renderFieldValue(field)}
                  </div>
                  {index < array.length - 1 && !field.key.endsWith('_SECTION') && <Separator className="mt-6" />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!selectedMatch && !isLoading && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Search for a TDS or SDS product
            </h3>
            <p className="text-gray-500">
              Type in the search bar above to find and edit product information
            </p>
          </div>
        )}
      </div>
    </div>
  );
}