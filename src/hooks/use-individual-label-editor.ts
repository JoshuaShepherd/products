import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { 
  IndividualLabelTemplate, 
  IndividualProductLabel, 
  LabelSize,
  LabelEditorState 
} from '@/types/individual-label-editor';

export function useIndividualLabelEditor(productId: number) {
  const [state, setState] = useState<LabelEditorState>({
    currentSize: '14x7',
    cssContent: '',
    originalContent: '',
    hasIndividualEdit: false,
    hasChanges: false,
    loading: false,
  });

  const supabase = createClient();

  const getBasicCSS = useCallback((size: LabelSize) => {
    const dimensions = size === '14x7' 
      ? { width: '14in', height: '7in', fontSize: '36px' }
      : { width: '5in', height: '9in', fontSize: '24px' };

    return `
/* Basic ${size} Label Template */
.label-container {
  width: ${dimensions.width};
  height: ${dimensions.height};
  margin: 0;
  padding: 20px;
  font-family: "Montserrat", Arial, sans-serif;
  position: relative;
  background: white;
  box-sizing: border-box;
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: ${dimensions.fontSize};
  font-weight: 700;
  color: #21325b;
  text-align: center;
  margin-bottom: 20px;
}

.product-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}`;
  }, []);

  const getLabelCSS = useCallback(async (size: LabelSize) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // Check for individual override first
      const { data: override, error: overrideError } = await supabase
        .from('individual_product_labels')
        .select('*')
        .eq('product_id', productId)
        .eq('label_size', size)
        .single();

      if (override && !overrideError) {
        setState(prev => ({
          ...prev,
          cssContent: override.css_content,
          originalContent: override.css_content,
          hasIndividualEdit: true,
          hasChanges: false,
          loading: false,
        }));
        return;
      }

      // Fall back to Enhanced CSS template (real production CSS with background images)
      const { data: enhancedTemplate, error: enhancedError } = await supabase
        .from('label_templates')
        .select('base_css')
        .eq('label_size', size)
        .eq('is_active', true)
        .single();

      if (enhancedTemplate?.base_css && !enhancedError) {
        const content = enhancedTemplate.base_css;
        setState(prev => ({
          ...prev,
          cssContent: content,
          originalContent: content,
          hasIndividualEdit: false,
          hasChanges: false,
          loading: false,
        }));
        return;
      }

      // Secondary fallback to individual templates
      const { data: template, error: templateError } = await supabase
        .from('individual_label_templates')
        .select('*')
        .eq('label_size', size)
        .eq('is_default', true)
        .single();

      const content = template?.css_content || getBasicCSS(size);
      
      setState(prev => ({
        ...prev,
        cssContent: content,
        originalContent: content,
        hasIndividualEdit: false,
        hasChanges: false,
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading label CSS:', error);
      const fallbackContent = getBasicCSS(size);
      setState(prev => ({
        ...prev,
        cssContent: fallbackContent,
        originalContent: fallbackContent,
        hasIndividualEdit: false,
        hasChanges: false,
        loading: false,
      }));
    }
  }, [productId, supabase, getBasicCSS]);

  const saveIndividualEdit = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('individual_product_labels')
        .upsert({
          product_id: productId,
          label_size: state.currentSize,
          css_content: state.cssContent,
        });

      if (error) throw error;

      // Record in history
      await supabase
        .from('individual_label_edit_history')
        .insert({
          product_id: productId,
          label_size: state.currentSize,
          css_content: state.cssContent,
          edit_type: 'individual',
        });

      setState(prev => ({
        ...prev,
        originalContent: prev.cssContent,
        hasIndividualEdit: true,
        hasChanges: false,
      }));

      return { success: true };
    } catch (error) {
      console.error('Error saving individual edit:', error);
      return { success: false, error };
    }
  }, [productId, state.currentSize, state.cssContent, supabase]);

  const revertToTemplate = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('individual_product_labels')
        .delete()
        .eq('product_id', productId)
        .eq('label_size', state.currentSize);

      if (error) throw error;

      await getLabelCSS(state.currentSize);
      return { success: true };
    } catch (error) {
      console.error('Error reverting to template:', error);
      return { success: false, error };
    }
  }, [productId, state.currentSize, supabase, getLabelCSS]);

  const setCurrentSize = useCallback((size: LabelSize) => {
    setState(prev => ({ ...prev, currentSize: size }));
  }, []);

  const setCssContent = useCallback((content: string) => {
    setState(prev => ({
      ...prev,
      cssContent: content,
      hasChanges: content !== prev.originalContent,
    }));
  }, []);

  useEffect(() => {
    getLabelCSS(state.currentSize);
  }, [state.currentSize, getLabelCSS]);

  return {
    ...state,
    setCurrentSize,
    setCssContent,
    saveIndividualEdit,
    revertToTemplate,
    refreshLabel: () => getLabelCSS(state.currentSize),
  };
}
