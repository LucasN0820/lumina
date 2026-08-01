import { create } from 'zustand';

import type { CreateChipField, CreateChipValues } from '@/features/create/chips-selector';
import type { ExistingImageMode } from '@/features/edit/EditModePicker';
import type { GenerationQuality } from '@/lib/api';

type CreateState = {
  chipValues: CreateChipValues;
  idea: string;
  instruction: string;
  mode?: ExistingImageMode;
  presetId?: string;
  quality: GenerationQuality;
  sourceImageUrl?: string;
};

type CreateActions = {
  reset: () => void;
  setChip: (field: CreateChipField, value: string | undefined) => void;
  setIdea: (idea: string) => void;
  setInstruction: (instruction: string) => void;
  setMode: (mode: ExistingImageMode | undefined) => void;
  setPresetId: (presetId: string | undefined) => void;
  setQuality: (quality: GenerationQuality) => void;
  setSourceImageUrl: (sourceImageUrl: string | undefined) => void;
};

export type CreateStore = CreateState & CreateActions;

const initialCreateState: CreateState = {
  chipValues: {},
  idea: '',
  instruction: '',
  mode: undefined,
  presetId: undefined,
  quality: 'draft',
  sourceImageUrl: undefined,
};

export const useCreateStore = create<CreateStore>()((set) => ({
  ...initialCreateState,
  reset: () => set(initialCreateState),
  setChip: (field, value) =>
    set((state) => ({ chipValues: { ...state.chipValues, [field]: value } })),
  setIdea: (idea) => set({ idea }),
  setInstruction: (instruction) => set({ instruction }),
  setMode: (mode) => set({ mode }),
  setPresetId: (presetId) => set({ presetId }),
  setQuality: (quality) => set({ quality }),
  setSourceImageUrl: (sourceImageUrl) => set({ sourceImageUrl }),
}));
