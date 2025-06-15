export const supabaseMiddleware = {
  async beforeRequest({ request }: { request: Request }) {
    const headers = new Headers(request.headers);
    headers.set('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY);
    headers.set('Authorization', `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`);
    headers.set('Content-Type', 'application/json');
    headers.set('Prefer', 'return=minimal');
    return new Request(request.url, {
      method: request.method,
      headers,
      body: request.body,
      credentials: 'include',
    });
  },
};
