import Constants from 'expo-constants';

export type HealthResponse = { ok: boolean };

type ErrorPayload = { error?: { code?: unknown; message?: unknown } };

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type ApiClientOptions = {
  baseUrl?: string;
  fetchImpl?: FetchLike;
};

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export function resolveApiBaseUrl(
  env: Record<string, string | undefined> = process.env,
  extra: Record<string, unknown> | undefined = Constants.expoConfig?.extra,
): string | undefined {
  const value = env.EXPO_PUBLIC_API_URL ?? extra?.apiUrl;
  return typeof value === 'string' && value.trim() ? value.trim().replace(/\/+$/, '') : undefined;
}

export const apiBaseUrl = resolveApiBaseUrl();
export const hasApiBaseUrl = Boolean(apiBaseUrl);

const defaultFetch: FetchLike = (input, init) => fetch(input, init);

export function createApiClient({ baseUrl, fetchImpl = defaultFetch }: ApiClientOptions = {}) {
  return async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    if (!baseUrl) {
      throw new ApiError('EXPO_PUBLIC_API_URL is not configured.', 0, 'API_URL_NOT_CONFIGURED');
    }

    const headers = new Headers(init?.headers);
    headers.set('Accept', 'application/json');
    const response = await fetchImpl(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`, {
      ...init,
      headers,
    });
    const payload = await parseJson(response);

    if (!response.ok) {
      const error = payload as ErrorPayload | undefined;
      const message =
        typeof error?.error?.message === 'string' ? error.error.message : response.statusText;
      const code = typeof error?.error?.code === 'string' ? error.error.code : 'REQUEST_FAILED';
      throw new ApiError(message || 'Request failed.', response.status, code);
    }

    return payload as T;
  };
}

export const apiFetch = createApiClient({ baseUrl: apiBaseUrl });

export function getHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>('/health');
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new ApiError(
      'The server returned invalid JSON.',
      response.status,
      'INVALID_JSON_RESPONSE',
    );
  }
}
