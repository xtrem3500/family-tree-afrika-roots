import { SupabaseClient } from '@supabase/supabase-js';

export const supabaseMiddleware = {
  async beforeRequest({ request }: { request: Request }) {
    const headers = new Headers(request.headers);
    headers.set('Access-Control-Allow-Origin', 'http://localhost:8080');
    headers.set('Access-Control-Allow-Credentials', 'true');
    return new Request(request.url, {
      method: request.method,
      headers,
      body: request.body,
      credentials: 'include',
    });
  },
};

// Fonction utilitaire pour appliquer le middleware à une requête Supabase
export const withMiddleware = <T>(
  client: SupabaseClient,
  query: Promise<T>
): Promise<T> => {
  return query.then(async (result) => {
    const request = new Request(client.url);
    const modifiedRequest = await supabaseMiddleware.beforeRequest({ request });
    return result;
  });
};

// Middleware pour ajouter les en-têtes CORS aux requêtes Supabase
export const addCorsHeaders = (headers: Headers): Headers => {
  // En-têtes CORS de base
  headers.set('Access-Control-Allow-Origin', 'http://localhost:8080');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Info, apikey, Prefer');
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Max-Age', '86400'); // 24 heures

  return headers;
};

// Fonction pour gérer les requêtes OPTIONS
export const handleOptionsRequest = (request: Request): Response => {
  const headers = new Headers();
  addCorsHeaders(headers);
  
  return new Response(null, {
    status: 204,
    headers
  });
}; 