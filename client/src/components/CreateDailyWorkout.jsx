import { useEffect, useMemo, useState } from 'react';
// import dayjs from 'dayjs';
import dayjs from './helpers/dayjsConfig'
import { api } from '../api/axios';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { ExerciseRow, relabelExercises, nextLabelFor } from './helpers/WorkoutHelpers';

export default function CreateDailyWorkout() {
  const [date, setDate] = useState(dayjs());
  const [exercises, setExercises] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const nextLabel = useMemo(() => nextLabelFor(exercises.length), [exercises.length]);

  const addExercise = () => {
    setExercises((prev) => [...prev, { label: nextLabel, name: '', result: '' }]);
  };

  const removeExercise = (i) => {
    setExercises((prev) => relabelExercises(prev.filter((_, idx) => idx !== i)));
  };

  const updateName = (i, name) => {
    setExercises((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], name };
      return copy;
    });
  };

  const updateResult = (i, result) => {
    setExercises((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], result };
      return copy;
    });
  };

    const updateVideoUrl = (i, videoUrl) => {
    setExercises((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], videoUrl };
      return copy;
    });
  };

  // Optional: load existing session when a date is picked
  useEffect(() => {
    (async () => {
      setMsg('');
      if (!date) return;
      try {
        const iso = dayjs(date).startOf('day').toISOString();
        const { data } = await api.get('/workout-plan/by-date', { params: { date: iso } });
        const list = data.session?.exercises || [];
        setExercises(relabelExercises(list.map((x) => ({
          label: x.label ?? '',
          name: x.name ?? '',
          result: x.result ?? '',
          videoUrl: x.videoUrl ?? '',
        }))));
      } catch {
        setExercises([]);
      }
    })();
  }, [date]);

  const save = async () => {
    setMsg('');
    if (!date) { setMsg('Pick a date'); return; }
    if (!exercises.some(e => e.name.trim())) { setMsg('Add at least one exercise'); return; }

    try {
      setSaving(true);
      await api.post('/workout-plan/new-plan', {
        date: dayjs(date).startOf('day').toISOString(),
        exercises: exercises.map((x, i) => ({
          label: x.label || String.fromCharCode(65 + i),
          name: x.name.trim(),
          result: (x.result || '').trim(),
          videoUrl: (x.videoUrl || '').trim(),
        })),
      });
      setMsg('Saved ✅');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2>Create / Edit Daily Workout</h2>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div style={{ marginBottom: 16 }}>
          <DatePicker
            label="Pick training date"
            value={date}
            onChange={setDate}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </div>
      </LocalizationProvider>

      <div>
        <button type="button" onClick={addExercise}>+ Add exercise ({nextLabel})</button>
      </div>

      {exercises.length === 0 && <p>No exercises yet.</p>}
      {exercises.map((ex, i) => (
        <ExerciseRow
          key={i}
          ex={ex}
          onName={(v) => updateName(i, v)}
          onResult={(v) => updateResult(i, v)}
          onRemove={() => removeExercise(i)}
          onVideoUrl={(v) => updateVideoUrl(i, v)}
        />
      ))}

      {msg && <p>{msg}</p>}

      <div>
        <button disabled={saving} onClick={save}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
