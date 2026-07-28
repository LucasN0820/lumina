import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import {
  createGeneration,
  getGenerationJob,
  type GenerateRequest,
  type GenerationJob,
  ApiError,
} from '@/lib/api';
import { getAnonymousDeviceId } from '@/lib/device-id';

const terminalStatuses = new Set<GenerationJob['status']>(['failed', 'succeeded']);
const clientCooldownMs = 5_000;

function isTerminal(job: GenerationJob | undefined): boolean {
  return job ? terminalStatuses.has(job.status) : false;
}

export function useGenerate() {
  const [jobId, setJobId] = useState<string>();
  const [lastRequest, setLastRequest] = useState<GenerateRequest>();
  const [cooldownUntil, setCooldownUntil] = useState<number>();
  const [now, setNow] = useState(Date.now);
  const [clientError, setClientError] = useState<Error>();
  const createMutation = useMutation({
    mutationFn: async (request: GenerateRequest) =>
      createGeneration({
        ...request,
        deviceId: request.deviceId ?? (await getAnonymousDeviceId()),
      }),
    onSuccess: ({ jobId: nextJobId }) => setJobId(nextJobId),
  });
  const jobQuery = useQuery({
    enabled: Boolean(jobId),
    queryFn: () => {
      if (!jobId) {
        throw new Error('A generation job id is required.');
      }

      return getGenerationJob(jobId);
    },
    queryKey: ['generation-job', jobId],
    refetchInterval: (query) => (isTerminal(query.state.data) ? false : 1_000),
  });
  const jobFailure =
    jobQuery.data?.status === 'failed'
      ? new Error(jobQuery.data.error ?? 'Wallpaper generation failed. Please try again.')
      : undefined;
  const error = clientError ?? createMutation.error ?? jobQuery.error ?? jobFailure;
  const cooldownSeconds = cooldownUntil ? Math.max(0, Math.ceil((cooldownUntil - now) / 1_000)) : 0;

  useEffect(() => {
    if (!cooldownUntil || cooldownUntil <= Date.now()) {
      return;
    }

    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [cooldownUntil]);

  const generate = useCallback(
    (request: GenerateRequest) => {
      if (cooldownUntil && cooldownUntil > Date.now()) {
        setClientError(
          new ApiError(
            `Please wait ${Math.ceil((cooldownUntil - Date.now()) / 1_000)} seconds.`,
            429,
            'RATE_LIMITED',
          ),
        );
        return;
      }

      setClientError(undefined);
      setCooldownUntil(Date.now() + clientCooldownMs);
      setNow(Date.now());
      setLastRequest(request);
      setJobId(undefined);
      createMutation.mutate(request);
    },
    [cooldownUntil, createMutation],
  );

  const regenerate = useCallback(() => {
    if (lastRequest) {
      generate(lastRequest);
    }
  }, [generate, lastRequest]);

  const retry = useCallback(() => {
    if (jobId && jobQuery.isError) {
      void jobQuery.refetch();
      return;
    }

    regenerate();
  }, [jobId, jobQuery, regenerate]);

  return {
    error,
    generate,
    isGenerating:
      createMutation.isPending ||
      (Boolean(jobId) && !isTerminal(jobQuery.data) && !jobQuery.isError),
    job: jobQuery.data,
    jobId,
    cooldownSeconds,
    regenerate,
    retry,
  };
}
