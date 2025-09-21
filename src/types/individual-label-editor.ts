// src/types/individual-label-editor.ts
export interface IndividualLabelTemplate {
  id: string;
  name: string;
  template_html: string;
  css_content: string;
  size: LabelSize;
  created_at: string;
  updated_at: string;
}

export interface IndividualProductLabel {
  id: string;
  product_id: string;
  template_id: string;
  css_content: string;
  size: LabelSize;
  created_at: string;
  updated_at: string;
  template?: IndividualLabelTemplate;
}

export type LabelSize = '14x7' | '5x9' | '10x10' | 'custom';

export interface LabelEditorState {
  currentSize: LabelSize;
  cssContent: string;
  originalContent: string;
  hasIndividualEdit: boolean;
  hasChanges: boolean;
  loading: boolean;
}

export interface LabelEditorActions {
  loadTemplate: (size: LabelSize) => Promise<void>;
  saveTemplate: () => Promise<void>;
  resetToOriginal: () => void;
  updateContent: (content: string) => void;
  setCurrentSize: (size: LabelSize) => void;
}
