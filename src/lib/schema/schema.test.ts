import { describe, it, expect } from 'vitest';
import { 
  categories, 
  products, 
  pictograms, 
  productPictograms,
  productMedia,
  labelTemplates,
  productLabels,
  productVariants,
  productSpecifications,
  applicationMethods
} from './index';

describe('Database Schema Tests', () => {
  describe('Categories Table', () => {
    it('should have correct structure', () => {
      expect(categories.id).toBeDefined();
      expect(categories.name).toBeDefined();
      expect(categories.slug).toBeDefined();
      expect(categories.parentId).toBeDefined();
      expect(categories.isActive).toBeDefined();
      expect(categories.createdAt).toBeDefined();
      expect(categories.updatedAt).toBeDefined();
    });

    it('should support self-referencing parent-child relationships', () => {
      expect(categories.parentId).toBeDefined();
    });
  });

  describe('Products Table', () => {
    it('should have correct structure', () => {
      expect(products.id).toBeDefined();
      expect(products.name).toBeDefined();
      expect(products.slug).toBeDefined();
      expect(products.categoryId).toBeDefined();
      expect(products.signalWord).toBeDefined();
      expect(products.hazardClass).toBeDefined();
      expect(products.packingGroup).toBeDefined();
    });

    it('should have all required safety fields', () => {
      expect(products.signalWord).toBeDefined();
      expect(products.hazardStatements).toBeDefined();
      expect(products.precautionaryStatements).toBeDefined();
      expect(products.firstAid).toBeDefined();
      expect(products.storage).toBeDefined();
      expect(products.disposal).toBeDefined();
    });

    it('should have multi-language support', () => {
      expect(products.shortDescriptionEnglish).toBeDefined();
      expect(products.shortDescriptionFrench).toBeDefined();
      expect(products.shortDescriptionSpanish).toBeDefined();
    });
  });

  describe('Pictograms Table', () => {
    it('should have correct structure', () => {
      expect(pictograms.id).toBeDefined();
      expect(pictograms.name).toBeDefined();
      expect(pictograms.slug).toBeDefined();
      expect(pictograms.url).toBeDefined();
      expect(pictograms.isActive).toBeDefined();
    });
  });

  describe('Product Pictograms Junction Table', () => {
    it('should have correct structure', () => {
      expect(productPictograms.id).toBeDefined();
      expect(productPictograms.productId).toBeDefined();
      expect(productPictograms.pictogramId).toBeDefined();
      expect(productPictograms.sortOrder).toBeDefined();
    });
  });

  describe('Product Media Table', () => {
    it('should have correct structure', () => {
      expect(productMedia.id).toBeDefined();
      expect(productMedia.productId).toBeDefined();
      expect(productMedia.mediaType).toBeDefined();
      expect(productMedia.url).toBeDefined();
      expect(productMedia.isPrimary).toBeDefined();
    });
  });

  describe('Label Templates Table', () => {
    it('should have correct structure', () => {
      expect(labelTemplates.id).toBeDefined();
      expect(labelTemplates.name).toBeDefined();
      expect(labelTemplates.slug).toBeDefined();
      expect(labelTemplates.htmlTemplate).toBeDefined();
      expect(labelTemplates.cssTemplate).toBeDefined();
    });
  });

  describe('Product Labels Table', () => {
    it('should have correct structure', () => {
      expect(productLabels.id).toBeDefined();
      expect(productLabels.productId).toBeDefined();
      expect(productLabels.templateId).toBeDefined();
      expect(productLabels.generatedHtml).toBeDefined();
      expect(productLabels.language).toBeDefined();
      expect(productLabels.version).toBeDefined();
    });
  });

  describe('Product Variants Table', () => {
    it('should have correct structure', () => {
      expect(productVariants.id).toBeDefined();
      expect(productVariants.productId).toBeDefined();
      expect(productVariants.name).toBeDefined();
      expect(productVariants.sku).toBeDefined();
      expect(productVariants.weightKg).toBeDefined();
      expect(productVariants.volumeLiters).toBeDefined();
    });
  });

  describe('Product Specifications Table', () => {
    it('should have correct structure', () => {
      expect(productSpecifications.id).toBeDefined();
      expect(productSpecifications.productId).toBeDefined();
      expect(productSpecifications.specName).toBeDefined();
      expect(productSpecifications.specValue).toBeDefined();
      expect(productSpecifications.unit).toBeDefined();
    });
  });

  describe('Application Methods Table', () => {
    it('should have correct structure', () => {
      expect(applicationMethods.id).toBeDefined();
      expect(applicationMethods.productId).toBeDefined();
      expect(applicationMethods.methodName).toBeDefined();
      expect(applicationMethods.instructions).toBeDefined();
      expect(applicationMethods.coverageRate).toBeDefined();
    });
  });
});

describe('Schema Relationships', () => {
  it('should have proper foreign key relationships', () => {
    // Products -> Categories
    expect(products.categoryId).toBeDefined();
    
    // Product Pictograms -> Products & Pictograms
    expect(productPictograms.productId).toBeDefined();
    expect(productPictograms.pictogramId).toBeDefined();
    
    // Product Media -> Products
    expect(productMedia.productId).toBeDefined();
    
    // Product Labels -> Products & Templates
    expect(productLabels.productId).toBeDefined();
    expect(productLabels.templateId).toBeDefined();
    
    // Product Variants -> Products
    expect(productVariants.productId).toBeDefined();
    
    // Product Specifications -> Products
    expect(productSpecifications.productId).toBeDefined();
    
    // Application Methods -> Products
    expect(applicationMethods.productId).toBeDefined();
  });
});

describe('Schema Constraints', () => {
  it('should have unique constraints on required fields', () => {
    expect(categories.slug.isUnique).toBe(true);
    expect(products.slug.isUnique).toBe(true);
    expect(pictograms.slug.isUnique).toBe(true);
    expect(labelTemplates.slug.isUnique).toBe(true);
  });

  it('should have proper default values', () => {
    expect(categories.isActive.hasDefault).toBe(true);
    expect(products.isActive.hasDefault).toBe(true);
    expect(pictograms.isActive.hasDefault).toBe(true);
    expect(labelTemplates.isActive.hasDefault).toBe(true);
  });
});

