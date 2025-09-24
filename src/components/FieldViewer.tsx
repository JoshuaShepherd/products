"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import ProductFieldViewer from "@/components/ProductFieldViewer";
import { PDFExportButton } from "@/components/pdf-export";
import { getProductLabelHtml } from "@/lib/pdf-export";
import { PictogramSelector, PictogramDisplay } from "@/components/PictogramSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icon URLs for Yes/No fields
const ICON_URLS = {
  "Green Conscious": "https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fgreen-conscious.png?alt=media&token=f58533a5-5698-4e4e-968b-cd4af2bc2a28",
  "Do Not Freeze": "https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fdo-not-freeze.png?alt=media&token=010ba974-dde9-4be7-b80e-5d1f7e7d0e49",
  "Mix Well": "https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fmix-well.png?alt=media&token=example-token"
};

// Mapping from sidebar display names to actual API response field names
const FIELD_NAME_MAPPING: { [key: string]: string } = {
  // Basic Information (API returns these with transformed names)
  "Name": "Title", // API transforms 'name' to 'Title'
  "Description": "Description",
  "Application": "Application", 
  "Features": "Features",
  "Coverage": "Coverage",
  "Limitations": "Limitations",
  "Shelf Life": "Shelf Life",
  "VOC Data": "VOC Data",
  
  // Short Descriptions (API transforms these)
  "Short Description (English)": "Short Description English",
  "Short Description (French)": "Short Description French", 
  "Short Description (Spanish)": "Short Description Spanish",
  
  // SDS Fields (API transforms these)
  "Signal Word": "Signal Word",
  "Components Determining Hazard": "Components Determining Hazard", 
  "Hazard Statements": "Hazard Statements",
  "Precautionary Statements": "Precautionary Statements",
  "Response Statements": "Response Statements", 
  "First Aid": "First Aid",
  "Storage": "Storage",
  "Disposal": "Disposal",
  
  // Transportation (API transforms these with different names)
  "Transport: Proper Shipping Name": "Proper Shipping Name",
  "Transport: UN Number": "UN Number",
  "Transport: Hazard Class": "Hazard Class", 
  "Transport: Packing Group": "Packing Group",
  "Transport: Emergency Response Guide": "Emergency Response Guide",
  
  // Product Features (API transforms these)
  "Do Not Freeze": "Do Not Freeze",
  "Mix Well": "Mix Well",
  "Green Conscious": "Green Conscious", 
  "Used By Date": "Used By Date",
  
  // French SDS Fields (API transforms these with different casing)
  "Composants Déterminant le Danger": "Composants Determinant Le Danger",
  "Mot de Signalement": "Mot De Signalement",
  "Mentions de Danger": "Mentions De Danger",
  "Conseils de Prudence": "Conseils De Prudence", 
  "Premiers Soins": "Premiers Soins",
  "Mesures de Premiers Secours": "Mesures De Premiers Secours",
  "Consignes de Stockage": "Consignes De Stockage",
  "Consignes d'Élimination": "Consignes Delimination",
  
  // Visual Elements
  "Pictograms": "Pictograms", // Special handling for pictograms
  
  // System Fields
  "Is Active": "Is Active",
  "Sort Order": "sort_order", // Not transformed by API
  "Created At": "Created At",
  "Updated At": "Updated At"
};

// Function to get the actual database field name from the display name
function getActualFieldName(displayName: string): string {
  return FIELD_NAME_MAPPING[displayName] || displayName;
}

