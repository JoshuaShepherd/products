"use client";
import * as React from "react"
import { ChevronDown, ChevronRight, X } from "lucide-react"
import Image from "next/image"

import { SearchForm } from "@/components/search-form"
import { VersionSwitcher } from "@/components/version-switcher"
import { UserMenu } from "@/components/auth/UserMenu"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// NEW: Fetch column headers from API
export function AppSidebar({
  onSelectProduct,
  onSelectField,
  onClose,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  onSelectProduct?: (title: string) => void;
  onSelectField?: (field: string) => void;
  onClose?: () => void;
}) {
  const [columns, setColumns] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)
  const [frenchExpanded, setFrenchExpanded] = React.useState(false)

  // Hidden fields that shouldn't appear in sidebar
  const HIDDEN_FIELDS = [
    "id", "slug", "sku", "subtitle_1", "subtitle_1", "subtitle_2", "category_id"
  ];

  // Product Information fields
  const PRODUCT_INFO_FIELDS = [
    "Name", "Description", "Application", "Features", "Coverage", "Limitations", "Shelf Life", "VOC Data"
  ];

  // Short Description fields
  const DESCRIPTION_FIELDS = [
    "Short Description (English)", "Short Description (French)", "Short Description (Spanish)"
  ];

  // SDS fields that should be grouped under the SDS section
  const SDS_FIELDS = [
    "Signal Word", "Components Determining Hazard", "Hazard Statements",
    "Precautionary Statements", "Response Statements", "First Aid", "Storage", "Disposal"
  ];

  // Transportation fields
  const TRANSPORT_FIELDS = [
    "Transport: Proper Shipping Name", "Transport: UN Number", "Transport: Hazard Class", 
    "Transport: Packing Group", "Transport: Emergency Response Guide"
  ];

  // Product feature fields 
  const FEATURE_FIELDS = [
    "Do Not Freeze", "Mix Well", "Green Conscious", "Used By Date"
  ];

  // French fields that should be grouped under the French dropdown
  const FRENCH_FIELDS = [
    "Composants Déterminant le Danger", "Mot de Signalement", "Mentions de Danger",
    "Conseils de Prudence", "Premiers Soins", "Mesures de Premiers Secours", 
    "Consignes de Stockage", "Consignes d'Élimination"
  ];

  // Visual fields
  const VISUAL_FIELDS = [
    "Pictograms"
  ];

  // System fields
  const SYSTEM_FIELDS = [
    "Is Active", "Sort Order", "Created At", "Updated At"
  ];

  // Helper function to determine which section a field belongs to
  const getFieldSection = (field: string) => {
    if (PRODUCT_INFO_FIELDS.includes(field)) return 'info';
    if (DESCRIPTION_FIELDS.includes(field)) return 'descriptions';
    if (SDS_FIELDS.includes(field)) return 'sds';
    if (TRANSPORT_FIELDS.includes(field)) return 'transport';
    if (FEATURE_FIELDS.includes(field)) return 'features';
    if (FRENCH_FIELDS.includes(field)) return 'french';
    if (VISUAL_FIELDS.includes(field)) return 'visual';
    if (SYSTEM_FIELDS.includes(field)) return 'system';
    return 'other';
  };

  React.useEffect(() => {
    fetch("/api/columns")
      .then((res) => res.json())
      .then((data) => {
        // Get all fields and filter out hidden ones
        let fields = data.columns || [];
        fields = fields.filter((field: string) => !HIDDEN_FIELDS.includes(field));
        
        setColumns(fields);
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <Sidebar {...props}>
      <SidebarHeader className="relative">
        {/* Mobile close button with branded arrow */}
        {onClose && (
          <button
            className="absolute top-2 right-2 z-[60] p-3 rounded-full bg-white shadow-lg border-2 border-gray-200 transition-all duration-200 hover:scale-105 active:scale-95 md:hidden dark:bg-neutral-800 dark:border-neutral-600"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-gray-600 dark:text-gray-300"
            >
              <path
                d="M14 7L9 12L14 17"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span className="sr-only">Close</span>
          </button>
        )}
        
        {/* SpecChem branding and user menu */}
        <div className="flex items-center justify-between py-2">
          <Image 
            src="/sc_black_watermark.webp" 
            alt="SpecChem"
            width={32}
            height={32}
            className="h-8 opacity-60"
            draggable={false}
          />
          <UserMenu />
        </div>
        
        <VersionSwitcher
          versions={["1.0.1"]} // (optional, keep if you want)
          defaultVersion="1.0.1"
        />
        <SearchForm onSelectProduct={onSelectProduct || (() => {})} />
      </SidebarHeader>
      <SidebarContent>
        {/* Navigation Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a 
                    href="/labels"
                    className="w-full text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Labels
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a 
                    href="/label-editor"
                    className="w-full text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Label Editor
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a 
                    href="/batch-editor"
                    className="w-full text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Batch Editor
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a 
                    href="/products/bulk-import"
                    className="w-full text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Bulk Import
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a 
                    href="/products/create"
                    className="w-full text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Product
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a 
                    href="/label-maker"
                    className="w-full text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    Label Maker
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
              {/* <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a 
                    href="/css-editor"
                    className="w-full text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5v12a2 2 0 002 2 2 2 0 002-2V3zM21 21v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2" />
                    </svg>
                    CSS Editor
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
              {/* <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a 
                    href="/enhanced-css"
                    className="w-full text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10M5 8h14l-1 9H6L5 8z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6" />
                    </svg>
                    Enhanced CSS
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Product Information Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Product Information</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <span>Loading…</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {columns
                .filter(col => PRODUCT_INFO_FIELDS.includes(col))
                .map((col) => (
                  <SidebarMenuItem key={col}>
                    <SidebarMenuButton asChild>
                      <button
                        className="w-full text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        onClick={() => onSelectField?.(col)}
                      >
                        {col}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Descriptions Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Descriptions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {columns
                .filter(col => DESCRIPTION_FIELDS.includes(col))
                .map((col) => (
                  <SidebarMenuItem key={col}>
                    <SidebarMenuButton asChild>
                      <button
                        className="w-full text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        onClick={() => onSelectField?.(col)}
                      >
                        {col}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* SDS Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Safety Data Sheet</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {columns
                .filter(col => SDS_FIELDS.includes(col))
                .map((col) => (
                  <SidebarMenuItem key={col}>
                    <SidebarMenuButton asChild>
                      <button
                        className="w-full text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        onClick={() => onSelectField?.(col)}
                      >
                        {col}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Transportation Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Transportation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {columns
                .filter(col => TRANSPORT_FIELDS.includes(col))
                .map((col) => (
                  <SidebarMenuItem key={col}>
                    <SidebarMenuButton asChild>
                      <button
                        className="w-full text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        onClick={() => onSelectField?.(col)}
                      >
                        {col}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Product Features Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Product Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {columns
                .filter(col => FEATURE_FIELDS.includes(col))
                .map((col) => (
                  <SidebarMenuItem key={col}>
                    <SidebarMenuButton asChild>
                      <button
                        className="w-full text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        onClick={() => onSelectField?.(col)}
                      >
                        {col}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Visual Elements Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Visual Elements</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {columns
                .filter(col => VISUAL_FIELDS.includes(col))
                .map((col) => (
                  <SidebarMenuItem key={col}>
                    <SidebarMenuButton asChild>
                      <button
                        className="w-full text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        onClick={() => onSelectField?.(col)}
                      >
                        {col}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* French Section */}
        <SidebarGroup>
          <SidebarGroupLabel>French SDS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    className="w-full text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center justify-between"
                    onClick={() => setFrenchExpanded(!frenchExpanded)}
                  >
                    <span>French Fields</span>
                    {frenchExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {frenchExpanded && columns
                .filter(col => FRENCH_FIELDS.includes(col))
                .map((frenchField) => (
                <SidebarMenuItem key={frenchField}>
                  <SidebarMenuButton asChild>
                    <button
                      className="w-full text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground pl-6"
                      onClick={() => onSelectField?.(frenchField)}
                    >
                      {frenchField}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Fields Section */}
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {columns
                .filter(col => SYSTEM_FIELDS.includes(col))
                .map((col) => (
                  <SidebarMenuItem key={col}>
                    <SidebarMenuButton asChild>
                      <button
                        className="w-full text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        onClick={() => onSelectField?.(col)}
                      >
                        {col}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}