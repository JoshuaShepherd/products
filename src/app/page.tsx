"use client";

import { useState, useCallback, useEffect } from "react";
import { Menu } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { FieldViewer } from "@/components/FieldViewer";
import { ProductOverview } from "@/components/ProductOverview";
import { BrandedSidebarTrigger } from "@/components/branded-sidebar-trigger";
import { ProductDropdown } from "@/components/ProductDropdown";
import { FloatingAssistant } from "@/components/FloatingAssistant";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"

function ProductsPageContent() {
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { open, setOpen, openMobile, setOpenMobile, isMobile } = useSidebar();

  const handleFieldSave = useCallback(async (field: string, value: string) => {
    if (!selectedTitle) return;
    
    const updates = { [field]: value };
    const res = await fetch("/api/update-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: selectedTitle, updates }),
    });
    
    if (!res.ok) {
      throw new Error('Failed to save');
    }
  }, [selectedTitle]);

  const handleCancel = useCallback(() => {
    setEditing(false);
  }, []);

  const handleProductSelect = useCallback((title: string) => {
    console.log('handleProductSelect called with:', title);
    console.log('Current selectedTitle:', selectedTitle);
    
    setSelectedTitle(title);
    setSelectedField(null);
    
    console.log('State should be updated to:', title);
  }, [selectedTitle]);

  const openSidebar = useCallback(() => {
    console.log('Opening sidebar...', { currentOpen: open, currentOpenMobile: openMobile, isMobile });
    if (isMobile) {
      setOpenMobile(true);
    } else {
      setOpen(true);
    }
    setMobileSidebarOpen(true);
  }, [setOpen, setOpenMobile, open, openMobile, isMobile]);

  const closeSidebar = useCallback(() => {
    console.log('Closing sidebar...', { currentOpen: open, currentOpenMobile: openMobile, isMobile });
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
    setMobileSidebarOpen(false);
  }, [setOpen, setOpenMobile, open, openMobile, isMobile]);

  return (
    <>
      <AppSidebar 
        onSelectProduct={handleProductSelect} 
        onSelectField={setSelectedField}
        onClose={closeSidebar}
      />
      
      {/* Emergency mobile sidebar access button */}
      {selectedTitle && (
        <button
          className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-xl md:hidden hover:bg-blue-700 transition-all hover:scale-105"
          onClick={() => {
            console.log('Emergency button clicked!', { open, openMobile, isMobile });
            openSidebar();
          }}
          aria-label="View fields"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
      
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 sticky top-0 bg-white dark:bg-neutral-900 z-10">
          <div className="flex items-center gap-2">
            <BrandedSidebarTrigger className="-ml-1 hidden md:flex" />
            
            {/* Mobile menu button - FIXED */}
            <button
              className="p-2 md:hidden hover:bg-accent/20 rounded-lg transition-colors bg-blue-600 text-white"
              onClick={() => {
                console.log('Mobile menu button clicked!', { open, openMobile, isMobile });
                openSidebar();
              }}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4 hidden md:block"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Product Data
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Field Viewer</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          <div className="flex items-center gap-2">
          </div>
          
          {selectedTitle && selectedField && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Viewing: {selectedField}
              </span>
              {/* Subtle header branding */}
              <Image 
                src="/sc_white_alt.webp" 
                alt="SpecChem"
                width={24}
                height={24}
                className="h-6 opacity-40 hidden sm:block"
                draggable={false}
              />
            </div>
          )}
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 relative">
          {!selectedTitle ? (
            <div className="flex flex-col items-center justify-start min-h-96 pt-4 md:pt-8">
              {/* Mobile-first search experience */}
              <div className="w-full max-w-2xl px-4 md:px-0">
                <div className="text-center mb-6 md:mb-8">
                  <Image 
                    src="/sc_black_watermark.webp" 
                    alt="SpecChem"
                    width={64}
                    height={64}
                    className="h-12 md:h-16 opacity-20 mx-auto mb-4"
                    draggable={false}
                  />
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    SpecChem Product Data
                  </h1>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6">
                    Search and manage technical data sheets for SpecChem products
                  </p>
                </div>

                {/* Product Dropdown */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                    Quick Product Selection
                  </label>
                  <ProductDropdown
                    onSelectProduct={handleProductSelect}
                    selectedProduct={selectedTitle || undefined}
                    placeholder="Choose a SpecChem product..."
                    className="w-full h-12 text-base"
                  />
                </div>
                
                {/* Quick access hint for desktop */}
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 hidden md:block mb-6">
                  Or use the sidebar to browse by product fields and categories
                </div>
                
                {/* Quick Navigation Cards */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <a 
                    href="/labels"
                    className="group block p-4 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Label Management</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Generate bulk labels</p>
                      </div>
                    </div>
                  </a>
                  <a 
                    href="/label-editor"
                    className="group block p-4 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-600 hover:border-green-300 dark:hover:border-green-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Label Editor</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Edit templates with live preview</p>
                      </div>
                    </div>
                  </a>
                </div>
                
                {/* Mobile hint */}
                <div className="text-center text-xs text-gray-400 dark:text-gray-500 md:hidden mt-6">
                  Use the menu button above to access additional options
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Product Dropdown - available on product page */}
              <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-gray-200 dark:border-neutral-600 mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Switch Product
                </label>
                <ProductDropdown
                  onSelectProduct={handleProductSelect}
                  selectedProduct={selectedTitle || undefined}
                  placeholder="Choose a different product..."
                  className="w-full h-10"
                />
              </div>
              
              {/* Show ProductOverview when product is selected but no field is chosen */}
              {selectedTitle && !selectedField ? (
                <ProductOverview
                  title={selectedTitle}
                  onSave={handleFieldSave}
                  onNavigate={handleProductSelect}
                />
              ) : selectedTitle && selectedField ? (
                <FieldViewer
                  title={selectedTitle || ""} 
                  selectedField={selectedField}
                  editing={editing}
                  setEditing={setEditing}
                  onSave={handleFieldSave}
                  onCancel={handleCancel}
                />
              ) : null}
            </div>
          )}
          
          {/* Brand watermark */}
          <Image 
            src="/sc_white_alt.webp" 
            alt="SpecChem Watermark"
            width={288}
            height={288}
            className="fixed right-8 bottom-8 w-72 opacity-[0.03] pointer-events-none z-0 select-none"
            draggable={false}
          />

          {/* Floating Assistant */}
          <FloatingAssistant />
        </div>
      </SidebarInset>
    </>
  );
}

export default function Home() {
  return (
    <SidebarProvider>
      <ProductsPageContent />
    </SidebarProvider>
  );
}
