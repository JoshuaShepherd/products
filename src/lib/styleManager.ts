// src/lib/styleManager.ts
import { createClient } from '@/utils/supabase/client';

export interface StyleTemplate {
  id: string;
  name: string;
  description?: string;
  css_content: string;
  variables: Record<string, any>;
  is_active: boolean;
  version: number;
}

export interface CSSVariable {
  id: string;
  template_id: string;
  variable_name: string;
  variable_value: string;
  description?: string;
  variable_type: string;
}

export class StyleManager {
  private supabase = createClient();

  async getTemplate(templateId: string): Promise<StyleTemplate | null> {
    const { data, error } = await this.supabase
      .from('style_templates')
      .select('*')
      .eq('id', templateId)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  }

  async getDefaultTemplate(): Promise<StyleTemplate | null> {
    const { data, error } = await this.supabase
      .from('style_templates')
      .select('*')
      .eq('name', 'Default Label Template')
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  }

  async updateTemplate(templateId: string, cssContent: string, variables?: Record<string, any>) {
    // First get current version
    const { data: currentTemplate } = await this.supabase
      .from('style_templates')
      .select('version')
      .eq('id', templateId)
      .single();

    const { data, error } = await this.supabase
      .from('style_templates')
      .update({ 
        css_content: cssContent,
        variables: variables || {},
        version: (currentTemplate?.version || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getProductStyleOverrides(productId: string, templateId: string) {
    const { data, error } = await this.supabase
      .from('product_style_overrides')
      .select('*')
      .eq('product_id', productId)
      .eq('template_id', templateId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  }

  async saveProductStyleOverride(
    productId: string, 
    templateId: string, 
    customCss: string, 
    customVariables?: Record<string, any>
  ) {
    const { data, error } = await this.supabase
      .from('product_style_overrides')
      .upsert({
        product_id: productId,
        template_id: templateId,
        custom_css: customCss,
        custom_variables: customVariables || {}
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getCSSVariables(templateId: string): Promise<CSSVariable[]> {
    const { data, error } = await this.supabase
      .from('css_variables')
      .select('*')
      .eq('template_id', templateId)
      .order('variable_name');

    if (error) throw error;
    return data || [];
  }

  // Process CSS with variable substitution
  processCSS(cssContent: string, variables: Record<string, any>): string {
    let processedCSS = cssContent;
    
    // Replace CSS custom properties
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`var\\(--${key}\\)`, 'g');
      processedCSS = processedCSS.replace(regex, value);
    });

    return processedCSS;
  }

  // Extract variables from your current CSS for easy editing
  extractVariablesFromCSS(cssContent: string): Record<string, string> {
    const variables: Record<string, string> = {};
    
    // Extract colors
    const colorMatches = cssContent.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/g);
    if (colorMatches) {
      colorMatches.forEach((color, index) => {
        variables[`color-${index + 1}`] = color;
      });
    }

    // Extract font families
    const fontMatches = cssContent.match(/font-family:\s*['"]([^'"]+)['"]/g);
    if (fontMatches) {
      fontMatches.forEach((match, index) => {
        const font = match.match(/['"]([^'"]+)['"]/)?.[1];
        if (font) variables[`font-${index + 1}`] = font;
      });
    }

    // Extract font sizes
    const sizeMatches = cssContent.match(/font-size:\s*(\d+(?:\.\d+)?px)/g);
    if (sizeMatches) {
      sizeMatches.forEach((match, index) => {
        const size = match.match(/(\d+(?:\.\d+)?px)/)?.[1];
        if (size) variables[`size-${index + 1}`] = size;
      });
    }

    return variables;
  }
}
