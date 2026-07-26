import Constants from 'expo-constants';

export type HealthResponse = { ok: boolean };

export type GenerationMode = 'text2img' | 'outpaint' | 'edit' | 'style' | 'upscale';

export type GenerationUserInputs = {
  idea?: string;
  mood?: string;
  theme?: string;
  tone?: string;
};

export type GenerateRequest = {
  deviceId?: string;
  height: number;
  mode: GenerationMode;
  presetId?: string;
  userInputs: GenerationUserInputs;
  width: number;
};

export type GenerateResponse = { jobId: string };

export type GenerationJobStatus = 'failed' | 'pending' | 'processing' | 'succeeded';

export type GenerationJob = {
  error?: string;
  height?: number;
  resultImageUrl?: string;
  status: GenerationJobStatus;
  width?: number;
};

export type PresetListItem = {
  category: string;
  coverImageUrl: string | null;
  id: string;
  name: string;
};

export type PresetsResponse = { presets: PresetListItem[] };

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

export function getPresets(): Promise<PresetsResponse> {
  return apiFetch<PresetsResponse>('/presets');
}

export function createGeneration(request: GenerateRequest): Promise<GenerateResponse> {
  return apiFetch<GenerateResponse>('/generate', {
    body: JSON.stringify(request),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
}

export function getGenerationJob(jobId: string): Promise<GenerationJob> {
  return apiFetch<GenerationJob>(`/jobs/${encodeURIComponent(jobId)}`);
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
