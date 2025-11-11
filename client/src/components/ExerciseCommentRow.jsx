// components/ExerciseCommentRow.jsx
import { useState } from 'react';
import { api } from '../api/axios';

export default function ExerciseCommentRow({ sessionDate, exercise, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(exercise.comment || '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const save = async () => {
    try {
      setSaving(true);
      setErr('');
      const { data } = await api.patch('/workout-plan/session/exercise-comment', {
        date: sessionDate,
        label: exercise.label,
        comment: value
      });
      onSaved?.(data.session); // parent replaces session in state
      setEditing(false);
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <li>
      <strong>{exercise.label}</strong>: {exercise.name}{' '}
      {exercise.result ? <em>({exercise.result})</em> : null}{' '}
      {editing ? (
        <>
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Add comment..." />
          <button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          <button onClick={() => { setEditing(false); setValue(exercise.comment || ''); }}>Cancel</button>
          {err && <span>{err}</span>}
        </>
      ) : (
        <>
          {exercise.comment ? ` — ${exercise.comment}` : ' — (no comment)'}
          <button onClick={() => setEditing(true)}>Comment</button>
        </>
      )}
    </li>
  );
}
