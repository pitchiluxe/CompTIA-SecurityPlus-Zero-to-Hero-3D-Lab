import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Note } from '../types';

type NotesStore = {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  removeNote: (id: string) => void;
  getNotesForLesson: (lessonId: string) => Note[];
};

export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      notes: [],

      addNote: (note) => {
        set((state) => ({
          notes: [
            ...state.notes,
            {
              ...note,
              id: crypto.randomUUID(),
              createdAt: Date.now(),
            },
          ],
        }));
      },

      removeNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        }));
      },

      getNotesForLesson: (lessonId) => {
        return get().notes.filter((n) => n.lessonId === lessonId);
      },
    }),
    {
      name: 'securityplus-notes',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
