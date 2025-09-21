/**
 * CSS Compiler for Label Templates
 * Compiles and processes CSS for label generation
 */

export interface CSSLayer {
  id: string;
  name: string;
  css: string;
  enabled: boolean;
  priority: number;
  source?: string;
  description?: string;
}

export interface CompilationResult {
  success: boolean;
  css: string;
  errors: string[];
  warnings: string[];
  cacheHit?: boolean;
  compilationTimeMs?: number;
  layers?: Array<{
    source: string;
    css: string;
    priority: number;
    description: string;
  }>;
}

export class LabelCSSCompiler {
  private layers: CSSLayer[] = [];

  /**
   * Add a CSS layer to the compiler
   */
  addLayer(layer: CSSLayer): void {
    this.layers.push(layer);
    this.layers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Remove a CSS layer by ID
   */
  removeLayer(id: string): void {
    this.layers = this.layers.filter(layer => layer.id !== id);
  }

  /**
   * Compile all enabled layers into a single CSS string
   */
  compile(): CompilationResult {
    const result: CompilationResult = {
      success: true,
      css: '',
      errors: [],
      warnings: []
    };

    try {
      const enabledLayers = this.layers.filter(layer => layer.enabled);
      
      if (enabledLayers.length === 0) {
        result.warnings.push('No CSS layers are enabled');
      }

      // Combine all CSS from enabled layers
      const combinedCSS = enabledLayers
        .map(layer => {
          // Add a comment to identify the layer
          return `/* Layer: ${layer.name} (Priority: ${layer.priority}) */\n${layer.css}`;
        })
        .join('\n\n');

      result.css = this.processCSSVariables(combinedCSS);
      
      // Basic CSS validation
      const validation = this.validateCSS(result.css);
      result.errors = validation.errors;
      result.warnings.push(...validation.warnings);
      
      if (result.errors.length > 0) {
        result.success = false;
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Compilation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Process CSS variables and custom functions
   */
  private processCSSVariables(css: string): string {
    // Replace common CSS variables with their values
    const processedCSS = css;

    // Add basic variable processing here if needed
    // For now, just return the CSS as-is
    return processedCSS;
  }

  /**
   * Basic CSS validation
   */
  private validateCSS(css: string): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for unclosed braces
    const openBraces = (css.match(/{/g) || []).length;
    const closeBraces = (css.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      errors.push(`Mismatched braces: ${openBraces} opening, ${closeBraces} closing`);
    }

    // Check for common CSS issues
    if (css.includes('undefined')) {
      warnings.push('CSS contains "undefined" values');
    }

    if (css.length === 0) {
      warnings.push('CSS is empty');
    }

    return { errors, warnings };
  }

  /**
   * Get all layers
   */
  getLayers(): CSSLayer[] {
    return [...this.layers];
  }

  /**
   * Clear all layers
   */
  clearLayers(): void {
    this.layers = [];
  }

  /**
   * Invalidate cache (placeholder for future caching implementation)
   */
  async invalidateCache(productId: any, labelSize: string): Promise<void> {
    // This is a placeholder for future cache invalidation logic
    // For now, just clear the layers to simulate cache invalidation
    console.log(`Invalidating cache for product ${productId}, label size ${labelSize}`);
  }

  /**
   * Create a default layer structure for labels
   */
  static createDefaultLayers(): CSSLayer[] {
    return [
      {
        id: 'base',
        name: 'Base Styles',
        css: `
          .label-container {
            font-family: Arial, sans-serif;
            box-sizing: border-box;
            background: white;
            color: black;
          }
        `,
        enabled: true,
        priority: 1
      },
      {
        id: 'layout',
        name: 'Layout',
        css: `
          .label-header {
            margin-bottom: 8px;
          }
          
          .label-content {
            padding: 8px;
          }
        `,
        enabled: true,
        priority: 2
      },
      {
        id: 'typography',
        name: 'Typography',
        css: `
          .product-name {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 4px;
          }
          
          .signal-word {
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .signal-word.danger {
            color: red;
          }
          
          .signal-word.warning {
            color: orange;
          }
        `,
        enabled: true,
        priority: 3
      }
    ];
  }
}
