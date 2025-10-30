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
export function ExerciseRow({ ex, onName, onResult, onRemove }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
      <strong style={{ width: 24 }}>{ex.label}</strong>
      <input
        style={{ flex: 1, padding: 6 }}
        placeholder="Exercise name (e.g., Front Squat)"
        value={ex.name}
        onChange={(e) => onName(e.target.value)}
      />
      <input
        style={{ flex: 1, padding: 6 }}
        placeholder="Result/notes (e.g., 3×5 @ 185)"
        value={ex.result}
        onChange={(e) => onResult(e.target.value)}
      />
      <button type="button" onClick={onRemove}>Remove</button>
    </div>
  );
}
