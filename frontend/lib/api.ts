function getApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl) {
    return typeof window !== 'undefined' ? '/api/v1' : 'http://127.0.0.1:8000/api/v1';
  }
  if (envUrl.startsWith('http://') || envUrl.startsWith('https://') || envUrl.startsWith('/')) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  // If it's a bare hostname or service name (like "rewoix-backend"), browser calls relative "/api/v1"
  return typeof window !== 'undefined' ? '/api/v1' : `http://${envUrl}:10000/api/v1`;
}

const API_BASE = getApiBase();

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errData = await res.json();
      errorMessage = errData.detail || errData.message || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  return res.json();
}
