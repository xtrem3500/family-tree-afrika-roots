export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Functions: {
      delete_all_data: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
    }
  }
}
