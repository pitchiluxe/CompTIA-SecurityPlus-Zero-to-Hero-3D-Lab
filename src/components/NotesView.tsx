import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useNotesStore } from '../store/useNotesStore';
import { Button, Card, EmptyState, PageHeader } from './ui';

export function NotesView() {
  const notes = useNotesStore((s) => s.notes);
  const addNote = useNotesStore((s) => s.addNote);
  const removeNote = useNotesStore((s) => s.removeNote);
  const [draft, setDraft] = useState('');

  return (
    <>
      <PageHeader
        title="Notes"
        subtitle="Your own words are what survive the exam. Notes are stored locally in this browser."
      />

      <Card className="mb-6">
        <label htmlFor="note-draft" className="block text-sm font-medium text-white">
          New note
        </label>
        <textarea
          id="note-draft"
          rows={4}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="A concept in your own words, a command worth remembering, a mistake you want to stop making."
          className="mt-2 w-full rounded border border-border bg-panel-2 p-3 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <div className="mt-2">
          <Button
            disabled={draft.trim().length === 0}
            onClick={() => {
              addNote({ content: draft.trim() });
              setDraft('');
            }}
          >
            Save note
          </Button>
        </div>
      </Card>

      {notes.length === 0 ? (
        <EmptyState
          title="No notes yet"
          body="Notes you save from lessons and from here will collect in this list."
        />
      ) : (
        <ul className="space-y-3">
          {[...notes]
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((note) => (
              <li key={note.id}>
                <Card>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="whitespace-pre-wrap text-sm text-white">{note.content}</p>
                      <p className="mt-2 text-xs text-muted">
                        {new Date(note.createdAt).toLocaleString()}
                        {note.lessonId && ` · ${note.lessonId}`}
                        {note.labId && ` · ${note.labId}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNote(note.id)}
                      aria-label="Delete note"
                      className="shrink-0 rounded p-1 text-muted transition-colors hover:bg-panel-2 hover:text-danger"
                    >
                      <Trash2 size={16} aria-hidden />
                    </button>
                  </div>
                </Card>
              </li>
            ))}
        </ul>
      )}
    </>
  );
}
