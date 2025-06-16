export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  photo_url?: string | null;
  is_patriarch: boolean;
  role: 'member' | 'admin' | 'patriarch';
  country?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  birth_place?: string | null;
  current_location?: string | null;
  title?: string | null;
  situation?: string | null;
  relationship_type?: string | null;
  father_id?: string | null;
  mother_id?: string | null;
  spouse_id?: string | null;
  children_ids?: string[];
  created_at: string;
  updated_at: string;
  user_metadata?: Record<string, any>;
};

export interface CustomUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  photo_url: string;
  country: string;
  is_patriarch: boolean;
  role: string;
  title: string | null;
  birth_place: string | null;
  birth_date: string | null;
  current_location?: string | null;
  situation?: string | null;
}
