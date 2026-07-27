import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import {
  createGeneration,
  getGenerationJob,
  type GenerateRequest,
  type GenerationJob,
} from '@/lib/api';
import { getAnonymousDeviceId } from '@/lib/device-id';

const terminalStatuses = new Set<GenerationJob['status']>(['failed', 'succeeded']);

function isTerminal(job: GenerationJob | undefined): boolean {
  return job ? terminalStatuses.has(job.status) : false;
}

export function useGenerate() {
  const [jobId, setJobId] = useState<string>();
  const [lastRequest, setLastRequest] = useState<GenerateRequest>();
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
  const error = createMutation.error ?? jobQuery.error ?? jobFailure;

  const generate = useCallback(
    (request: GenerateRequest) => {
      setLastRequest(request);
      setJobId(undefined);
      createMutation.mutate(request);
    },
    [createMutation],
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
    regenerate,
    retry,
  };
}
