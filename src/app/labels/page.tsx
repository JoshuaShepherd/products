"use client";

import { useState, useEffect } from "react";
import { Download, FileText, Grid, List, Search, CheckSquare, Square, Eye, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppSidebar } from "@/components/app-sidebar";
import { BrandedSidebarTrigger } from "@/components/branded-sidebar-trigger";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Database } from "@/lib/database.types";

type Product = Database['public']['Tables']['products']['Row'];

type LabelSize = "14x7" | "5x9";
type ViewMode = "grid" | "list";

export default function LabelsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [labelSize, setLabelSize] = useState<LabelSize>("14x7");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch all products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      const productList = Array.isArray(data) ? data : [];
      
      // Remove duplicates based on ID
      const uniqueProducts = productList.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      );
      
      setProducts(uniqueProducts);
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Selection handlers
  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const selectAll = () => {
    setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
  };

  const clearAll = () => {
    setSelectedProducts(new Set());
  };

  // HTML download function
  const downloadHTML = async (productName: string) => {
    try {
      setGenerating(true);
      setError(null);
      
      const response = await fetch(
        `/api/label/${encodeURIComponent(productName)}?size=${labelSize}`
      );
      
      if (!response.ok) {
        throw new Error('HTML generation failed');
      }
      
      const htmlContent = await response.text();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${productName}_${labelSize}_label.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('HTML download failed:', error);
      setError('Failed to download HTML');
    } finally {
      setGenerating(false);
    }
  };

  // PDF download function
  const downloadPDF = async (productName: string) => {
    try {
      setGenerating(true);
      setError(null);
      
      const response = await fetch(
        `/api/label/${encodeURIComponent(productName)}/pdf?size=${labelSize}`
      );
      
      if (!response.ok) {
        throw new Error('PDF generation failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${productName}_${labelSize}_label.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('PDF download failed:', error);
      setError('Failed to download PDF');
    } finally {
      setGenerating(false);
    }
  };

  // Bulk HTML generation
  const generateBulkHTMLs = async () => {
    if (selectedProducts.size === 0) return;
    
    setGenerating(true);
    setError(null);
    const errors: string[] = [];
    let successCount = 0;
    
    for (const productId of selectedProducts) {
      const product = products.find(p => p.id === productId);
      if (!product) continue;
      
      try {
        const response = await fetch(
          `/api/label/${encodeURIComponent(product.name)}?size=${labelSize}`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to generate HTML for ${product.name}`);
        }
        
        const htmlContent = await response.text();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${product.name}_${labelSize}_label.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        successCount++;
        // Add delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Failed to generate HTML for ${product.name}:`, error);
        errors.push(product.name);
      }
    }
    
    if (errors.length > 0) {
      setError(`Failed to generate HTMLs for: ${errors.join(', ')}`);
    } else if (successCount > 0) {
      // Clear selection after successful bulk generation
      setSelectedProducts(new Set());
    }
    
    setGenerating(false);
  };

  // Bulk PDF generation
  const generateBulkPDFs = async () => {
    if (selectedProducts.size === 0) return;
    
    setGenerating(true);
    setError(null);
    const errors: string[] = [];
    let successCount = 0;
    
    for (const productId of selectedProducts) {
      const product = products.find(p => p.id === productId);
      if (!product) continue;
      
      try {
        const response = await fetch(
          `/api/label/${encodeURIComponent(product.name)}/pdf?size=${labelSize}`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to generate PDF for ${product.name}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${product.name}_${labelSize}_label.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        successCount++;
        // Add delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Failed to generate PDF for ${product.name}:`, error);
        errors.push(product.name);
      }
    }
    
    if (errors.length > 0) {
      setError(`Failed to generate PDFs for: ${errors.join(', ')}`);
    } else if (successCount > 0) {
      // Clear selection after successful bulk generation
      setSelectedProducts(new Set());
    }
    
    setGenerating(false);
  };

  const isAllSelected = filteredProducts.length > 0 && 
    filteredProducts.every(p => selectedProducts.has(p.id));

  // Generate bulk labels
  const generateLabels = async () => {
    if (selectedProducts.size === 0) {
      alert("Please select at least one product");
      return;
    }

    setGenerating(true);
    try {
      const productIds = Array.from(selectedProducts);
      const response = await fetch("/api/labels/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds,
          labelSize,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate labels");

      // Download the ZIP file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SpecChem_Labels_${new Date().toISOString().split('T')[0]}_${labelSize}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Failed to generate labels. Please try again.");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const LabelPreview = ({ product }: { product: Product }) => (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 relative group hover:shadow-md transition-shadow">
      <div className="absolute top-2 right-2">
        <Checkbox
          checked={selectedProducts.has(product.id)}
          onCheckedChange={() => toggleProduct(product.id)}
        />
      </div>
      <div className="pr-8">
        <h4 className="font-medium text-sm mb-2">{product.name}</h4>
        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewProduct(product)}
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadHTML(product.name)}
            disabled={generating}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            HTML
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => downloadPDF(product.name)}
            disabled={generating}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Badge variant="secondary" className="text-xs">
            {labelSize}
          </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <BrandedSidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Labels</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex items-center gap-2"
            >
              <a href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </a>
            </Button>
          </div>
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <Card className="md:col-span-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Label Management
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Generate and download labels for multiple products
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {selectedProducts.size} selected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Label Size */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor="size">Size:</Label>
                    <Select value={labelSize} onValueChange={(value: LabelSize) => setLabelSize(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="14x7">14×7 (Landscape)</SelectItem>
                        <SelectItem value="5x9">5×9 (Portrait)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* View Mode */}
                  <div className="flex items-center gap-2">
                    <Label>View:</Label>
                    <div className="flex border rounded">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="flex-1 max-w-sm">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>

                {/* Selection Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={isAllSelected ? clearAll : selectAll}
                    >
                      {isAllSelected ? <Square className="h-4 w-4 mr-2" /> : <CheckSquare className="h-4 w-4 mr-2" />}
                      {isAllSelected ? "Clear All" : "Select All"}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {selectedProducts.size} of {filteredProducts.length} selected
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={generateBulkHTMLs}
                      disabled={selectedProducts.size === 0 || generating}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      {generating ? "Generating..." : "Download HTMLs"}
                    </Button>
                    <Button
                      onClick={generateBulkPDFs}
                      disabled={selectedProducts.size === 0 || generating}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      {generating ? "Generating..." : "Download PDFs"}
                    </Button>
                    <Button
                      onClick={generateLabels}
                      disabled={selectedProducts.size === 0 || generating}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      {generating ? "Generating..." : "Download ZIP"}
                    </Button>
                  </div>
                </div>

                {/* Product Grid/List */}
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading products...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {searchQuery ? "No products match your search" : "No products found"}
                    </p>
                  </div>
                ) : (
                  <div className={
                    viewMode === "grid" 
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                      : "space-y-2"
                  }>
                    {filteredProducts.map((product) => 
                      viewMode === "grid" ? (
                        <LabelPreview key={`label-${product.id}`} product={product} />
                      ) : (
                        <div key={`list-${product.id}`} className="flex items-center gap-3 p-3 border rounded">
                          <Checkbox
                            checked={selectedProducts.has(product.id)}
                            onCheckedChange={() => toggleProduct(product.id)}
                          />
                          <span className="flex-1 font-medium">{product.name}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPreviewProduct(product)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              Preview
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadHTML(product.name)}
                              disabled={generating}
                              className="flex items-center gap-1"
                            >
                              <Download className="h-4 w-4" />
                              HTML
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => downloadPDF(product.name)}
                              disabled={generating}
                              className="flex items-center gap-1"
                            >
                              <Download className="h-4 w-4" />
                              PDF
                            </Button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>

      {/* Label Preview Modal */}
      {previewProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl relative max-w-[95vw] max-h-[95vh] overflow-hidden">
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPreviewProduct(null)}
                className="bg-white/90 dark:bg-gray-800/90"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">{previewProduct.name} - {labelSize} Label</h3>
              <div className="bg-white border rounded shadow-sm">
                <iframe
                  src={`/api/label/${encodeURIComponent(previewProduct.name)}${labelSize === '5x9' ? '?size=5x9' : ''}`}
                  className="w-full border-0"
                  style={{
                    width: labelSize === '5x9' ? '600px' : '900px',
                    height: labelSize === '5x9' ? '864px' : '500px',
                  }}
                  title={`${previewProduct.name} Label Preview`}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPreviewProduct(null)}
                >
                  Close
                </Button>
                <Button
                  variant="default"
                  onClick={() => downloadPDF(previewProduct.name)}
                  disabled={generating}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button asChild>
                  <a
                    href={`/api/label/${encodeURIComponent(previewProduct.name)}${labelSize === '5x9' ? '?size=5x9' : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in New Tab
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
