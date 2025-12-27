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
      alerts: {
        Row: {
          acknowledged: boolean | null
          created_at: string
          greenhouse_id: string | null
          id: string
          message: string
          sensor_id: string | null
          title: string
          type: string
        }
        Insert: {
          acknowledged?: boolean | null
          created_at?: string
          greenhouse_id?: string | null
          id?: string
          message: string
          sensor_id?: string | null
          title: string
          type: string
        }
        Update: {
          acknowledged?: boolean | null
          created_at?: string
          greenhouse_id?: string | null
          id?: string
          message?: string
          sensor_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_greenhouse_id_fkey"
            columns: ["greenhouse_id"]
            isOneToOne: false
            referencedRelation: "greenhouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "iot_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      control_states: {
        Row: {
          cooling: boolean | null
          greenhouse_id: string | null
          heating: boolean | null
          id: string
          irrigation: boolean | null
          lighting: boolean | null
          misting: boolean | null
          target_humidity: number | null
          target_moisture: number | null
          target_temperature: number | null
          updated_at: string
          ventilation: boolean | null
        }
        Insert: {
          cooling?: boolean | null
          greenhouse_id?: string | null
          heating?: boolean | null
          id?: string
          irrigation?: boolean | null
          lighting?: boolean | null
          misting?: boolean | null
          target_humidity?: number | null
          target_moisture?: number | null
          target_temperature?: number | null
          updated_at?: string
          ventilation?: boolean | null
        }
        Update: {
          cooling?: boolean | null
          greenhouse_id?: string | null
          heating?: boolean | null
          id?: string
          irrigation?: boolean | null
          lighting?: boolean | null
          misting?: boolean | null
          target_humidity?: number | null
          target_moisture?: number | null
          target_temperature?: number | null
          updated_at?: string
          ventilation?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "control_states_greenhouse_id_fkey"
            columns: ["greenhouse_id"]
            isOneToOne: true
            referencedRelation: "greenhouses"
            referencedColumns: ["id"]
          },
        ]
      }
      greenhouses: {
        Row: {
          created_at: string
          id: string
          location: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      iot_devices: {
        Row: {
          api_key: string
          battery_level: number | null
          created_at: string
          device_id: string
          device_type: string
          firmware_version: string | null
          greenhouse_id: string | null
          id: string
          last_seen: string | null
          name: string
          signal_strength: number | null
          status: string
          zone: string | null
        }
        Insert: {
          api_key: string
          battery_level?: number | null
          created_at?: string
          device_id: string
          device_type: string
          firmware_version?: string | null
          greenhouse_id?: string | null
          id?: string
          last_seen?: string | null
          name: string
          signal_strength?: number | null
          status?: string
          zone?: string | null
        }
        Update: {
          api_key?: string
          battery_level?: number | null
          created_at?: string
          device_id?: string
          device_type?: string
          firmware_version?: string | null
          greenhouse_id?: string | null
          id?: string
          last_seen?: string | null
          name?: string
          signal_strength?: number | null
          status?: string
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "iot_devices_greenhouse_id_fkey"
            columns: ["greenhouse_id"]
            isOneToOne: false
            referencedRelation: "greenhouses"
            referencedColumns: ["id"]
          },
        ]
      }
      plants: {
        Row: {
          created_at: string
          expected_harvest: string | null
          greenhouse_id: string | null
          growth_stage: number | null
          health: string | null
          id: string
          image_url: string | null
          light_requirement: string | null
          name: string
          planted_date: string | null
          temp_max: number | null
          temp_min: number | null
          type: string
          updated_at: string
          variety: string | null
          watering_schedule: string | null
          zone: string | null
        }
        Insert: {
          created_at?: string
          expected_harvest?: string | null
          greenhouse_id?: string | null
          growth_stage?: number | null
          health?: string | null
          id?: string
          image_url?: string | null
          light_requirement?: string | null
          name: string
          planted_date?: string | null
          temp_max?: number | null
          temp_min?: number | null
          type: string
          updated_at?: string
          variety?: string | null
          watering_schedule?: string | null
          zone?: string | null
        }
        Update: {
          created_at?: string
          expected_harvest?: string | null
          greenhouse_id?: string | null
          growth_stage?: number | null
          health?: string | null
          id?: string
          image_url?: string | null
          light_requirement?: string | null
          name?: string
          planted_date?: string | null
          temp_max?: number | null
          temp_min?: number | null
          type?: string
          updated_at?: string
          variety?: string | null
          watering_schedule?: string | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plants_greenhouse_id_fkey"
            columns: ["greenhouse_id"]
            isOneToOne: false
            referencedRelation: "greenhouses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          created_at: string
          days: string[] | null
          enabled: boolean | null
          end_time: string
          greenhouse_id: string | null
          id: string
          last_run: string | null
          name: string
          next_run: string | null
          start_time: string
          type: string
          zone: string | null
        }
        Insert: {
          created_at?: string
          days?: string[] | null
          enabled?: boolean | null
          end_time: string
          greenhouse_id?: string | null
          id?: string
          last_run?: string | null
          name: string
          next_run?: string | null
          start_time: string
          type: string
          zone?: string | null
        }
        Update: {
          created_at?: string
          days?: string[] | null
          enabled?: boolean | null
          end_time?: string
          greenhouse_id?: string | null
          id?: string
          last_run?: string | null
          name?: string
          next_run?: string | null
          start_time?: string
          type?: string
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_greenhouse_id_fkey"
            columns: ["greenhouse_id"]
            isOneToOne: false
            referencedRelation: "greenhouses"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_readings: {
        Row: {
          device_id: string | null
          id: string
          sensor_type: string
          timestamp: string
          unit: string
          value: number
        }
        Insert: {
          device_id?: string | null
          id?: string
          sensor_type: string
          timestamp?: string
          unit: string
          value: number
        }
        Update: {
          device_id?: string | null
          id?: string
          sensor_type?: string
          timestamp?: string
          unit?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sensor_readings_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "iot_devices"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
