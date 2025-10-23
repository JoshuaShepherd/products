import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface ExtractionRun {
  id: string;
  product_candidate: string | null;
  product_id: string | null;
  document_type: string;
  source_file_path: string;
  raw_text: string | null;
  extracted_json: any;
  confidence: string;
  needs_manual_review: boolean;
  status: string;
  error: string | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  run_id: string;
  product_id: string | null;
  field: string;
  old_value: any;
  new_value: any;
  action: string;
  reason: string;
  created_at: string;
}

export interface ExtractionRunWithAudit extends ExtractionRun {
  audit_log: AuditLogEntry[];
}

export class DatabaseAPI {
  // Extraction Runs
  static async getExtractionRunById(runId: string): Promise<ExtractionRunWithAudit | null> {
    try {
      const { data, error } = await supabase
        .from('extraction_runs')
        .select(`
          *,
          audit_log (
            id,
            field,
            old_value,
            new_value,
            action,
            reason,
            created_at
          )
        `)
        .eq('id', runId)
        .single();

      if (error) {
        console.error('Error fetching extraction run:', error);
        return null;
      }

      return data as ExtractionRunWithAudit;
    } catch (error) {
      console.error('Error in getExtractionRunById:', error);
      return null;
    }
  }

  static async getExtractionRuns(options: {
    productId?: string;
    filePath?: string;
    limit?: number;
  } = {}): Promise<ExtractionRun[]> {
    try {
      const { productId, filePath, limit = 20 } = options;

      let query = supabase
        .from('extraction_runs')
        .select(`
          id,
          product_candidate,
          product_id,
          document_type,
          source_file_path,
          confidence,
          needs_manual_review,
          status,
          error,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (productId) {
        query = query.eq('product_id', productId);
      }

      if (filePath) {
        query = query.eq('source_file_path', filePath);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching extraction runs:', error);
        return [];
      }

      return data as ExtractionRun[];
    } catch (error) {
      console.error('Error in getExtractionRuns:', error);
      return [];
    }
  }

  // Products
  static async getProductById(productId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getProductById:', error);
      return null;
    }
  }

  static async getProductByName(productName: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${productName}%`)
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching product by name:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getProductByName:', error);
      return null;
    }
  }
}

// Export for backward compatibility
export const db = DatabaseAPI;
