import 'server-only';

const API_URL = 'https://prueba-tecnica-api-tienda-moviles.onrender.com';

// Returns null on 404 so the detail page can render its not found state.
export async function apiFetch<T>(path: string): Promise<T | null> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'x-api-key': process.env.API_KEY ?? '' },
    next: { revalidate: 3600 },
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`API request failed: ${response.status} ${path}`);

  return response.json();
}
