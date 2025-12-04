import React from 'react';

/** Recompute labels A, B, C… after any insert/remove */
export function relabelExercises(list) {
  return list.map((ex, i) => ({
    ...ex,
    label: String.fromCharCode(65 + i),
  }));
}

/** Next label based on current length */
export function nextLabelFor(length) {
  return String.fromCharCode(65 + length);
}

/** Single exercise row (A/B/C …) */
export function ExerciseRow({ ex, onName, onResult, onRemove, onVideoUrl, onRpe }) {
  return (
    <div>
      <strong>{ex.label}</strong>
      <input
      type='text'
        placeholder="Exercise name (e.g., Front Squat)"
        value={ex.name}
        onChange={(e) => onName(e.target.value)}
      />
      <input
        type='text'
        placeholder="Result/notes (e.g., 3×5 @ 185)"
        value={ex.result}
        onChange={(e) => onResult(e.target.value)}
      />
      <input 
        type="text"
        placeholder="Video URL (optional)"
        value={ex.videoUrl || ''}
        onChange={(e) => onVideoUrl(e.target.value)}/>

      {
        typeof onRpe === 'function' && (
                <input type="number" min={1} max={10} placeholder='RPE (1-10)' value={ex.rpe ?? ''} onChange={e => {
        const v = e.target.value;
        onRpe && onRpe(v === '' ? '' : Number(v))
      }}/>
        )
      }

      <button type="button" onClick={onRemove}>Remove</button>
    </div>
  );
}
