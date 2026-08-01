import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import {
  createGeneration,
  getGenerationJob,
  type GenerateRequest,
  type GenerationJob,
} from '@/lib/api';
import { getAnonymousDeviceId } from '@/lib/device-id';
import { useGenerationStore, type GenerationScope } from '@/stores/generation-store';

const terminalStatuses = new Set<GenerationJob['status']>(['failed', 'succeeded']);
function isTerminal(job: GenerationJob | undefined): boolean {
  return job ? terminalStatuses.has(job.status) : false;
}

export function useGenerate(scope: GenerationScope = 'create') {
  const session = useGenerationStore((state) => state.sessions[scope]);
  const setClientError = useGenerationStore((state) => state.setClientError);
  const setJobId = useGenerationStore((state) => state.setJobId);
  const start = useGenerationStore((state) => state.start);
  const [now, setNow] = useState(Date.now);
  const createMutation = useMutation({
    mutationFn: async (request: GenerateRequest) =>
      createGeneration({
        ...request,
        deviceId: request.deviceId ?? (await getAnonymousDeviceId()),
      }),
    onError: (reason) =>
      setClientError(
        scope,
        reason instanceof Error ? reason : new Error('Unable to start wallpaper generation.'),
      ),
    onSuccess: ({ jobId: nextJobId }) => setJobId(scope, nextJobId),
  });
  const jobQuery = useQuery({
    enabled: Boolean(session.jobId),
    queryFn: () => {
      if (!session.jobId) {
        throw new Error('A generation job id is required.');
      }

      return getGenerationJob(session.jobId);
    },
    queryKey: ['generation-job', session.jobId],
    refetchInterval: (query) => (isTerminal(query.state.data) ? false : 1_000),
  });
  const jobFailure =
    jobQuery.data?.status === 'failed'
      ? new Error(jobQuery.data.error ?? 'Wallpaper generation failed. Please try again.')
      : undefined;
  const error = session.clientError ?? createMutation.error ?? jobQuery.error ?? jobFailure;
  const cooldownSeconds = session.cooldownUntil
    ? Math.max(0, Math.ceil((session.cooldownUntil - now) / 1_000))
    : 0;

  useEffect(() => {
    if (!session.cooldownUntil || session.cooldownUntil <= Date.now()) {
      return;
    }

    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [session.cooldownUntil]);

  const generate = useCallback(
    (request: GenerateRequest) => {
      const startedAt = Date.now();
      if (!start(scope, request, startedAt)) {
        return;
      }

      setNow(startedAt);
      createMutation.mutate(request);
    },
    [createMutation, scope, start],
  );

  const regenerate = useCallback(() => {
    if (session.lastRequest) {
      generate(session.lastRequest);
    }
  }, [generate, session.lastRequest]);

  const retry = useCallback(() => {
    if (session.jobId && jobQuery.isError) {
      void jobQuery.refetch();
      return;
    }

    regenerate();
  }, [jobQuery, regenerate, session.jobId]);

  return {
    error,
    generate,
    isGenerating:
      createMutation.isPending ||
      (Boolean(session.jobId) && !isTerminal(jobQuery.data) && !jobQuery.isError),
    job: jobQuery.data,
    jobId: session.jobId,
    cooldownSeconds,
    regenerate,
    retry,
  };
}
