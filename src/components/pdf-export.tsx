"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface PDFExportButtonProps {
  labelHtml: string;
  productTitle: string;
  className?: string;
}

export function PDFExportButton({ labelHtml, productTitle, className = "" }: PDFExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    if (!labelHtml || !productTitle) {
      setError("Missing label data or product title");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call our API route that handles PDF generation
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: labelHtml,
          filename: `${productTitle.replace(/[^a-zA-Z0-9]/g, '_')}_label.pdf`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      // Get the PDF as a blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${productTitle.replace(/[^a-zA-Z0-9]/g, '_')}_label.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      a.remove();
      
    } catch (err) {
      console.error("PDF export failed:", err);
      setError(err instanceof Error ? err.message : "Failed to export PDF");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
        disabled={loading || !labelHtml}
        onClick={handleExport}
        title="Export this label as a PDF"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Export as PDF
          </>
        )}
      </button>
      
      {error && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm z-50">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

// Compact version for floating/overlay use
export function PDFExportButtonCompact({ labelHtml, productTitle }: PDFExportButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    if (!labelHtml || !productTitle) {
      alert("Missing label data or product title");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: labelHtml,
          filename: `${productTitle.replace(/[^a-zA-Z0-9]/g, '_')}_label.pdf`
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate PDF: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${productTitle.replace(/[^a-zA-Z0-9]/g, '_')}_label.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      className="absolute top-4 right-4 z-30 inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
      disabled={loading || !labelHtml}
      onClick={handleExport}
      title="Export this label as a PDF"
    >
      {loading ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-3 h-3" />
          PDF
        </>
      )}
    </button>
  );
}
