export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
        Relationships: []
      }
      files: {
        Row: {
          id: string
          title: string
          description: string
          preview_url: string
          download_url: string
          category_id: string | null
          price: number
          is_free: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          preview_url: string
          download_url: string
          category_id?: string | null
          price?: number
          is_free?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          preview_url?: string
          download_url?: string
          category_id?: string | null
          price?: number
          is_free?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          address: string | null
          is_admin: boolean
          status: string
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          phone?: string | null
          address?: string | null
          is_admin?: boolean
          status?: string
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          address?: string | null
          is_admin?: boolean
          status?: string
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      purchases: {
        Row: {
          id: string
          file_id: string
          user_id: string
          payment_method: string
          amount: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          file_id: string
          user_id: string
          payment_method: string
          amount: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          file_id?: string
          user_id?: string
          payment_method?: string
          amount?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          purchase_id: string
          user_id: string
          amount: number
          tax_amount: number
          total_amount: number
          status: string
          due_date: string | null
          sent_at: string | null
          paid_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          purchase_id: string
          user_id: string
          amount: number
          tax_amount?: number
          total_amount: number
          status?: string
          due_date?: string | null
          sent_at?: string | null
          paid_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          purchase_id?: string
          user_id?: string
          amount?: number
          tax_amount?: number
          total_amount?: number
          status?: string
          due_date?: string | null
          sent_at?: string | null
          paid_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string
          ip_address: string | null
          user_agent: string | null
          expires_at: string
          created_at: string
          last_activity: string
        }
        Insert: {
          id?: string
          user_id: string
          session_token: string
          ip_address?: string | null
          user_agent?: string | null
          expires_at: string
          created_at?: string
          last_activity?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_token?: string
          ip_address?: string | null
          user_agent?: string | null
          expires_at?: string
          created_at?: string
          last_activity?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      system_settings: {
        Row: {
          id: string
          key: string
          value: Json | null
          description: string | null
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: Json | null
          description?: string | null
          category?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json | null
          description?: string | null
          category?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      email_templates: {
        Row: {
          id: string
          name: string
          subject: string
          body: string
          variables: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subject: string
          body: string
          variables?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subject?: string
          body?: string
          variables?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      file_downloads: {
        Row: {
          id: string
          file_id: string
          user_id: string
          purchase_id: string | null
          download_count: number
          last_downloaded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          file_id: string
          user_id: string
          purchase_id?: string | null
          download_count?: number
          last_downloaded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          file_id?: string
          user_id?: string
          purchase_id?: string | null
          download_count?: number
          last_downloaded_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_downloads_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_downloads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_downloads_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      dashboard_analytics: {
        Row: {
          total_files: number
          total_users: number
          total_purchases: number
          pending_purchases: number
          approved_purchases: number
          total_revenue: number
          total_downloads: number
          files_this_week: number
          purchases_this_week: number
          users_this_week: number
        }
        Relationships: []
      }
    }
    Functions: {
      generate_invoice_number: {
        Args: {}
        Returns: string
      }
      create_invoice_from_purchase: {
        Args: {
          purchase_uuid: string
        }
        Returns: string
      }
      log_activity: {
        Args: {
          p_user_id: string
          p_action: string
          p_resource_type: string
          p_resource_id?: string
          p_details?: Json
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}