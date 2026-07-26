import { ApiError, createApiClient, resolveApiBaseUrl } from '../lib/api';

describe('api client', () => {
  it('uses the public environment URL ahead of the Expo config URL', () => {
    expect(
      resolveApiBaseUrl(
        { EXPO_PUBLIC_API_URL: 'http://192.168.1.10:3000/' },
        { apiUrl: 'https://ignored.example' },
      ),
    ).toBe('http://192.168.1.10:3000');
  });

  it('returns JSON from a successful request', async () => {
    const fetchImpl = jest
      .fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>()
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const apiFetch = createApiClient({ baseUrl: 'https://api.example', fetchImpl });

    await expect(apiFetch<{ ok: boolean }>('health')).resolves.toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.example/health',
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
  });

  it('turns server error payloads into typed errors', async () => {
    const apiFetch = createApiClient({
      baseUrl: 'https://api.example',
      fetchImpl: jest.fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>().mockResolvedValue(
        new Response(
          JSON.stringify({ error: { code: 'JOB_NOT_FOUND', message: 'Job was not found.' } }),
          {
            status: 404,
            statusText: 'Not Found',
          },
        ),
      ),
    });

    await expect(apiFetch('/jobs/missing')).rejects.toEqual(
      new ApiError('Job was not found.', 404, 'JOB_NOT_FOUND'),
    );
  });
});
