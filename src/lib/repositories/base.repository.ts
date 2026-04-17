import type { SupabaseClient } from '@supabase/supabase-js'

export abstract class BaseRepository {
  constructor(protected supabase: SupabaseClient) {}

  protected handleError(error: unknown, context: string): never {
    console.error(`[${context}]`, error)
    throw error instanceof Error ? error : new Error('Error desconocido')
  }
}
