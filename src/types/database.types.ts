// ============================================================================
// MedBay Supabase PostgreSQL TypeScript Schema (Aligned with migrations 0001-0003)
// ============================================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          encrypted_google_refresh_token: string | null;
          google_scopes_valid: boolean;
          gmail_scan_enabled: boolean;
          last_gmail_scan_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          encrypted_google_refresh_token?: string | null;
          google_scopes_valid?: boolean;
          gmail_scan_enabled?: boolean;
          last_gmail_scan_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          encrypted_google_refresh_token?: string | null;
          google_scopes_valid?: boolean;
          gmail_scan_enabled?: boolean;
          last_gmail_scan_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      family_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          relationship: string;
          date_of_birth: string | null;
          is_primary: boolean;
          color_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          relationship: string;
          date_of_birth?: string | null;
          is_primary?: boolean;
          color_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          relationship?: string;
          date_of_birth?: string | null;
          is_primary?: boolean;
          color_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "family_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      medical_documents: {
        Row: {
          id: string;
          user_id: string;
          profile_id: string;
          title: string;
          original_filename: string;
          mime_type: string;
          file_size_bytes: number;
          storage_path: string;
          category: string;
          document_date: string | null;
          detected_patient_name: string | null;
          profile_match_confidence: string;
          ingestion_status: string;
          ingestion_error: string | null;
          extracted_text: string | null;
          source: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          profile_id: string;
          title: string;
          original_filename: string;
          mime_type: string;
          file_size_bytes: number;
          storage_path: string;
          category?: string;
          document_date?: string | null;
          detected_patient_name?: string | null;
          profile_match_confidence?: string;
          ingestion_status?: string;
          ingestion_error?: string | null;
          extracted_text?: string | null;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          profile_id?: string;
          title?: string;
          original_filename?: string;
          mime_type?: string;
          file_size_bytes?: number;
          storage_path?: string;
          category?: string;
          document_date?: string | null;
          detected_patient_name?: string | null;
          profile_match_confidence?: string;
          ingestion_status?: string;
          ingestion_error?: string | null;
          extracted_text?: string | null;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "medical_documents_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "medical_documents_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "family_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      document_summaries: {
        Row: {
          id: string;
          document_id: string;
          user_id: string;
          overview: string;
          key_findings: Json;
          doctor_questions: Json;
          citations: Json;
          model_used: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          user_id: string;
          overview: string;
          key_findings?: Json;
          doctor_questions?: Json;
          citations?: Json;
          model_used: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          user_id?: string;
          overview?: string;
          key_findings?: Json;
          doctor_questions?: Json;
          citations?: Json;
          model_used?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "document_summaries_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: true;
            referencedRelation: "medical_documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "document_summaries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      document_chunks: {
        Row: {
          id: string;
          document_id: string;
          user_id: string;
          profile_id: string;
          chunk_index: number;
          content: string;
          embedding: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          user_id: string;
          profile_id: string;
          chunk_index: number;
          content: string;
          embedding: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          user_id?: string;
          profile_id?: string;
          chunk_index?: number;
          content?: string;
          embedding?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "medical_documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "document_chunks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "document_chunks_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "family_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_threads: {
        Row: {
          id: string;
          user_id: string;
          profile_id: string | null;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          profile_id?: string | null;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          profile_id?: string | null;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_threads_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_threads_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "family_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_messages: {
        Row: {
          id: string;
          thread_id: string;
          user_id: string;
          role: string;
          content: string;
          vault_citations: Json;
          web_citations: Json;
          calendar_event_created: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          user_id: string;
          role: string;
          content: string;
          vault_citations?: Json;
          web_citations?: Json;
          calendar_event_created?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          thread_id?: string;
          user_id?: string;
          role?: string;
          content?: string;
          vault_citations?: Json;
          web_citations?: Json;
          calendar_event_created?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "chat_threads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      share_links: {
        Row: {
          id: string;
          document_id: string;
          user_id: string;
          token: string;
          duration_preset: string;
          expires_at: string;
          revoked_at: string | null;
          view_count: number;
          last_accessed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          user_id: string;
          token: string;
          duration_preset: string;
          expires_at: string;
          revoked_at?: string | null;
          view_count?: number;
          last_accessed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          user_id?: string;
          token?: string;
          duration_preset?: string;
          expires_at?: string;
          revoked_at?: string | null;
          view_count?: number;
          last_accessed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "share_links_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "medical_documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "share_links_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      activity_events: {
        Row: {
          id: string;
          user_id: string;
          profile_id: string | null;
          document_id: string | null;
          event_type: string;
          description: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          profile_id?: string | null;
          document_id?: string | null;
          event_type: string;
          description: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          profile_id?: string | null;
          document_id?: string | null;
          event_type?: string;
          description?: string;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_events_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "family_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_events_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "medical_documents";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_items: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          gmail_message_id: string | null;
          email_subject: string | null;
          email_sender: string | null;
          has_attachments: boolean;
          is_read: boolean;
          imported_document_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          gmail_message_id?: string | null;
          email_subject?: string | null;
          email_sender?: string | null;
          has_attachments?: boolean;
          is_read?: boolean;
          imported_document_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          body?: string;
          gmail_message_id?: string | null;
          email_subject?: string | null;
          email_sender?: string | null;
          has_attachments?: boolean;
          is_read?: boolean;
          imported_document_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notification_items_imported_document_id_fkey";
            columns: ["imported_document_id"];
            isOneToOne: false;
            referencedRelation: "medical_documents";
            referencedColumns: ["id"];
          },
        ];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh_key: string;
          auth_key: string;
          device_label: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh_key: string;
          auth_key: string;
          device_label?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh_key?: string;
          auth_key?: string;
          device_label?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      rate_limit_buckets: {
        Row: {
          bucket_key: string;
          window_start: string;
          request_count: number;
        };
        Insert: {
          bucket_key: string;
          window_start?: string;
          request_count?: number;
        };
        Update: {
          bucket_key?: string;
          window_start?: string;
          request_count?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      match_document_chunks: {
        Args: {
          p_user_id: string;
          p_profile_id: string | null;
          p_query_embedding: string;
          p_match_threshold?: number;
          p_match_count?: number;
        };
        Returns: {
          chunk_id: string;
          document_id: string;
          document_title: string;
          document_date: string | null;
          detected_patient_name: string | null;
          profile_name: string;
          content: string;
          similarity: number;
        }[];
      };
      resolve_active_share_link: {
        Args: {
          p_token: string;
        };
        Returns: {
          document_id: string;
          title: string;
          mime_type: string;
          storage_path: string;
          expires_at: string;
        }[];
      };
      complete_document_ingestion: {
        Args: {
          p_document_id: string;
          p_user_id: string;
          p_profile_id: string;
          p_title: string;
          p_category: string;
          p_document_date: string | null;
          p_detected_patient_name: string | null;
          p_profile_match_confidence: string;
          p_extracted_text: string;
          p_overview: string;
          p_key_findings: Json;
          p_doctor_questions: Json;
          p_citations: Json;
          p_model_used: string;
          p_chunks: Json;
        };
        Returns: undefined;
      };
      check_rate_limit: {
        Args: {
          p_bucket_key: string;
          p_max_requests: number;
          p_window_seconds?: number;
        };
        Returns: {
          allowed: boolean;
          remaining: number;
          reset_at: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
