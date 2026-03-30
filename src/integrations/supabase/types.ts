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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      automation_sequences: {
        Row: {
          active: boolean
          body: string
          channel: string
          conditions: Json | null
          created_at: string
          delay_description: string
          delay_minutes: number
          funnel: string
          id: string
          step_key: string
          step_order: number
          subject: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          body?: string
          channel: string
          conditions?: Json | null
          created_at?: string
          delay_description?: string
          delay_minutes?: number
          funnel: string
          id?: string
          step_key: string
          step_order?: number
          subject?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          body?: string
          channel?: string
          conditions?: Json | null
          created_at?: string
          delay_description?: string
          delay_minutes?: number
          funnel?: string
          id?: string
          step_key?: string
          step_order?: number
          subject?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      google_oauth_tokens: {
        Row: {
          access_token: string
          created_at: string
          email: string | null
          id: string
          refresh_token: string
          token_expiry: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          email?: string | null
          id?: string
          refresh_token: string
          token_expiry: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          email?: string | null
          id?: string
          refresh_token?: string
          token_expiry?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lead_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          lead_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          lead_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lead_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_tags: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          source: string
          tag: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          source?: string
          tag: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          source?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_tags_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          career: string
          city: string
          created_at: string
          cupom_usado_compra: string | null
          daily_wa_count: number | null
          daily_wa_date: string | null
          data_compra: string | null
          email: string
          forma_pagamento: string | null
          funnel_origin: string | null
          hotmart_offer_code: string | null
          hotmart_status: string | null
          hotmart_transaction_id: string | null
          id: string
          last_wa_sent_at: string | null
          lead_number: number
          link_onboarding: string | null
          name: string
          notes: string | null
          phone: string
          quiz_concluido: boolean | null
          quiz_diagnostico: string | null
          quiz_score: number | null
          quiz_slug: string | null
          quiz_started_at: string | null
          reuniao_consultor: string | null
          reuniao_data_extenso: string | null
          reuniao_data_hora_iso: string | null
          reuniao_hora_extenso: string | null
          reuniao_link_google_calendar: string | null
          reuniao_link_google_meet: string | null
          reuniao_notas: string | null
          reuniao_status: string | null
          revenue: number | null
          scheduled_day: string | null
          scheduled_time: string | null
          status: Database["public"]["Enums"]["lead_status"]
          temperature: Database["public"]["Enums"]["lead_temperature"] | null
          treatment: string
          uf: string
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          valor_pago: number | null
          wa_sem_resposta_count: number | null
        }
        Insert: {
          career: string
          city: string
          created_at?: string
          cupom_usado_compra?: string | null
          daily_wa_count?: number | null
          daily_wa_date?: string | null
          data_compra?: string | null
          email: string
          forma_pagamento?: string | null
          funnel_origin?: string | null
          hotmart_offer_code?: string | null
          hotmart_status?: string | null
          hotmart_transaction_id?: string | null
          id?: string
          last_wa_sent_at?: string | null
          lead_number?: number
          link_onboarding?: string | null
          name: string
          notes?: string | null
          phone: string
          quiz_concluido?: boolean | null
          quiz_diagnostico?: string | null
          quiz_score?: number | null
          quiz_slug?: string | null
          quiz_started_at?: string | null
          reuniao_consultor?: string | null
          reuniao_data_extenso?: string | null
          reuniao_data_hora_iso?: string | null
          reuniao_hora_extenso?: string | null
          reuniao_link_google_calendar?: string | null
          reuniao_link_google_meet?: string | null
          reuniao_notas?: string | null
          reuniao_status?: string | null
          revenue?: number | null
          scheduled_day?: string | null
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          temperature?: Database["public"]["Enums"]["lead_temperature"] | null
          treatment?: string
          uf: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          valor_pago?: number | null
          wa_sem_resposta_count?: number | null
        }
        Update: {
          career?: string
          city?: string
          created_at?: string
          cupom_usado_compra?: string | null
          daily_wa_count?: number | null
          daily_wa_date?: string | null
          data_compra?: string | null
          email?: string
          forma_pagamento?: string | null
          funnel_origin?: string | null
          hotmart_offer_code?: string | null
          hotmart_status?: string | null
          hotmart_transaction_id?: string | null
          id?: string
          last_wa_sent_at?: string | null
          lead_number?: number
          link_onboarding?: string | null
          name?: string
          notes?: string | null
          phone?: string
          quiz_concluido?: boolean | null
          quiz_diagnostico?: string | null
          quiz_score?: number | null
          quiz_slug?: string | null
          quiz_started_at?: string | null
          reuniao_consultor?: string | null
          reuniao_data_extenso?: string | null
          reuniao_data_hora_iso?: string | null
          reuniao_hora_extenso?: string | null
          reuniao_link_google_calendar?: string | null
          reuniao_link_google_meet?: string | null
          reuniao_notas?: string | null
          reuniao_status?: string | null
          revenue?: number | null
          scheduled_day?: string | null
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          temperature?: Database["public"]["Enums"]["lead_temperature"] | null
          treatment?: string
          uf?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          valor_pago?: number | null
          wa_sem_resposta_count?: number | null
        }
        Relationships: []
      }
      message_history: {
        Row: {
          body_preview: string | null
          channel: string
          created_at: string
          external_id: string | null
          funnel: string | null
          id: string
          lead_id: string
          status: string
          step_key: string | null
          subject: string | null
        }
        Insert: {
          body_preview?: string | null
          channel: string
          created_at?: string
          external_id?: string | null
          funnel?: string | null
          id?: string
          lead_id: string
          status?: string
          step_key?: string | null
          subject?: string | null
        }
        Update: {
          body_preview?: string | null
          channel?: string
          created_at?: string
          external_id?: string | null
          funnel?: string | null
          id?: string
          lead_id?: string
          status?: string
          step_key?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      message_queue: {
        Row: {
          attempts: number
          body: string
          channel: string
          created_at: string
          funnel: string
          id: string
          last_error: string | null
          lead_id: string
          scheduled_for: string
          sent_at: string | null
          sequence_id: string | null
          status: string
          step_key: string
          subject: string | null
        }
        Insert: {
          attempts?: number
          body?: string
          channel: string
          created_at?: string
          funnel: string
          id?: string
          last_error?: string | null
          lead_id: string
          scheduled_for?: string
          sent_at?: string | null
          sequence_id?: string | null
          status?: string
          step_key: string
          subject?: string | null
        }
        Update: {
          attempts?: number
          body?: string
          channel?: string
          created_at?: string
          funnel?: string
          id?: string
          last_error?: string | null
          lead_id?: string
          scheduled_for?: string
          sent_at?: string | null
          sequence_id?: string | null
          status?: string
          step_key?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_queue_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_queue_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "automation_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_templates: {
        Row: {
          active: boolean
          body: string
          channel: Database["public"]["Enums"]["message_channel"]
          created_at: string
          id: string
          subject: string | null
          trigger: Database["public"]["Enums"]["funnel_trigger"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          body: string
          channel: Database["public"]["Enums"]["message_channel"]
          created_at?: string
          id?: string
          subject?: string | null
          trigger: Database["public"]["Enums"]["funnel_trigger"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          body?: string
          channel?: Database["public"]["Enums"]["message_channel"]
          created_at?: string
          id?: string
          subject?: string | null
          trigger?: Database["public"]["Enums"]["funnel_trigger"]
          updated_at?: string
        }
        Relationships: []
      }
      quiz_pages: {
        Row: {
          coupon_code: string
          coupon_discount: string
          coupon_timer_minutes: number
          created_at: string
          cta_url: string
          hero_author_name: string
          hero_author_role: string
          hero_label: string
          hero_message: string
          hero_title: string
          id: string
          lead_step1_text: string
          lead_step2_text: string
          lead_step3_text: string
          lesson_desc: string
          lesson_duration: string
          lesson_number: string
          lesson_phase: string
          lesson_tag: string
          lesson_thumbnail: string
          lesson_title: string
          lesson_video_url: string
          page_type: string
          quiz_desc: string
          quiz_duration: string
          quiz_icon: string
          quiz_number: string
          quiz_question_count: number
          quiz_tag: string
          quiz_title: string
          result_closing_text: string
          result_high_diagnostic: string
          result_high_level: string
          result_high_min: number
          result_high_title: string
          result_low_diagnostic: string
          result_low_level: string
          result_low_title: string
          result_mid_diagnostic: string
          result_mid_level: string
          result_mid_min: number
          result_mid_title: string
          slug: string
          status: string
          updated_at: string
          video_locked: boolean
        }
        Insert: {
          coupon_code?: string
          coupon_discount?: string
          coupon_timer_minutes?: number
          created_at?: string
          cta_url?: string
          hero_author_name?: string
          hero_author_role?: string
          hero_label?: string
          hero_message?: string
          hero_title?: string
          id?: string
          lead_step1_text?: string
          lead_step2_text?: string
          lead_step3_text?: string
          lesson_desc?: string
          lesson_duration?: string
          lesson_number?: string
          lesson_phase?: string
          lesson_tag?: string
          lesson_thumbnail?: string
          lesson_title?: string
          lesson_video_url?: string
          page_type?: string
          quiz_desc?: string
          quiz_duration?: string
          quiz_icon?: string
          quiz_number?: string
          quiz_question_count?: number
          quiz_tag?: string
          quiz_title?: string
          result_closing_text?: string
          result_high_diagnostic?: string
          result_high_level?: string
          result_high_min?: number
          result_high_title?: string
          result_low_diagnostic?: string
          result_low_level?: string
          result_low_title?: string
          result_mid_diagnostic?: string
          result_mid_level?: string
          result_mid_min?: number
          result_mid_title?: string
          slug: string
          status?: string
          updated_at?: string
          video_locked?: boolean
        }
        Update: {
          coupon_code?: string
          coupon_discount?: string
          coupon_timer_minutes?: number
          created_at?: string
          cta_url?: string
          hero_author_name?: string
          hero_author_role?: string
          hero_label?: string
          hero_message?: string
          hero_title?: string
          id?: string
          lead_step1_text?: string
          lead_step2_text?: string
          lead_step3_text?: string
          lesson_desc?: string
          lesson_duration?: string
          lesson_number?: string
          lesson_phase?: string
          lesson_tag?: string
          lesson_thumbnail?: string
          lesson_title?: string
          lesson_video_url?: string
          page_type?: string
          quiz_desc?: string
          quiz_duration?: string
          quiz_icon?: string
          quiz_number?: string
          quiz_question_count?: number
          quiz_tag?: string
          quiz_title?: string
          result_closing_text?: string
          result_high_diagnostic?: string
          result_high_level?: string
          result_high_min?: number
          result_high_title?: string
          result_low_diagnostic?: string
          result_low_level?: string
          result_low_title?: string
          result_mid_diagnostic?: string
          result_mid_level?: string
          result_mid_min?: number
          result_mid_title?: string
          slug?: string
          status?: string
          updated_at?: string
          video_locked?: boolean
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          created_at: string
          explanation: string
          id: string
          image_url: string | null
          is_critical: boolean
          label: string
          options: Json
          question: string
          quiz_page_id: string
          sort_order: number
          weight: number
        }
        Insert: {
          created_at?: string
          explanation?: string
          id?: string
          image_url?: string | null
          is_critical?: boolean
          label?: string
          options?: Json
          question?: string
          quiz_page_id: string
          sort_order?: number
          weight?: number
        }
        Update: {
          created_at?: string
          explanation?: string
          id?: string
          image_url?: string | null
          is_critical?: boolean
          label?: string
          options?: Json
          question?: string
          quiz_page_id?: string
          sort_order?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_page_id_fkey"
            columns: ["quiz_page_id"]
            isOneToOne: false
            referencedRelation: "quiz_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_templates: {
        Row: {
          active: boolean
          body: string
          channel: string
          created_at: string
          id: string
          subject: string | null
          timing_unit: string
          timing_value: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          body?: string
          channel: string
          created_at?: string
          id?: string
          subject?: string | null
          timing_unit?: string
          timing_value?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          body?: string
          channel?: string
          created_at?: string
          id?: string
          subject?: string | null
          timing_unit?: string
          timing_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      sale_notification_contacts: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          phone: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          phone: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content_key: string
          content_type: string
          content_value: string
          created_at: string
          id: string
          section: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          content_key: string
          content_type?: string
          content_value?: string
          created_at?: string
          id?: string
          section: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          content_key?: string
          content_type?: string
          content_value?: string
          created_at?: string
          id?: string
          section?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_move_stale_leads: { Args: never; Returns: undefined }
    }
    Enums: {
      funnel_trigger:
        | "novo"
        | "agendado"
        | "compareceu"
        | "nao_compareceu"
        | "convertido"
        | "perdido"
      lead_status:
        | "novo"
        | "agendado"
        | "compareceu"
        | "nao_compareceu"
        | "convertido"
        | "perdido"
      lead_temperature: "frio" | "morno" | "quente"
      message_channel: "email" | "whatsapp"
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
  public: {
    Enums: {
      funnel_trigger: [
        "novo",
        "agendado",
        "compareceu",
        "nao_compareceu",
        "convertido",
        "perdido",
      ],
      lead_status: [
        "novo",
        "agendado",
        "compareceu",
        "nao_compareceu",
        "convertido",
        "perdido",
      ],
      lead_temperature: ["frio", "morno", "quente"],
      message_channel: ["email", "whatsapp"],
    },
  },
} as const
