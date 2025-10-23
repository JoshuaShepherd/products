"use client";

import { useState, useEffect, useMemo } from "react";
import { Edit2, Save, X, Check, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { PDFExportButton } from "@/components/pdf-export";
import { getProductLabelHtml } from "@/lib/pdf-export";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProductOverviewProps {
  title: string;
  onSave?: (field: string, value: string) => Promise<void>;
  onNavigate?: (newTitle: string) => void;
}

export function ProductOverview({ title, onSave, onNavigate }: ProductOverviewProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [labelHtml, setLabelHtml] = useState<string>("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);
  
  // Inline editing states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  
  // Quick edit states for the special fields
  const [quickEditValues, setQuickEditValues] = useState({
    "Do Not Freeze": "",
    "Green Conscious": "",
    "Mix Well": "",
    "Used By Date": ""
  });



  // Mapping from display names to database column names
  const displayNameToColumnName = (displayName: string): string => {
    const mapping: { [key: string]: string } = {
      "Name": "name",
      "Short Description (English)": "short_description_english",
      "Short Description (French)": "short_description_french", 
      "Short Description (Spanish)": "short_description_spanish",
      "Description": "description",
      "Application": "application",
      "Features": "features",
      "Coverage": "coverage",
      "Limitations": "limitations",
      "Shelf Life": "shelf_life",
      "VOC Data": "voc_data",
      "Signal Word": "signal_word",
      "Components Determining Hazard": "components_determining_hazard",
      "Hazard Statements": "hazard_statements",
      "Precautionary Statements": "precautionary_statements",
      "Response Statements": "response_statements",
      "First Aid": "first_aid",
      "Storage": "storage",
      "Disposal": "disposal",
      "Proper Shipping Name": "proper_shipping_name",
      "UN Number": "un_number",
      "Hazard Class": "hazard_class",
      "Packing Group": "packing_group",
      "Emergency Response Guide": "emergency_response_guide",
      "Do Not Freeze": "do_not_freeze",
      "Mix Well": "mix_well",
      "Green Conscious": "green_conscious",
      "Used By Date": "used_by_date"
    };
    
    return mapping[displayName] || displayName.toLowerCase().replace(/ /g, '_');
  };

  // Inline editing functions
  const handleStartEdit = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditingValue(String(currentValue || ""));
  };

  const handleSaveEdit = async () => {
    if (!editingField || !onSave) return;
    
    try {
      // Convert display name to database column name
      const columnName = displayNameToColumnName(editingField);
      await onSave(columnName, editingValue);
      setEditingField(null);
      setEditingValue("");
      
      // Refresh the product data
      if (title) {
        const response = await fetch(`/api/product?title=${encodeURIComponent(title)}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data.product);
        }
      }
    } catch (error) {
      console.error('Failed to save:', error);
      // Handle error (you could add a toast notification here)
    }
  };

  // Helper function to get dropdown options for enum fields
  const getEnumOptions = (fieldName: string): string[] | null => {
    switch (fieldName) {
      case "Signal Word":
        return ["Danger", "Warning", "None"];
      case "Hazard Class":
        return [
          "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
          "Class 6", "Class 7", "Class 8", "Class 9", "Not applicable"
        ];
      case "Packing Group":
        return ["PG I", "PG II", "PG III", "Not applicable"];
      default:
        return null;
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditingValue("");
  };

  // Fetch product data
  useEffect(() => {
    // Fetch all products for navigation
    console.log('Fetching products for navigation...');
    fetch("/api/product")
      .then(res => res.json())
      .then(data => {
        console.log('Raw product data:', data);
        if (data.products) {
          // Sort products alphabetically by title
          const sortedProducts = data.products.sort((a: any, b: any) => 
            a.Title.localeCompare(b.Title)
          );
          console.log('Loaded products for navigation:', sortedProducts.length, sortedProducts.slice(0, 3));
          setAllProducts(sortedProducts);
        } else {
          console.error('No products array in response:', data);
        }
      })
      .catch(error => {
        console.error('Error loading products:', error);
      });
  }, []);

  useEffect(() => {
    if (!title) return;
    
    setLoading(true);
    fetch(`/api/product?title=${encodeURIComponent(title)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProduct(data.product);
        setCurrentProductId(data.product.ID);
        
        // Initialize quick edit values with proper boolean to Yes/No conversion
        setQuickEditValues({
          "Do Not Freeze": data.product["Do Not Freeze"] ? "Yes" : "No",
          "Green Conscious": data.product["Green Conscious"] ? "Yes" : "No", 
          "Mix Well": data.product["Mix Well"] ? "Yes" : "No",
          "Used By Date": data.product["Used By Date"] || ""
        });
        
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching product:', error);
        setLoading(false);
      });
  }, [title]);

  // Fetch label HTML for PDF export
  useEffect(() => {
    if (!title || !product) {
      setLabelHtml("");
      return;
    }

    getProductLabelHtml(title)
      .then(html => setLabelHtml(html))
      .catch(error => {
        console.error('Error fetching label HTML:', error);
        setLabelHtml("");
      });
  }, [title, product]);

  const handleQuickEditSave = async () => {
    if (!onSave) return;
    
    setSaving(true);
    try {
      // Save each changed field with proper data type conversion
      for (const [displayField, value] of Object.entries(quickEditValues)) {
        // Convert display field name to database column name
        const dbColumnName = displayNameToColumnName(displayField);
        let valueToSave: any = value;
        
        // For boolean fields, convert Yes/No to true/false
        if (displayField === "Do Not Freeze" || displayField === "Green Conscious" || displayField === "Mix Well") {
          valueToSave = value === "Yes";
        }
        // For used_by_date, keep as string
        else if (displayField === "Used By Date") {
          valueToSave = value || null; // Use null for empty string
        }
        
        // Only save if the value actually changed
        let currentDisplayValue;
        if (displayField === "Do Not Freeze" || displayField === "Green Conscious" || displayField === "Mix Well") {
          // Get current boolean value and convert to Yes/No for comparison
          const currentBoolValue = product[displayField];
          currentDisplayValue = currentBoolValue ? "Yes" : "No";
        } else {
          currentDisplayValue = product[displayField] || "";
        }
          
        if (currentDisplayValue !== value) {
          console.log(`Saving ${dbColumnName}:`, valueToSave, `(was: ${currentDisplayValue}, now: ${value})`);
          await onSave(dbColumnName, valueToSave);
        }
      }
      
      // Update local product state with the actual saved values
      const updatedProduct = { ...product };
      for (const [displayField, value] of Object.entries(quickEditValues)) {
        if (displayField === "Do Not Freeze" || displayField === "Green Conscious" || displayField === "Mix Well") {
          updatedProduct[displayField] = value === "Yes";
        } else {
          updatedProduct[displayField] = value;
        }
      }
      
      setProduct(updatedProduct);
      setEditing(false);
    } catch (error) {
      console.error('Error saving quick edits:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };



  const handleQuickEditCancel = () => {
    // Reset to original values using proper boolean to Yes/No conversion
    setQuickEditValues({
      "Do Not Freeze": product["Do Not Freeze"] ? "Yes" : "No",
      "Green Conscious": product["Green Conscious"] ? "Yes" : "No",
      "Mix Well": product["Mix Well"] ? "Yes" : "No",
      "Used By Date": product["Used By Date"] || ""
    });
    setEditing(false);
  };

  // Navigation functions
  const currentIndex = useMemo(() => {
    const index = allProducts.findIndex(p => p.ID === currentProductId);
    return index;
  }, [allProducts, currentProductId]);

  const navigatePrevious = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (currentIndex > 0 && onNavigate) {
      const newProduct = allProducts[currentIndex - 1];
      onNavigate(newProduct.Title);
    }
  };

  const navigateNext = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (currentIndex < allProducts.length - 1 && onNavigate) {
      const newProduct = allProducts[currentIndex + 1];
      onNavigate(newProduct.Title);
    }
  };

  const handleDropdownSelect = (selectedValue: string) => {
    // selectedValue is in format "ID:Title" to ensure uniqueness
    const [selectedId, selectedTitle] = selectedValue.split(':');
    if (onNavigate && selectedTitle !== title) {
      onNavigate(selectedTitle);
    }
  };

  // Helper function to create a display name for products
  const getDisplayName = (product: any) => {
    const baseTitle = product.Title;
    // You can customize this further if you want to show SKU or other info
    return baseTitle;
  };

  const renderYesNoToggle = (field: string) => {
    const value = quickEditValues[field as keyof typeof quickEditValues];
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-0">
          {field}:
        </span>
        {editing ? (
          <div className="flex gap-1">
            <button
              className={`px-3 py-1 text-xs rounded-full border-2 transition-all ${
                value === "Yes" 
                  ? "bg-green-500 text-white border-green-500" 
                  : "bg-gray-100 text-gray-600 border-gray-300 hover:border-green-400"
              }`}
              onClick={() => setQuickEditValues(prev => ({ ...prev, [field]: "Yes" }))}
            >
              Yes
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-full border-2 transition-all ${
                value === "No" 
                  ? "bg-red-500 text-white border-red-500" 
                  : "bg-gray-100 text-gray-600 border-gray-300 hover:border-red-400"
              }`}
              onClick={() => setQuickEditValues(prev => ({ ...prev, [field]: "No" }))}
            >
              No
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-full border-2 transition-all ${
                value === "" 
                  ? "bg-gray-500 text-white border-gray-500" 
                  : "bg-gray-100 text-gray-600 border-gray-300 hover:border-gray-400"
              }`}
              onClick={() => setQuickEditValues(prev => ({ ...prev, [field]: "" }))}
            >
              None
            </button>
          </div>
        ) : (
          <span className={`px-2 py-1 text-xs rounded-full ${
            value === "Yes" ? "bg-green-100 text-green-800" :
            value === "No" ? "bg-red-100 text-red-800" :
            "bg-gray-100 text-gray-600"
          }`}>
            {value || "Not set"}
          </span>
        )}
      </div>
    );
  };

  const renderUsedByDateSelect = () => {
    const field = "Used By Date";
    const value = quickEditValues[field as keyof typeof quickEditValues] || "";
    
    const dateOptions = [
      "6 Months",
      "9 months", // Added the new option
      "1 year",
      "16 months",
      "18 months",
      "2 years",
      "3 years",
      "5 years",
      "Not applicable",
      "See Technical Data Sheet"
    ];

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-0">
          {field}:
        </span>
        {editing ? (
          <Select
            value={value}
            onValueChange={(newValue) => 
              setQuickEditValues(prev => ({ ...prev, [field]: newValue }))
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {dateOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className={`px-2 py-1 text-xs rounded-full ${
            value ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
          }`}>
            {value || "Not set"}
          </span>
        )}
      </div>
    );
  };

  // Filter out fields that shouldn't be shown in the full view
  const getFilteredFields = () => {
    if (!product) return [];
    
    const excludeFields = [
      "Name", // Already shown in header
      "ID", // Not user-relevant
      "Do Not Freeze", // In quick edit
      "Green Conscious", // In quick edit
      "Mix Well", // In quick edit
      "Used By Date", // In quick edit - Fixed case
      "Pictogram URLs" // Special handling
    ];
    
    return Object.entries(product).filter(([key]) => !excludeFields.includes(key));
  };

  const renderFieldValue = (key: string, value: any) => {
    if (!value) return <span className="text-gray-400 italic">Not set</span>;
    
    // Convert value to string for processing
    const stringValue = String(value);
    
    // Special handling for pictograms - handle both HTML and comma-separated URLs
    if (key === "Pictograms") {
      // If it contains HTML (legacy format), display as HTML
      if (stringValue.includes('<img')) {
        return (
          <div
            className="flex gap-2 flex-wrap"
            dangerouslySetInnerHTML={{ __html: stringValue }}
          />
        );
      }
      // If it's comma-separated URLs (new format), display as images
      if (stringValue.includes('http')) {
        const urls = stringValue.split(',').map(url => url.trim()).filter(Boolean);
        return (
          <div className="flex gap-2 flex-wrap">
            {urls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt="Pictogram"
                className="w-12 h-12 object-contain border border-gray-200 rounded"
              />
            ))}
          </div>
        );
      }
    }
    
    // Check if the value contains HTML tags
    const containsHTML = /<[^>]*>/g.test(stringValue);
    
    if (containsHTML) {
      // For HTML content, render it properly with styling
      return (
        <div
          className="prose prose-sm max-w-none dark:prose-invert 
                     prose-p:text-gray-700 dark:prose-p:text-gray-300
                     prose-li:text-gray-700 dark:prose-li:text-gray-300
                     prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                     prose-ul:my-2 prose-li:my-0 prose-p:my-2"
          style={{
            lineHeight: '1.5',
          }}
          dangerouslySetInnerHTML={{ __html: stringValue }}
        />
      );
    }
    
    // Long text fields without HTML
    if (stringValue.length > 100) {
      return (
        <div className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm">
          {stringValue}
        </div>
      );
    }
    
    return <span className="break-words">{stringValue}</span>;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-24 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header with Navigation */}
      <div className="mb-6 pb-4 border-b">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-500 mb-2">Product Overview</div>
            
            {/* Compact Navigation Group */}
            <div className="flex items-center gap-2 max-w-fit">
              {/* Previous Button */}
              <button
                onClick={navigatePrevious}
                disabled={allProducts.length === 0 || currentIndex <= 0}
                className="flex-shrink-0 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer border border-gray-200 dark:border-gray-700"
                aria-label="Previous product"
                type="button"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>

              {/* Compact Product Dropdown */}
              <div className="min-w-0 flex-1" style={{ maxWidth: '400px' }}>
                {/* Temporary fallback dropdown for debugging */}
                <select
                  value={currentProductId ? `${currentProductId}:${title}` : title}
                  onChange={(e) => {
                    console.log('Native select changed:', e.target.value);
                    handleDropdownSelect(e.target.value);
                  }}
                  className="h-10 w-full text-base font-semibold border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer"
                >
                  {allProducts.length > 0 ? (
                    allProducts.map((productItem) => (
                      <option 
                        key={`${productItem.ID}-${productItem.Title}`}
                        value={`${productItem.ID}:${productItem.Title}`}
                      >
                        {getDisplayName(productItem)}
                      </option>
                    ))
                  ) : (
                    <option value="">Loading products...</option>
                  )}
                </select>
              </div>

              {/* Next Button */}
              <button
                onClick={navigateNext}
                disabled={allProducts.length === 0 || currentIndex >= allProducts.length - 1}
                className="flex-shrink-0 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer border border-gray-200 dark:border-gray-700"
                aria-label="Next product"
                type="button"
              >
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Compact Export Buttons */}
          <div className="flex gap-2 flex-wrap lg:flex-nowrap">
            {/* Smart Label Size Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                View Label
                <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <a
                    href={`/api/label/${encodeURIComponent(product?.Title || title)}?size=14x7`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">14×7</span>
                    Standard Label
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href={`/api/label/${encodeURIComponent(product?.Title || title)}?size=5x9`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">5×9</span>
                    Compact Label
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <a
              href={`/api/label/${encodeURIComponent(product?.Title || title)}`}
              download={`${(product?.Title || title).replace(/[\\/:*?"<>|]/g, "_")}_label.html`}
              className="px-3 py-2 rounded-md border border-gray-300 bg-white text-blue-600 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700 transition-colors"
            >
              Download
            </a>
            <PDFExportButton 
              labelHtml={labelHtml}
              productTitle={product?.Title || title || "Unknown Product"}
              className="text-sm px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Quick Edit Panel */}
      <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            Quick Edit - Key Fields
          </h2>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleQuickEditSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3" />
                      Save All
                    </>
                  )}
                </button>
                <button
                  onClick={handleQuickEditCancel}
                  disabled={saving}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  console.log('Edit button clicked - current quickEditValues:', quickEditValues);
                  console.log('Current product Used By Date:', product["Used By Date"]);
                  // Don't reinitialize values, just enter edit mode
                  setEditing(true);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {renderYesNoToggle("Do Not Freeze")}
          {renderYesNoToggle("Green Conscious")}
          {renderYesNoToggle("Mix Well")}
          {renderUsedByDateSelect()}
        </div>
      </div>

      {/* Full Product Data */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
          Complete Product Information
        </h2>
        
        <div className="grid gap-6">
          {getFilteredFields().map(([key, value]) => (
            <div key={key} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 group hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wide">
                  {key}
                </h3>
                {/* Edit button - appears on hover */}
                <button
                  onClick={() => handleStartEdit(key, value)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title={`Edit ${key}`}
                >
                  <Edit2 className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                </button>
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                {editingField === key ? (
                  <div className="space-y-2">
                    {(() => {
                      const enumOptions = getEnumOptions(key);
                      if (enumOptions) {
                        return (
                          <Select
                            value={editingValue}
                            onValueChange={setEditingValue}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={`Select ${key.toLowerCase()}...`} />
                            </SelectTrigger>
                            <SelectContent>
                              {enumOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        );
                      } else {
                        return (
                          <textarea
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[100px]"
                            placeholder={`Enter ${key.toLowerCase()}...`}
                            autoFocus
                          />
                        );
                      }
                    })()}
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  renderFieldValue(key, value)
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
