export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type GenerationSessionStatus =
  | "draft"
  | "uploaded"
  | "template_selected"
  | "generating"
  | "preview_ready"
  | "failed"
  | "converted_to_order";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "preparing_final"
  | "print_ready"
  | "printing"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "revision_requested"
  | "cancelled";

export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";

export type AIProvider = "mock" | "openai" | "replicate" | "gemini";

export type PrintOption = "digital" | "a4_print" | "a3_print" | "digital_plus_print";

export type OrderItemType = "digital_file" | "a4_print" | "a3_print" | "digital_plus_print";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type AITemplate = Database["public"]["Tables"]["ai_templates"]["Row"];
export type GenerationSession = Database["public"]["Tables"]["generation_sessions"]["Row"];
export type UploadedImage = Database["public"]["Tables"]["uploaded_images"]["Row"];
export type GeneratedOutput = Database["public"]["Tables"]["generated_outputs"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type PrintJob = Database["public"]["Tables"]["print_jobs"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type AdminNote = Database["public"]["Tables"]["admin_notes"]["Row"];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          full_name: string | null;
          phone: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ai_templates: {
        Row: {
          id: string;
          slug: string;
          title_mn: string;
          title_en: string | null;
          category: string | null;
          description_mn: string | null;
          preview_image_url: string | null;
          required_images_min: number;
          required_images_max: number;
          prompt: string;
          negative_prompt: string | null;
          default_aspect_ratio: string;
          output_type: string;
          requires_admin_review: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title_mn: string;
          title_en?: string | null;
          category?: string | null;
          description_mn?: string | null;
          preview_image_url?: string | null;
          required_images_min?: number;
          required_images_max?: number;
          prompt: string;
          negative_prompt?: string | null;
          default_aspect_ratio?: string;
          output_type?: string;
          requires_admin_review?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          title_mn?: string;
          title_en?: string | null;
          category?: string | null;
          description_mn?: string | null;
          preview_image_url?: string | null;
          required_images_min?: number;
          required_images_max?: number;
          prompt?: string;
          negative_prompt?: string | null;
          default_aspect_ratio?: string;
          output_type?: string;
          requires_admin_review?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      generation_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          template_id: string | null;
          status: GenerationSessionStatus;
          customer_note: string | null;
          selected_output_id: string | null;
          converted_order_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          template_id?: string | null;
          status?: GenerationSessionStatus;
          customer_note?: string | null;
          selected_output_id?: string | null;
          converted_order_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string | null;
          template_id?: string | null;
          status?: GenerationSessionStatus;
          customer_note?: string | null;
          selected_output_id?: string | null;
          converted_order_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "generation_sessions_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "ai_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "generation_sessions_selected_output_id_fkey";
            columns: ["selected_output_id"];
            isOneToOne: false;
            referencedRelation: "generated_outputs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "generation_sessions_converted_order_id_fkey";
            columns: ["converted_order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      uploaded_images: {
        Row: {
          id: string;
          session_id: string;
          file_url: string;
          file_path: string | null;
          image_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          file_url: string;
          file_path?: string | null;
          image_type?: string;
          created_at?: string;
        };
        Update: {
          session_id?: string;
          file_url?: string;
          file_path?: string | null;
          image_type?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "uploaded_images_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "generation_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      generated_outputs: {
        Row: {
          id: string;
          session_id: string;
          provider: AIProvider;
          model: string | null;
          preview_url: string | null;
          watermarked_url: string | null;
          full_res_url: string | null;
          is_selected: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          provider?: AIProvider;
          model?: string | null;
          preview_url?: string | null;
          watermarked_url?: string | null;
          full_res_url?: string | null;
          is_selected?: boolean;
          created_at?: string;
        };
        Update: {
          session_id?: string;
          provider?: AIProvider;
          model?: string | null;
          preview_url?: string | null;
          watermarked_url?: string | null;
          full_res_url?: string | null;
          is_selected?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "generated_outputs_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "generation_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string;
          selected_output_id: string | null;
          status: OrderStatus;
          payment_status: PaymentStatus;
          customer_name: string | null;
          customer_phone: string | null;
          customer_email: string | null;
          delivery_address: string | null;
          total_price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id: string;
          selected_output_id?: string | null;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_email?: string | null;
          delivery_address?: string | null;
          total_price?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string | null;
          session_id?: string;
          selected_output_id?: string | null;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_email?: string | null;
          delivery_address?: string | null;
          total_price?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "generation_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_selected_output_id_fkey";
            columns: ["selected_output_id"];
            isOneToOne: false;
            referencedRelation: "generated_outputs";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          item_type: OrderItemType;
          title: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          item_type: OrderItemType;
          title?: string | null;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
        Update: {
          order_id?: string;
          item_type?: OrderItemType;
          title?: string | null;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      print_jobs: {
        Row: {
          id: string;
          order_id: string;
          status: string;
          print_size: string | null;
          paper_type: string | null;
          delivery_address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          status?: string;
          print_size?: string | null;
          paper_type?: string | null;
          delivery_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          order_id?: string;
          status?: string;
          print_size?: string | null;
          paper_type?: string | null;
          delivery_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "print_jobs_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          provider: string;
          amount: number;
          currency: string;
          status: PaymentStatus;
          invoice_id: string | null;
          payment_reference: string | null;
          created_at: string;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          provider?: string;
          amount: number;
          currency?: string;
          status?: PaymentStatus;
          invoice_id?: string | null;
          payment_reference?: string | null;
          created_at?: string;
          paid_at?: string | null;
        };
        Update: {
          order_id?: string;
          provider?: string;
          amount?: number;
          currency?: string;
          status?: PaymentStatus;
          invoice_id?: string | null;
          payment_reference?: string | null;
          created_at?: string;
          paid_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_notes: {
        Row: {
          id: string;
          session_id: string | null;
          order_id: string | null;
          admin_id: string | null;
          note: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          order_id?: string | null;
          admin_id?: string | null;
          note: string;
          created_at?: string;
        };
        Update: {
          session_id?: string | null;
          order_id?: string | null;
          admin_id?: string | null;
          note?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_notes_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "generation_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "admin_notes_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
