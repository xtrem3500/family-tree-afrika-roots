export type Profile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  photo_url?: string;
  role: 'patriarch' | 'member';
  country?: string;
  birth_date?: Date;
  birth_place?: string;
  current_location?: string;
  title?: string;
  created_at: string;
  updated_at?: string;
};

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>;