// Function to convert display field name to database field name for API updates
function getDBFieldName(displayName: string): string {
  const dbFieldMapping: { [key: string]: string } = {
    // Basic Information
    "Name": "name",
    "Description": "description", 
    "Application": "application",
    "Features": "features",
    "Coverage": "coverage",
    "Limitations": "limitations",
    "Shelf Life": "shelf_life",
    "VOC Data": "voc_data",
    
    // Short Descriptions
    "Short Description (English)": "short_description_english",
    "Short Description (French)": "short_description_french",
    "Short Description (Spanish)": "short_description_spanish",
    
    // SDS Fields
    "Signal Word": "signal_word",
    "Components Determining Hazard": "components_determining_hazard",
    "Hazard Statements": "hazard_statements",
    "Precautionary Statements": "precautionary_statements",
    "Response Statements": "response_statements",
    "First Aid": "first_aid",
    "Storage": "storage",
    "Disposal": "disposal",
    
    // Transportation
    "Transport: Proper Shipping Name": "proper_shipping_name",
    "Transport: UN Number": "un_number",
    "Transport: Hazard Class": "hazard_class",
    "Transport: Packing Group": "packing_group", 
    "Transport: Emergency Response Guide": "emergency_response_guide",
    
    // Product Features
    "Do Not Freeze": "do_not_freeze",
    "Mix Well": "mix_well",
    "Green Conscious": "green_conscious",
    "Used By Date": "used_by_date",
    
    // French SDS Fields
    "Composants Déterminant le Danger": "composants_determinant_le_danger",
    "Mot de Signalement": "mot_de_signalement", 
    "Mentions de Danger": "mentions_de_danger",
    "Conseils de Prudence": "conseils_de_prudence",
    "Premiers Soins": "premiers_soins",
    "Mesures de Premiers Secours": "mesures_de_premiers_secours",
    "Consignes de Stockage": "consignes_de_stockage",
    "Consignes d'Élimination": "consignes_delimination",
    
    // System Fields
    "Is Active": "is_active",
    "Sort Order": "sort_order",
    "Created At": "created_at", 
    "Updated At": "updated_at"
  };
  
  return dbFieldMapping[displayName] || displayName.toLowerCase().replace(/\s+/g, '_');
}

// Function to check if a field is a pictogram field
function isPictogramField(selectedField: string, actualFieldName: string): boolean {
  return selectedField === "Pictograms" || 
         actualFieldName === "Pictograms" || 
         actualFieldName === "Title Pictogram URLs" || 
         actualFieldName === "Pictogram URLs";
}

// Function to render individual icon fields
function renderIconField(value: string) {
  if (!value) return null;
  return (
    <img
      src={value}
      alt=""
      loading="lazy"
      style={{
        maxWidth: 48,
        marginRight: 8,
        display: 'inline-block',
        verticalAlign: 'middle'
      }}
    />
  );
}

// Icon field editor component
function IconFieldEditor({ 
  field, 
  value, 
  onChange 
}: { 
  field: string; 
  value: string; 
  onChange: (value: string) => void; 
}) {
  const iconUrl = ICON_URLS[field as keyof typeof ICON_URLS];
  
  return (
    <select
      className="w-full p-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
      value={value ? "yes" : "no"}
      onChange={e => {
        if (e.target.value === "yes") {
          onChange(iconUrl);
        } else {
          onChange("");
        }
      }}
    >
      <option value="no">No</option>
      <option value="yes">Yes</option>
    </select>
  );
}

