function getApiBase(): string {
  let envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl) {
    return typeof window !== 'undefined' ? '/api/v1' : 'http://127.0.0.1:8000/api/v1';
  }
  if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  if (envUrl.startsWith('/')) {
    return envUrl;
  }
  if (envUrl === 'rewoix-backend' || envUrl.startsWith('rewoix-backend')) {
    return `https://${envUrl}.onrender.com/api/v1`;
  }
  return typeof window !== 'undefined' ? '/api/v1' : `http://${envUrl}:8000/api/v1`;
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

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    throw new Error(
      netErr.message && netErr.message !== 'Failed to fetch'
        ? netErr.message
        : 'Unable to reach backend server. The service may be waking up (cold boot). Please retry in a few moments.'
    );
  }

  if (!res.ok) {
    let errorMessage = `Server error (${res.status})`;
    try {
      const errData = await res.json();
      errorMessage = errData.detail || errData.message || errorMessage;
    } catch (_) {
      try {
        const text = await res.text();
        if (text && text.length < 120 && !text.includes('<!DOCTYPE')) {
          errorMessage = text;
        } else if (res.status === 502 || res.status === 503 || res.status === 504) {
          errorMessage = 'Backend is waking up from idle on Render free tier. Please wait 30 seconds and retry.';
        } else if (res.status === 404) {
          errorMessage = 'API endpoint not found (404). Please verify backend URL.';
        }
      } catch (__) {}
    }
    throw new Error(errorMessage);
  }

  return res.json();
}
