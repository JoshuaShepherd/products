import { Database } from '@/lib/database.types'

// Type definitions for canonical product data
export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

// Legacy transformed product interface for backward compatibility
export interface LegacyProduct {
  ID: string;
  Title: string;
  "Short Description English": string | null;
  Description: string | null;
  Application: string | null;
  Features: string | null;
  Coverage: string | null;
  Limitations: string | null;
  "Shelf Life": string | null;
  "VOC Data": string | null;
  "Signal Word": string | null;
  "Components Determining Hazard": string | null;
  "Hazard Statements": string | null;
  "Precautionary Statements": string | null;
  "Response Statements": string | null;
  "First Aid": string | null;
  Storage: string | null;
  Disposal: string | null;
  "Proper Shipping Name": string | null;
  "UN Number": string | null;
  "Hazard Class": string | null;
  "Packing Group": string | null;
  "Emergency Response Guide": string | null;
  "Do Not Freeze": string;
  "Mix Well": string;
  "Green Conscious": string;
  "Used By Date": string | null;
}

/**
 * Product API utilities with standardized canonical data access
 */
export class ProductAPI {
  /**
   * Fetch single product using canonical database format
   */
  static async getProduct(title: string): Promise<Product | null> {
    try {
      const response = await fetch(`/api/product?title=${encodeURIComponent(title)}&format=canonical`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.product;
    } catch (error) {
      console.error('Failed to fetch product:', error);
      return null;
    }
  }

  /**
   * Fetch all products using canonical database format
   */
  static async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch('/api/product?format=canonical');
      if (!response.ok) return [];
      const products = await response.json();
      return Array.isArray(products) ? products : [];
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return [];
    }
  }

  /**
   * Legacy method for components that still expect transformed data
   * @deprecated Use getProduct() or getProducts() with canonical format instead
   */
  static async getLegacyProduct(title: string): Promise<LegacyProduct | null> {
    try {
      const response = await fetch(`/api/product?title=${encodeURIComponent(title)}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.product;
    } catch (error) {
      console.error('Failed to fetch legacy product:', error);
      return null;
    }
  }

  /**
   * Legacy method for components that still expect transformed data
   * @deprecated Use getProduct() or getProducts() with canonical format instead
   */
  static async getLegacyProducts(): Promise<{ products: LegacyProduct[] }> {
    try {
      const response = await fetch('/api/product');
      if (!response.ok) return { products: [] };
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch legacy products:', error);
      return { products: [] };
    }
  }

  /**
   * Convert canonical product to legacy format for backward compatibility
   */
  static toLegacyFormat(product: Product): LegacyProduct {
    return {
      ID: product.id,
      Title: product.name,
      "Short Description English": product.short_description_english,
      Description: product.description,
      Application: product.application,
      Features: product.features,
      Coverage: product.coverage,
      Limitations: product.limitations,
      "Shelf Life": product.shelf_life,
      "VOC Data": product.voc_data,
      "Signal Word": product.signal_word,
      "Components Determining Hazard": product.components_determining_hazard,
      "Hazard Statements": product.hazard_statements,
      "Precautionary Statements": product.precautionary_statements,
      "Response Statements": product.response_statements,
      "First Aid": product.first_aid,
      Storage: product.storage,
      Disposal: product.disposal,
      "Proper Shipping Name": product.proper_shipping_name,
      "UN Number": product.un_number,
      "Hazard Class": product.hazard_class,
      "Packing Group": product.packing_group,
      "Emergency Response Guide": product.emergency_response_guide,
      "Do Not Freeze": product.do_not_freeze ? "true" : "false",
      "Mix Well": product.mix_well ? "true" : "false",
      "Green Conscious": product.green_conscious ? "true" : "false",
      "Used By Date": product.used_by_date
    };
  }

  /**
   * Convert legacy product to canonical format
   */
  static fromLegacyFormat(legacyProduct: LegacyProduct): Partial<Product> {
    return {
      id: legacyProduct.ID,
      name: legacyProduct.Title,
      short_description_english: legacyProduct["Short Description English"],
      description: legacyProduct.Description,
      application: legacyProduct.Application,
      features: legacyProduct.Features,
      coverage: legacyProduct.Coverage,
      limitations: legacyProduct.Limitations,
      shelf_life: legacyProduct["Shelf Life"],
      voc_data: legacyProduct["VOC Data"],
      signal_word: legacyProduct["Signal Word"] as Database['public']['Enums']['hazard_signal'],
      components_determining_hazard: legacyProduct["Components Determining Hazard"],
      hazard_statements: legacyProduct["Hazard Statements"],
      precautionary_statements: legacyProduct["Precautionary Statements"],
      response_statements: legacyProduct["Response Statements"],
      first_aid: legacyProduct["First Aid"],
      storage: legacyProduct.Storage,
      disposal: legacyProduct.Disposal,
      proper_shipping_name: legacyProduct["Proper Shipping Name"],
      un_number: legacyProduct["UN Number"],
      hazard_class: legacyProduct["Hazard Class"] as Database['public']['Enums']['hazard_class'],
      packing_group: legacyProduct["Packing Group"] as Database['public']['Enums']['packing_group'],
      emergency_response_guide: legacyProduct["Emergency Response Guide"],
      do_not_freeze: legacyProduct["Do Not Freeze"] === "true",
      mix_well: legacyProduct["Mix Well"] === "true",
      green_conscious: legacyProduct["Green Conscious"] === "true",
      used_by_date: legacyProduct["Used By Date"]
    };
  }
}

/**
 * Migration helper hook for gradual component updates
 * Use this to migrate components from legacy to canonical format
 */
export function useCanonicalProduct(title: string | null) {
  const getProduct = async (): Promise<Product | null> => {
    if (!title) return null;
    return ProductAPI.getProduct(title);
  };

  const getLegacyProduct = async (): Promise<LegacyProduct | null> => {
    if (!title) return null;
    return ProductAPI.getLegacyProduct(title);
  };

  return { getProduct, getLegacyProduct, ProductAPI };
}
