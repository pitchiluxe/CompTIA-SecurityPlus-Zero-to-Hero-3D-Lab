import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { EvidenceItem } from '../types';

type EvidenceStore = {
  evidence: EvidenceItem[];
  addEvidence: (labId: string, label: string, type: EvidenceItem['type'], content: string) => void;
  removeEvidence: (id: string) => void;
  getEvidenceForLab: (labId: string) => EvidenceItem[];
  clearLabEvidence: (labId: string) => void;
};

export const useEvidenceStore = create<EvidenceStore>()(
  persist(
    (set, get) => ({
      evidence: [],

      addEvidence: (labId, label, type, content) => {
        set((state) => ({
          evidence: [
            ...state.evidence,
            {
              id: crypto.randomUUID(),
              labId,
              label,
              type,
              content,
              capturedAt: Date.now(),
            },
          ],
        }));
      },

      removeEvidence: (id) => {
        set((state) => ({
          evidence: state.evidence.filter((e) => e.id !== id),
        }));
      },

      getEvidenceForLab: (labId) => {
        return get().evidence.filter((e) => e.labId === labId);
      },

      clearLabEvidence: (labId) => {
        set((state) => ({
          evidence: state.evidence.filter((e) => e.labId !== labId),
        }));
      },
    }),
    {
      name: 'securityplus-evidence',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
