"use client";

import { useState, useEffect, useRef } from "react";

// Pass these as props from parent/sidebar
export function ProductPanel({ 
  title, 
  editing, 
  setEditing, 
  onSave, 
  onCancel
}: { 
  title: string;
  editing?: boolean;
  setEditing?: (editing: boolean) => void;
  onSave?: () => Promise<void>;
  onCancel?: () => void;
}) {
  const [product, setProduct] = useState<any>(null);
  const [editedProduct, setEditedProduct] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  // Hidden fields that shouldn't appear in the product view
  const HIDDEN_FIELDS = [
    "id", "slug", "sku", "subtitle_1", "subtitle_1", "subtitle_2", "category_id"
  ];

  // Create a ref for the save function to avoid dependency issues
  const saveRef = useRef<(() => Promise<void>) | null>(null);

  function handleFieldChange(field: string, value: string) {
    setEditedProduct((prev: any) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaveStatus("saving");
    
    try {
      if (onSave) {
        await onSave();
      } else {
        // Fallback to default save behavior
        const res = await fetch("/api/update-product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, updates: editedProduct }),
        });
        if (!res.ok) {
          throw new Error('Failed to save');
        }
      }
      
      setSaveStatus("success");
      setProduct(editedProduct);
      setEditing?.(false);
    } catch (error) {
      setSaveStatus("error");
    }
    
    setTimeout(() => setSaveStatus("idle"), 1200);
  }

  // Update the ref whenever component renders
  saveRef.current = handleSave;

  // Fetch product details when title changes
  useEffect(() => {
    if (!title) return;
    setLoading(true);
    fetch(`/api/product?title=${encodeURIComponent(title)}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product);
        setEditedProduct(data.product);
        setLoading(false);
        setEditing?.(false);
      });
  }, [title, setEditing]);

  // Listen for save events from header
  useEffect(() => {
    const handleSaveEvent = () => {
      if (editing && saveRef.current) {
        saveRef.current();
      }
    };

    window.addEventListener('productSave', handleSaveEvent);
    return () => window.removeEventListener('productSave', handleSaveEvent);
  }, [editing]);

  function handleCancel() {
    if (onCancel) {
      onCancel();
    } else {
      setEditing?.(false);
      setEditedProduct(product);
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (!product) return <div className="p-4 text-gray-400">Select a product...</div>;

  // Filter out hidden fields and handle custom field mapping
  let fields = Object.keys(product).filter(field => !HIDDEN_FIELDS.includes(field));
  
  // Apply same field transformations as sidebar
  fields = fields.map(field => field === "Available Fields" ? "TDS" : field);

  // Add custom section headers in display
  const processedFields = [];
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    
    // Add "SDS" section after "Storage"
    if (field === "Storage") {
      processedFields.push(field);
      processedFields.push({ type: 'header', name: 'SDS' });
      continue;
    }
    
    // Add "French" section before "Composants Déterminant le Danger"
    if (field === "Composants Déterminant le Danger") {
      processedFields.push({ type: 'header', name: 'French' });
    }
    
    processedFields.push(field);
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold flex-1">{product.Title}</h2>
      </div>

      <div className="space-y-4">
        {processedFields.map((item, index) => {
          // Handle custom section headers
          if (typeof item === 'object' && item.type === 'header') {
            return (
              <div key={`header-${item.name}-${index}`} className="mt-8 mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-b pb-2">
                  {item.name}
                </h3>
              </div>
            );
          }
          
          const field = item as string;
          
          return field === "Title" ? null : (
            <div key={field}>
              <label className="block font-semibold text-gray-600 dark:text-gray-200 mb-1">
                {field}
              </label>
              {editing ? (
                <textarea
                  className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-neutral-700"
                  rows={Math.max(2, String(editedProduct[field] || "").split("\n").length)}
                  value={editedProduct[field] ?? ""}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                />
              ) : (
                <div className="text-gray-900 dark:text-gray-100 whitespace-pre-line bg-muted/50 p-2 rounded">
                  {product[field] || <span className="italic text-gray-400">–</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Status messages for save operations */}
      {saveStatus === "success" && (
        <div className="mt-4 text-green-500">Saved successfully!</div>
      )}
      {saveStatus === "error" && (
        <div className="mt-4 text-red-500">Error saving changes.</div>
      )}
    </div>
  );
}
