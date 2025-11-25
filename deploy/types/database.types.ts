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
      profiles: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'user' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'admin' | 'user' | 'viewer'
        }
        Update: {
          email?: string
          role?: 'admin' | 'user' | 'viewer'
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          auto_identifier: string
          owner_id: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          name: string
          owner_id: string
        }
        Update: {
          name?: string
        }
      }
    }
  }
}