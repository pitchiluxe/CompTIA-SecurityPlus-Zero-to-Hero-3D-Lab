import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getLesson } from '../data/curriculum';
import { topicsForConcepts } from '../lib/iamBridgeEngine';
import { useNotesStore } from '../store/useNotesStore';
import { useProgressStore } from '../store/useProgressStore';
import { Button, Card, EmptyState, PageHeader } from './ui';

export function LessonView() {
  const { lessonId = '' } = useParams();
  const lesson = getLesson(lessonId);

  const markLessonComplete = useProgressStore((s) => s.markLessonComplete);
  const isLessonComplete = useProgressStore((s) => s.isLessonComplete);
  const addNote = useNotesStore((s) => s.addNote);
  const [noteDraft, setNoteDraft] = useState('');

  if (!lesson) {
    return <EmptyState title="Lesson not found" body={`No lesson matches "${lessonId}".`} />;
  }

  const complete = isLessonComplete(lesson.phaseId, lesson.id);
  // Phase 27 asks for the IAM connection to be made continuously, not only on
  // its own page — so any lesson whose concepts feed a bridge topic says so.
  const bridgeTopics = topicsForConcepts(lesson.concepts);

  return (
    <>
      <PageHeader
        title={lesson.title}
        subtitle={lesson.careerConnection}
        actions={
          <>
            <Link
              to={`/quiz/${lesson.id}`}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent/85"
            >
              Take the quiz
            </Link>
            <Button
              variant="ghost"
              onClick={() => markLessonComplete(lesson.phaseId, lesson.id)}
              disabled={complete}
            >
              {complete ? 'Completed' : 'Mark complete'}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {lesson.sections.map((section) => (
            <Card key={section.id}>
              <h2 className="text-base font-semibold text-white">{section.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{section.body}</p>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Homework</h2>
            <p className="mt-2 text-sm leading-relaxed text-white" data-testid="lesson-homework">
              {lesson.homework}
            </p>
            <p className="mt-2 text-xs text-muted">
              Only ever on systems you own or are authorised to test.
            </p>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Learning objectives
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm text-white">
              {lesson.objectives.map((o) => (
                <li key={o}>· {o}</li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Concepts tracked
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {lesson.concepts.map((c) => (
                <span
                  key={c}
                  className="rounded bg-panel-2 px-2 py-0.5 font-mono text-xs text-accent"
                >
                  {c}
                </span>
              ))}
            </div>
          </Card>

          {bridgeTopics.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                IAM career bridge
              </h2>
              <p className="mt-2 text-xs text-muted">
                These concepts carry into identity work. The bridge covers how each one is
                implemented, what it writes to a log, and how it is investigated.
              </p>
              <ul className="mt-3 space-y-1.5 text-sm" data-testid="lesson-iam-bridge">
                {bridgeTopics.map((t) => (
                  <li key={t.id}>
                    <Link to="/iam-bridge" className="text-white hover:text-accent">
                      {t.question}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Add a note
            </h2>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={4}
              aria-label="Lesson note"
              placeholder="What clicked? What still does not?"
              className="mt-3 w-full rounded border border-border bg-panel-2 p-2 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none"
            />
            <div className="mt-2">
              <Button
                variant="ghost"
                disabled={noteDraft.trim().length === 0}
                onClick={() => {
                  addNote({ lessonId: lesson.id, content: noteDraft.trim() });
                  setNoteDraft('');
                }}
              >
                Save note
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
