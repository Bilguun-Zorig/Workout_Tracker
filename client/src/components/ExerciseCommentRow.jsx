// components/ExerciseCommentRow.jsx
import { useState } from 'react';
import { api } from '../api/axios';
import ExerciseHistory from './ExerciseHistory';
import { Link } from 'react-router-dom'

export default function ExerciseCommentRow({ sessionDate, exercise, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(exercise.comment || '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);

  const [rpe, setRpe] = useState(typeof exercise.rpe === 'number' ? exercise.rpe : '')

  const save = async () => {
    try {
      setSaving(true);
      setErr('');

      const payload = {
        date: sessionDate,
        label: exercise.label,
        comment: value,
        rpe: rpe === '' ? '' : Number(rpe)
      }

      const { data } = await api.patch('/workout-plan/session/exercise-comment', payload);

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
          <input type="number" min={1} max={10} value={rpe} onChange={(e) => {const v = e.target.value; setRpe(v === '' ? '' : Number(v))}} placeholder='RPE 1 - 10'/>
          <button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          <button onClick={() => { setEditing(false); setValue(exercise.comment || ''); }}>Cancel</button>
          {err && <span>{err}</span>}
        </>
      ) : (
        <>
          {exercise.comment ? ` — ${exercise.comment}` : ' — (no comment)'}
          {typeof exercise.rpe === 'number' && `(RPE : ${exercise.rpe})`}
          <button onClick={() => setEditing(true)}>Comment</button>
          {/* <button onClick={() => setHistoryOpen(true)}>History</button> */}
          <Link to={'/sessions/history'} state={{sessionDate}}><button>History</button></Link>
        </>
      )}

      {/* {historyOpen && (
        <ExerciseHistory sessionDate={sessionDate} label={exercise.label} onClose={() => setHistoryOpen(false)}/>
      )} */}

      {
        exercise.videoUrl && (
          <>
            <a href={exercise.videoUrl} target='_blank' rel='noreferrer'>Watch video</a>          
          </>
        )
      }
    </li>
  );
}
