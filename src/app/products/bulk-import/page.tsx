'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Download, CheckCircle, AlertCircle, FileIcon, Info } from 'lucide-react';

interface ImportResults {
  success: boolean;
  summary: {
    total_processed: number;
    new_products_created: number;
    duplicates_skipped: number;
    created_products: Array<{ ID: number; Title: string }>;
  };
  duplicates: string[];
}

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<ImportResults | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setResults(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/products/bulk-import', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvTemplate = `Title,Short Description (EN),Short Description (FR),Short Description (SP),Description,Application,Features,Coverage,Shelf Life,Limitations,Pictograms,Signal Word,Components Determining Hazard,Hazard Statements,Precautionary Statements,Response Statements,First Aid,Storage,Disposal,Transport,Green Conscious,Do Not Freeze,Mix Well,Used By Date,Package Size,VOC Data,Left Font,Right Font,Subtitle 1,Subtitle 2,Category,Manufacturer
"Sample Product","Short description in English","Description courte en français","Descripción corta en español","Full product description","Application details","Key features","Coverage information","12 months","Usage limitations","","Warning","","","","","","","","","","","","","1 gallon","","","","","","Sealers","SpecChem"`;

    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadMarkdownTemplate = () => {
    const markdownTemplate = `# Product Import Template

| Title | Short Description (EN) | Short Description (FR) | Short Description (SP) | Description | Application | Features | Coverage | Shelf Life | Limitations | Category | Manufacturer |
|-------|------------------------|------------------------|------------------------|-------------|-------------|----------|----------|------------|-------------|----------|--------------|
| Sample Product | Short description in English | Description courte en français | Descripción corta en español | Full product description | Application details | Key features | Coverage information | 12 months | Usage limitations | Sealers | SpecChem |

## Instructions
1. Replace the sample row with your actual product data
2. Add additional rows as needed
3. Keep the header row intact
4. Use the exact column names shown`;

    const blob = new Blob([markdownTemplate], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-import-template.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Bulk Product Import</h1>
        <p className="text-muted-foreground">
          Upload CSV or Markdown files to add multiple products to the database at once.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Products
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Select File
              </Button>
              
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download CSV Template
              </Button>

              <Button
                variant="outline"
                onClick={downloadMarkdownTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Markdown Template
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.md"
              onChange={handleFileSelect}
              className="hidden"
            />

            {file && (
              <div className="p-4 bg-blue-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <FileIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">
                      {file.name}
                    </p>
                    <p className="text-sm text-blue-700">
                      Size: {(file.size / 1024).toFixed(1)} KB • Type: {file.type || 'Unknown'}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    {file.name.endsWith('.csv') ? 'CSV' : 'Markdown'}
                  </Badge>
                </div>
              </div>
            )}

            {file && (
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full"
                size="lg"
              >
                {uploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Products
                  </>
                )}
              </Button>
            )}

            {uploading && (
              <div className="space-y-2">
                <Progress value={50} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  Processing file and inserting products...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Display */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Import Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-600">
                      {results.summary.new_products_created}
                    </div>
                    <div className="text-sm font-medium text-green-700">Products Created</div>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-3xl font-bold text-yellow-600">
                      {results.summary.duplicates_skipped}
                    </div>
                    <div className="text-sm font-medium text-yellow-700">Duplicates Skipped</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600">
                      {results.summary.total_processed}
                    </div>
                    <div className="text-sm font-medium text-blue-700">Total Processed</div>
                  </div>
                </div>

                {results.summary.created_products && results.summary.created_products.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Successfully Created Products:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {results.summary.created_products.map((product) => (
                        <div key={product.ID} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                          <span className="text-sm font-medium">{product.Title}</span>
                          <Badge variant="outline" className="text-xs">
                            ID: {product.ID}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.duplicates && results.duplicates.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      Skipped Products (Already Exist):
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {results.duplicates.map((title, index) => (
                        <div key={index} className="p-2 bg-yellow-50 rounded border border-yellow-200">
                          <span className="text-sm">{title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              File Format Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">CSV Format:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li>Use the downloaded template for proper column names</li>
                <li><strong>Title</strong> column is required (all others are optional)</li>
                <li>Use exact column names including parentheses and spaces</li>
                <li>Existing products (by Title) will be skipped to prevent duplicates</li>
                <li>Supports standard CSV format with comma separation</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Markdown Format:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li>Use standard markdown table format with pipes (|)</li>
                <li>First row should contain column headers</li>
                <li>Second row should be separator (|---|---|)</li>
                <li>Data rows follow with proper column alignment</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Key Column Names (exact case sensitive):</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div className="p-2 bg-gray-50 rounded">• <strong>Title</strong> (required)</div>
                <div className="p-2 bg-gray-50 rounded">• Short Description (EN)</div>
                <div className="p-2 bg-gray-50 rounded">• Short Description (FR)</div>
                <div className="p-2 bg-gray-50 rounded">• Short Description (SP)</div>
                <div className="p-2 bg-gray-50 rounded">• Description</div>
                <div className="p-2 bg-gray-50 rounded">• Application</div>
                <div className="p-2 bg-gray-50 rounded">• Features</div>
                <div className="p-2 bg-gray-50 rounded">• Coverage</div>
                <div className="p-2 bg-gray-50 rounded">• Shelf Life</div>
                <div className="p-2 bg-gray-50 rounded">• Limitations</div>
                <div className="p-2 bg-gray-50 rounded">• Pictograms</div>
                <div className="p-2 bg-gray-50 rounded">• Signal Word</div>
                <div className="p-2 bg-gray-50 rounded">• Components Determining Hazard</div>
                <div className="p-2 bg-gray-50 rounded">• Hazard Statements</div>
                <div className="p-2 bg-gray-50 rounded">• Precautionary Statements</div>
                <div className="p-2 bg-gray-50 rounded">• Response Statements</div>
                <div className="p-2 bg-gray-50 rounded">• First Aid</div>
                <div className="p-2 bg-gray-50 rounded">• Storage</div>
                <div className="p-2 bg-gray-50 rounded">• Disposal</div>
                <div className="p-2 bg-gray-50 rounded">• Transport</div>
                <div className="p-2 bg-gray-50 rounded">• Green Conscious</div>
                <div className="p-2 bg-gray-50 rounded">• Do Not Freeze</div>
                <div className="p-2 bg-gray-50 rounded">• Mix Well</div>
                <div className="p-2 bg-gray-50 rounded">• Used By Date</div>
                <div className="p-2 bg-gray-50 rounded">• Package Size</div>
                <div className="p-2 bg-gray-50 rounded">• VOC Data</div>
                <div className="p-2 bg-gray-50 rounded">• Left Font</div>
                <div className="p-2 bg-gray-50 rounded">• Right Font</div>
                <div className="p-2 bg-gray-50 rounded">• Subtitle 1</div>
                <div className="p-2 bg-gray-50 rounded">• Subtitle 2</div>
                <div className="p-2 bg-gray-50 rounded">• Category</div>
                <div className="p-2 bg-gray-50 rounded">• Manufacturer</div>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Column names are case-sensitive and must match exactly. 
                The system will map common variations (e.g., "Short Description EN" → "Short Description (EN)") 
                but exact names are recommended for best results.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
