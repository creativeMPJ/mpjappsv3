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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cities: {
        Row: {
          created_at: string | null
          id: string
          name: string
          region_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          region_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          region_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      crews: {
        Row: {
          created_at: string | null
          id: string
          jabatan: string | null
          nama: string
          profile_id: string
          skill: string[] | null
          updated_at: string | null
          xp_level: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          jabatan?: string | null
          nama: string
          profile_id: string
          skill?: string[] | null
          updated_at?: string | null
          xp_level?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          jabatan?: string | null
          nama?: string
          profile_id?: string
          skill?: string[] | null
          updated_at?: string | null
          xp_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          base_amount: number
          created_at: string | null
          id: string
          pesantren_claim_id: string
          proof_file_url: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["payment_verification_status"]
          total_amount: number
          unique_code: number
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          base_amount: number
          created_at?: string | null
          id?: string
          pesantren_claim_id: string
          proof_file_url?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["payment_verification_status"]
          total_amount: number
          unique_code: number
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          base_amount?: number
          created_at?: string | null
          id?: string
          pesantren_claim_id?: string
          proof_file_url?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["payment_verification_status"]
          total_amount?: number
          unique_code?: number
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_pesantren_claim_id_fkey"
            columns: ["pesantren_claim_id"]
            isOneToOne: false
            referencedRelation: "pesantren_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      pesantren_claims: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          claimed_at: string
          created_at: string
          dokumen_bukti_url: string | null
          email_pengelola: string | null
          id: string
          jenis_pengajuan: Database["public"]["Enums"]["registration_type"]
          kecamatan: string | null
          nama_pengelola: string | null
          notes: string | null
          pesantren_name: string
          region_id: string | null
          status: Database["public"]["Enums"]["claim_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          claimed_at?: string
          created_at?: string
          dokumen_bukti_url?: string | null
          email_pengelola?: string | null
          id?: string
          jenis_pengajuan?: Database["public"]["Enums"]["registration_type"]
          kecamatan?: string | null
          nama_pengelola?: string | null
          notes?: string | null
          pesantren_name: string
          region_id?: string | null
          status?: Database["public"]["Enums"]["claim_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          claimed_at?: string
          created_at?: string
          dokumen_bukti_url?: string | null
          email_pengelola?: string | null
          id?: string
          jenis_pengajuan?: Database["public"]["Enums"]["registration_type"]
          kecamatan?: string | null
          nama_pengelola?: string | null
          notes?: string | null
          pesantren_name?: string
          region_id?: string | null
          status?: Database["public"]["Enums"]["claim_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pesantren_claims_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          alamat_singkat: string | null
          city_id: string | null
          created_at: string | null
          foto_pengasuh_url: string | null
          id: string
          jumlah_santri: number | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          nama_media: string | null
          nama_pengasuh: string | null
          nama_pesantren: string | null
          nip: string | null
          no_wa_pendaftar: string | null
          profile_level: Database["public"]["Enums"]["profile_level"]
          program_unggulan: string[] | null
          region_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          sejarah: string | null
          sk_pesantren_url: string | null
          social_links: Json | null
          status_account: Database["public"]["Enums"]["account_status"]
          status_payment: Database["public"]["Enums"]["payment_status"]
          tipe_pesantren: string | null
          updated_at: string | null
          visi_misi: string | null
        }
        Insert: {
          alamat_singkat?: string | null
          city_id?: string | null
          created_at?: string | null
          foto_pengasuh_url?: string | null
          id: string
          jumlah_santri?: number | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          nama_media?: string | null
          nama_pengasuh?: string | null
          nama_pesantren?: string | null
          nip?: string | null
          no_wa_pendaftar?: string | null
          profile_level?: Database["public"]["Enums"]["profile_level"]
          program_unggulan?: string[] | null
          region_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          sejarah?: string | null
          sk_pesantren_url?: string | null
          social_links?: Json | null
          status_account?: Database["public"]["Enums"]["account_status"]
          status_payment?: Database["public"]["Enums"]["payment_status"]
          tipe_pesantren?: string | null
          updated_at?: string | null
          visi_misi?: string | null
        }
        Update: {
          alamat_singkat?: string | null
          city_id?: string | null
          created_at?: string | null
          foto_pengasuh_url?: string | null
          id?: string
          jumlah_santri?: number | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          nama_media?: string | null
          nama_pengasuh?: string | null
          nama_pesantren?: string | null
          nip?: string | null
          no_wa_pendaftar?: string | null
          profile_level?: Database["public"]["Enums"]["profile_level"]
          program_unggulan?: string[] | null
          region_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          sejarah?: string | null
          sk_pesantren_url?: string | null
          social_links?: Json | null
          status_account?: Database["public"]["Enums"]["account_status"]
          status_payment?: Database["public"]["Enums"]["payment_status"]
          tipe_pesantren?: string | null
          updated_at?: string | null
          visi_misi?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_legacy_claim: {
        Args: {
          p_alamat_singkat: string
          p_city_id: string
          p_nama_pengasuh: string
          p_nama_pesantren: string
          p_nip?: string
          p_no_wa_pendaftar: string
          p_region_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      admin_update_account_status: {
        Args: {
          p_new_status: Database["public"]["Enums"]["account_status"]
          p_target_user_id: string
        }
        Returns: boolean
      }
      get_user_claim_status: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["claim_status"]
      }
      get_user_region_id: { Args: { _user_id: string }; Returns: string }
      get_user_status: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["account_status"]
      }
      has_approved_claim: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      migrate_legacy_account: {
        Args: {
          p_alamat_singkat: string
          p_city_id: string
          p_nama_pengasuh: string
          p_nama_pesantren: string
          p_nip?: string
          p_no_wa_pendaftar: string
          p_region_id: string
          p_status_account?: Database["public"]["Enums"]["account_status"]
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_status: "pending" | "active" | "rejected"
      app_role: "user" | "admin_regional" | "admin_pusat" | "admin_finance"
      claim_status:
        | "pending"
        | "regional_approved"
        | "pusat_approved"
        | "approved"
        | "rejected"
      payment_status: "paid" | "unpaid"
      payment_verification_status:
        | "pending_payment"
        | "pending_verification"
        | "verified"
        | "rejected"
      profile_level: "basic" | "silver" | "gold" | "platinum"
      registration_type: "klaim" | "pesantren_baru"
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
      account_status: ["pending", "active", "rejected"],
      app_role: ["user", "admin_regional", "admin_pusat", "admin_finance"],
      claim_status: [
        "pending",
        "regional_approved",
        "pusat_approved",
        "approved",
        "rejected",
      ],
      payment_status: ["paid", "unpaid"],
      payment_verification_status: [
        "pending_payment",
        "pending_verification",
        "verified",
        "rejected",
      ],
      profile_level: ["basic", "silver", "gold", "platinum"],
      registration_type: ["klaim", "pesantren_baru"],
    },
  },
} as const