export function FieldViewer({ 
  title, 
  selectedField,
  editing,
  setEditing,
  onSave,
  onCancel
}: { 
  title: string;
  selectedField: string | null;
  editing?: boolean;
  setEditing?: (editing: boolean) => void;
  onSave?: (field: string, value: string) => Promise<void>;
  onCancel?: () => void;
}) {
  const [product, setProduct] = useState<any>(null);
  const [editedValue, setEditedValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [labelHtml, setLabelHtml] = useState<string>("");

  // Fetch product details when title changes
  useEffect(() => {
    if (!title) return;
    setLoading(true);
    fetch(`/api/product?title=${encodeURIComponent(title)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        setProduct(data.product);
        setLoading(false);
        setEditing?.(false);
      })
      .catch((error) => {
        console.error('Error fetching product:', error);
        setLoading(false);
        setProduct(null);
      });
  }, [title, setEditing]);

  // Fetch label HTML for PDF export when product is loaded
  useEffect(() => {
    if (!title || !product) {
      setLabelHtml("");
      return;
    }

    // Fetch label HTML in the background for PDF export
    getProductLabelHtml(title)
      .then(html => setLabelHtml(html))
      .catch(error => {
        console.error('Error fetching label HTML for PDF export:', error);
        setLabelHtml(""); // Clear on error, PDF export will be disabled
      });
  }, [title, product]);

  // Update edited value when field changes
  useEffect(() => {
    if (product && selectedField) {
      const actualFieldName = getActualFieldName(selectedField);
      setEditedValue(product[actualFieldName] || "");
    }
  }, [product, selectedField]);

  const handleSave = async () => {
    if (!selectedField || !title) return;
    
    const actualFieldName = getActualFieldName(selectedField);
    const dbFieldName = getDBFieldName(selectedField);
    setSaveStatus("saving");
    
    try {
      if (onSave) {
        await onSave(dbFieldName, editedValue);
      } else {
        const updates = { [dbFieldName]: editedValue };
        
        const response = await fetch('/api/update-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, updates })
        });
        
        if (!response.ok) throw new Error('Failed to save');
      }
      
      setProduct((prev: any) => ({ ...prev, [actualFieldName]: editedValue }));
      if (setEditing) setEditing(false);
      setSaveStatus("success");
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save changes');
      setSaveStatus("error");
    }
  };  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setEditing?.(false);
      if (product && selectedField) {
        const actualFieldName = getActualFieldName(selectedField);
        setEditedValue(product[actualFieldName] || "");
      }
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (!product) return <div className="p-4 text-gray-400">Select a product...</div>;
  if (!selectedField) return <div className="p-4 text-gray-400">Select a field from the sidebar to view its content</div>;

  const actualFieldName = getActualFieldName(selectedField);
  const fieldValue = product[actualFieldName];

  return (
    <div className="p-6">
      <div className="mb-4 pb-4 border-b">
        <div className="text-sm text-gray-500 mb-1">Selected Product:</div>
        <div className="font-semibold text-lg">{product.Title || "No title"}</div>
        
        {/* Label Generation Buttons */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {/* Smart Label Size Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-sm">
              View Label
              <ChevronDown className="w-3 h-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a
                  href={`/api/label/${encodeURIComponent(product.Title)}?size=14x7`}
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
                  href={`/api/label/${encodeURIComponent(product.Title)}?size=5x9`}
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
            href={`/api/label/${encodeURIComponent(product.Title)}`}
            download={`${product.Title.replace(/[\\/:*?"<>|]/g, "_")}_label.html`}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-blue-600 font-semibold hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700 transition text-sm"
          >
            Download Label
          </a>
          
          {/* PDF Export Button - New Feature */}
          <PDFExportButton 
            labelHtml={labelHtml}
            productTitle={product.Title || "Unknown Product"}
            className="text-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block font-semibold text-gray-800 dark:text-gray-200 text-lg">
              {selectedField}
            </label>
            {!editing && (
              <button
                className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                onClick={() => setEditing?.(true)}
              >
                Edit this field
              </button>
            )}
          </div>
          
          {editing ? (
            <div className="space-y-4">
              {/* Special editor for pictograms */}
              {isPictogramField(selectedField, actualFieldName) ? (
                <PictogramSelector
                  value={editedValue}
                  onChange={setEditedValue}
                />
              ) : /* Special editor for icon fields */
              actualFieldName && (actualFieldName === "Green Conscious" || actualFieldName === "Do Not Freeze" || actualFieldName === "Mix Well") ? (
                <IconFieldEditor
                  field={actualFieldName}
                  value={editedValue}
                  onChange={setEditedValue}
                />
              ) : (
                <textarea
                  className="w-full p-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 min-h-[200px] font-mono text-sm"
                  value={editedValue}
                  onChange={(e) => setEditedValue(e.target.value)}
                  placeholder="Enter HTML or plain text..."
                />
              )}
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
                  onClick={handleSave}
                  disabled={saveStatus === "saving"}
                >
                  {saveStatus === "saving" ? "Saving..." : "Save"}
                </button>
                <button
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 transition"
                  onClick={handleCancel}
                  disabled={saveStatus === "saving"}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-muted/50 p-4 rounded-lg border min-h-[200px]">
              {fieldValue ? (
                isPictogramField(selectedField, actualFieldName) ? (
                  <PictogramDisplay value={fieldValue} />
                ) : (actualFieldName === "Green Conscious" || actualFieldName === "Do Not Freeze" || actualFieldName === "Mix Well") ? (
                  renderIconField(fieldValue)
                ) : (
                  <ProductFieldViewer value={fieldValue} />
                )
              ) : (
                <span className="italic text-gray-400">No data for this field</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status messages */}
      {saveStatus === "success" && (
        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
          Field saved successfully!
        </div>
      )}
      {saveStatus === "error" && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
          Error saving field. Please try again.
        </div>
      )}
    </div>
  );
}
