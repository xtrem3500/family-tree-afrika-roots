import { useQuery } from '@tanstack/react-query';

const { data: profiles, error, isLoading } = useQuery({
  queryKey: ['profiles'],
  queryFn: async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-profiles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Erreur lors de la récupération des profils');
      }

      return responseData.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des profils:', error);
      throw error;
    }
  }
});
