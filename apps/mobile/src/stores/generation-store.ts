import { create } from 'zustand';

import { ApiError, type GenerateRequest } from '@/lib/api';

export type GenerationScope = 'create' | 'edit';

type GenerationSession = {
  clientError?: Error;
  cooldownUntil?: number;
  jobId?: string;
  lastRequest?: GenerateRequest;
};

type GenerationState = {
  sessions: Record<GenerationScope, GenerationSession>;
};

type GenerationActions = {
  reset: (scope: GenerationScope) => void;
  setClientError: (scope: GenerationScope, error: Error) => void;
  setJobId: (scope: GenerationScope, jobId: string) => void;
  start: (scope: GenerationScope, request: GenerateRequest, now?: number) => boolean;
};

export type GenerationStore = GenerationState & GenerationActions;

export const clientCooldownMs = 5_000;

function createInitialSessions(): GenerationState['sessions'] {
  return { create: {}, edit: {} };
}

export const useGenerationStore = create<GenerationStore>()((set, get) => ({
  sessions: createInitialSessions(),
  reset: (scope) => set((state) => ({ sessions: { ...state.sessions, [scope]: {} } })),
  setClientError: (scope, clientError) =>
    set((state) => ({
      sessions: {
        ...state.sessions,
        [scope]: { ...state.sessions[scope], clientError },
      },
    })),
  setJobId: (scope, jobId) =>
    set((state) => ({
      sessions: {
        ...state.sessions,
        [scope]: { ...state.sessions[scope], jobId },
      },
    })),
  start: (scope, request, now = Date.now()) => {
    const session = get().sessions[scope];
    const cooldownUntil = session.cooldownUntil;

    if (cooldownUntil && cooldownUntil > now) {
      set((state) => ({
        sessions: {
          ...state.sessions,
          [scope]: {
            ...state.sessions[scope],
            clientError: new ApiError(
              `Please wait ${Math.ceil((cooldownUntil - now) / 1_000)} seconds.`,
              429,
              'RATE_LIMITED',
            ),
          },
        },
      }));
      return false;
    }

    set((state) => ({
      sessions: {
        ...state.sessions,
        [scope]: {
          clientError: undefined,
          cooldownUntil: now + clientCooldownMs,
          jobId: undefined,
          lastRequest: request,
        },
      },
    }));
    return true;
  },
}));
