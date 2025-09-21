
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      application_methods: {
        Row: {
          coverage_rate: string | null
          created_at: string | null
          equipment_required: string | null
          id: string
          instructions: string
          method_name: string
          product_id: string | null
          sort_order: number | null
          temperature_range: string | null
        }
        Insert: {
          coverage_rate?: string | null
          created_at?: string | null
          equipment_required?: string | null
          id?: string
          instructions: string
          method_name: string
          product_id?: string | null
          sort_order?: number | null
          temperature_range?: string | null
        }
        Update: {
          coverage_rate?: string | null
          created_at?: string | null
          equipment_required?: string | null
          id?: string
          instructions?: string
          method_name?: string
          product_id?: string | null
          sort_order?: number | null
          temperature_range?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_methods_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_methods_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_methods_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_pictograms"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      label_template_versions: {
        Row: {
          change_notes: string | null
          created_at: string | null
          created_by: string | null
          css_template: string
          html_template: string
          id: string
          is_published: boolean | null
          template_id: string | null
          version_number: number
        }
        Insert: {
          change_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          css_template: string
          html_template: string
          id?: string
          is_published?: boolean | null
          template_id?: string | null
          version_number: number
        }
        Update: {
          change_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          css_template?: string
          html_template?: string
          id?: string
          is_published?: boolean | null
          template_id?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "label_template_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "label_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      label_templates: {
        Row: {
          created_at: string | null
          css_template: string
          description: string | null
          height_mm: number | null
          html_template: string
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
          width_mm: number | null
        }
        Insert: {
          created_at?: string | null
          css_template: string
          description?: string | null
          height_mm?: number | null
          html_template: string
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
          width_mm?: number | null
        }
        Update: {
          created_at?: string | null
          css_template?: string
          description?: string | null
          height_mm?: number | null
          html_template?: string
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
          width_mm?: number | null
        }
        Relationships: []
      }
      layout_presets: {
        Row: {
          description: string | null
          flex_template: string | null
          grid_template: string | null
          id: string
          is_active: boolean | null
          name: string
          preset_css: string | null
          thumbnail_url: string | null
        }
        Insert: {
          description?: string | null
          flex_template?: string | null
          grid_template?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          preset_css?: string | null
          thumbnail_url?: string | null
        }
        Update: {
          description?: string | null
          flex_template?: string | null
          grid_template?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          preset_css?: string | null
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      pictograms: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          url?: string
        }
        Relationships: []
      }
      product_labels: {
        Row: {
          created_at: string | null
          generated_html: string | null
          id: string
          is_current: boolean | null
          language: string | null
          pdf_url: string | null
          product_id: string | null
          template_id: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          generated_html?: string | null
          id?: string
          is_current?: boolean | null
          language?: string | null
          pdf_url?: string | null
          product_id?: string | null
          template_id?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          generated_html?: string | null
          id?: string
          is_current?: boolean | null
          language?: string | null
          pdf_url?: string | null
          product_id?: string | null
          template_id?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_labels_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_labels_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_labels_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_pictograms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_labels_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "label_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      product_media: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          media_type: string
          product_id: string | null
          sort_order: number | null
          url: string
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          media_type: string
          product_id?: string | null
          sort_order?: number | null
          url: string
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          media_type?: string
          product_id?: string | null
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_pictograms"
            referencedColumns: ["id"]
          },
        ]
      }
      product_pictograms: {
        Row: {
          created_at: string | null
          id: string
          pictogram_id: string | null
          product_id: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pictogram_id?: string | null
          product_id?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pictogram_id?: string | null
          product_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_pictograms_pictogram_id_fkey"
            columns: ["pictogram_id"]
            isOneToOne: false
            referencedRelation: "pictograms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_pictograms_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_pictograms_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_pictograms_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_pictograms"
            referencedColumns: ["id"]
          },
        ]
      }
      product_specifications: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          sort_order: number | null
          spec_name: string
          spec_value: string
          test_method: string | null
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          sort_order?: number | null
          spec_name: string
          spec_value: string
          test_method?: string | null
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          sort_order?: number | null
          spec_name?: string
          spec_value?: string
          test_method?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_pictograms"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number | null
          product_id: string | null
          size: string | null
          sku: string | null
          unit: string | null
          updated_at: string | null
          volume_liters: number | null
          weight_kg: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
          product_id?: string | null
          size?: string | null
          sku?: string | null
          unit?: string | null
          updated_at?: string | null
          volume_liters?: number | null
          weight_kg?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
          product_id?: string | null
          size?: string | null
          sku?: string | null
          unit?: string | null
          updated_at?: string | null
          volume_liters?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_pictograms"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          application: string | null
          category_id: string | null
          components_determining_hazard: string | null
          composants_determinant_le_danger: string | null
          conseils_de_prudence: string | null
          consignes_de_stockage: string | null
          consignes_delimination: string | null
          coverage: string | null
          created_at: string | null
          description: string | null
          disposal: string | null
          do_not_freeze: boolean | null
          emergency_response_guide: string | null
          features: string | null
          first_aid: string | null
          green_conscious: boolean | null
          hazard_class: Database["public"]["Enums"]["hazard_class"] | null
          hazard_statements: string | null
          id: string
          is_active: boolean | null
          limitations: string | null
          mentions_de_danger: string | null
          mesures_de_premiers_secours: string | null
          mix_well: boolean | null
          mot_de_signalement: string | null
          name: string
          packing_group: Database["public"]["Enums"]["packing_group"] | null
          pictograms: string | null
          precautionary_statements: string | null
          premiers_soins: string | null
          proper_shipping_name: string | null
          response_statements: string | null
          shelf_life: string | null
          short_description_english: string | null
          short_description_french: string | null
          short_description_spanish: string | null
          signal_word: Database["public"]["Enums"]["hazard_signal"] | null
          sku: string | null
          slug: string
          sort_order: number | null
          storage: string | null
          subtitle_1: string | null
          subtitle_2: string | null
          un_number: string | null
          updated_at: string | null
          used_by_date: string | null
          voc_data: string | null
        }
        Insert: {
          application?: string | null
          category_id?: string | null
          components_determining_hazard?: string | null
          composants_determinant_le_danger?: string | null
          conseils_de_prudence?: string | null
          consignes_de_stockage?: string | null
          consignes_delimination?: string | null
          coverage?: string | null
          created_at?: string | null
          description?: string | null
          disposal?: string | null
          do_not_freeze?: boolean | null
          emergency_response_guide?: string | null
          features?: string | null
          first_aid?: string | null
          green_conscious?: boolean | null
          hazard_class?: Database["public"]["Enums"]["hazard_class"] | null
          hazard_statements?: string | null
          id?: string
          is_active?: boolean | null
          limitations?: string | null
          mentions_de_danger?: string | null
          mesures_de_premiers_secours?: string | null
          mix_well?: boolean | null
          mot_de_signalement?: string | null
          name: string
          packing_group?: Database["public"]["Enums"]["packing_group"] | null
          pictograms?: string | null
          precautionary_statements?: string | null
          premiers_soins?: string | null
          proper_shipping_name?: string | null
          response_statements?: string | null
          shelf_life?: string | null
          short_description_english?: string | null
          short_description_french?: string | null
          short_description_spanish?: string | null
          signal_word?: Database["public"]["Enums"]["hazard_signal"] | null
          sku?: string | null
          slug: string
          sort_order?: number | null
          storage?: string | null
          subtitle_1?: string | null
          subtitle_2?: string | null
          un_number?: string | null
          updated_at?: string | null
          used_by_date?: string | null
          voc_data?: string | null
        }
        Update: {
          application?: string | null
          category_id?: string | null
          components_determining_hazard?: string | null
          composants_determinant_le_danger?: string | null
          conseils_de_prudence?: string | null
          consignes_de_stockage?: string | null
          consignes_delimination?: string | null
          coverage?: string | null
          created_at?: string | null
          description?: string | null
          disposal?: string | null
          do_not_freeze?: boolean | null
          emergency_response_guide?: string | null
          features?: string | null
          first_aid?: string | null
          green_conscious?: boolean | null
          hazard_class?: Database["public"]["Enums"]["hazard_class"] | null
          hazard_statements?: string | null
          id?: string
          is_active?: boolean | null
          limitations?: string | null
          mentions_de_danger?: string | null
          mesures_de_premiers_secours?: string | null
          mix_well?: boolean | null
          mot_de_signalement?: string | null
          name?: string
          packing_group?: Database["public"]["Enums"]["packing_group"] | null
          pictograms?: string | null
          precautionary_statements?: string | null
          premiers_soins?: string | null
          proper_shipping_name?: string | null
          response_statements?: string | null
          shelf_life?: string | null
          short_description_english?: string | null
          short_description_french?: string | null
          short_description_spanish?: string | null
          signal_word?: Database["public"]["Enums"]["hazard_signal"] | null
          sku?: string | null
          slug?: string
          sort_order?: number | null
          storage?: string | null
          subtitle_1?: string | null
          subtitle_2?: string | null
          un_number?: string | null
          updated_at?: string | null
          used_by_date?: string | null
          voc_data?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      template_components: {
        Row: {
          component_type: string
          created_at: string | null
          css_template: string | null
          html_template: string
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          component_type: string
          created_at?: string | null
          css_template?: string | null
          html_template: string
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          component_type?: string
          created_at?: string | null
          css_template?: string | null
          html_template?: string
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      template_css_variables: {
        Row: {
          created_at: string | null
          id: string
          template_id: string | null
          variable_name: string
          variable_type: string | null
          variable_value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          template_id?: string | null
          variable_name: string
          variable_type?: string | null
          variable_value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          template_id?: string | null
          variable_name?: string
          variable_type?: string | null
          variable_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_css_variables_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "label_templates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      products_with_category: {
        Row: {
          application: string | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          components_determining_hazard: string | null
          composants_determinant_le_danger: string | null
          conseils_de_prudence: string | null
          consignes_de_stockage: string | null
          consignes_delimination: string | null
          coverage: string | null
          created_at: string | null
          description: string | null
          disposal: string | null
          do_not_freeze: boolean | null
          emergency_response_guide: string | null
          features: string | null
          first_aid: string | null
          green_conscious: boolean | null
          hazard_class: Database["public"]["Enums"]["hazard_class"] | null
          hazard_statements: string | null
          id: string | null
          is_active: boolean | null
          limitations: string | null
          mentions_de_danger: string | null
          mesures_de_premiers_secours: string | null
          mix_well: boolean | null
          mot_de_signalement: string | null
          name: string | null
          packing_group: Database["public"]["Enums"]["packing_group"] | null
          precautionary_statements: string | null
          premiers_soins: string | null
          proper_shipping_name: string | null
          response_statements: string | null
          shelf_life: string | null
          short_description_english: string | null
          short_description_french: string | null
          short_description_spanish: string | null
          signal_word: Database["public"]["Enums"]["hazard_signal"] | null
          sku: string | null
          slug: string | null
          sort_order: number | null
          storage: string | null
          subtitle_1: string | null
          subtitle_2: string | null
          un_number: string | null
          updated_at: string | null
          used_by_date: string | null
          voc_data: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      products_with_pictograms: {
        Row: {
          application: string | null
          category_id: string | null
          components_determining_hazard: string | null
          composants_determinant_le_danger: string | null
          conseils_de_prudence: string | null
          consignes_de_stockage: string | null
          consignes_delimination: string | null
          coverage: string | null
          created_at: string | null
          description: string | null
          disposal: string | null
          do_not_freeze: boolean | null
          emergency_response_guide: string | null
          features: string | null
          first_aid: string | null
          green_conscious: boolean | null
          hazard_class: Database["public"]["Enums"]["hazard_class"] | null
          hazard_statements: string | null
          id: string | null
          is_active: boolean | null
          limitations: string | null
          mentions_de_danger: string | null
          mesures_de_premiers_secours: string | null
          mix_well: boolean | null
          mot_de_signalement: string | null
          name: string | null
          packing_group: Database["public"]["Enums"]["packing_group"] | null
          pictogram_names: string[] | null
          pictogram_urls: string[] | null
          precautionary_statements: string | null
          premiers_soins: string | null
          proper_shipping_name: string | null
          response_statements: string | null
          shelf_life: string | null
          short_description_english: string | null
          short_description_french: string | null
          short_description_spanish: string | null
          signal_word: Database["public"]["Enums"]["hazard_signal"] | null
          sku: string | null
          slug: string | null
          sort_order: number | null
          storage: string | null
          subtitle_1: string | null
          subtitle_2: string | null
          un_number: string | null
          updated_at: string | null
          used_by_date: string | null
          voc_data: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      hazard_class:
        | "Class 1"
        | "Class 2"
        | "Class 3"
        | "Class 4"
        | "Class 5"
        | "Class 6"
        | "Class 7"
        | "Class 8"
        | "Class 9"
        | "Not applicable"
      hazard_signal: "Danger" | "Warning" | "None"
      packing_group: "PG I" | "PG II" | "PG III" | "Not applicable"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      hazard_class: [
        "Class 1",
        "Class 2",
        "Class 3",
        "Class 4",
        "Class 5",
        "Class 6",
        "Class 7",
        "Class 8",
        "Class 9",
        "Not applicable",
      ],
      hazard_signal: ["Danger", "Warning", "None"],
      packing_group: ["PG I", "PG II", "PG III", "Not applicable"],
    },
  },
} as const
