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
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          currency?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          icon: string
          color: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          icon?: string
          color?: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          type?: 'income' | 'expense'
          icon?: string
          color?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          category_id: string
          type: 'income' | 'expense'
          amount: number
          description: string | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          type: 'income' | 'expense'
          amount: number
          description?: string | null
          date: string
          created_at?: string
        }
        Update: {
          category_id?: string
          type?: 'income' | 'expense'
          amount?: number
          description?: string | null
          date?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          month: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          month: string
          created_at?: string
        }
        Update: {
          category_id?: string
          amount?: number
          month?: string
        }
      }
      savings_goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          target_date: string | null
          color: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: number
          current_amount?: number
          target_date?: string | null
          color?: string
          icon?: string
          created_at?: string
        }
        Update: {
          name?: string
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          color?: string
          icon?: string
        }
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
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
