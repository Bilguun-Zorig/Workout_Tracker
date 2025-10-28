import React from "react";

//? Days picker (checkbox)

export function DaysOfWeekPicker ({value, onChange}) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    const toggle = day => {
        const set = new Set(value);
        set.has(day) ? set.delete(day) : set.add(day)

        onChange(Array.from(set))
    }

    return (
        <div>
            {
                days.map( (d) => (
                    <label key={d}>
                        <input type="checkbox" checked={value.includes(d)} onChange={() => toggle(d)}/>
                    </label>
                ))
            }
        </div>
    )


}

//? Exercise editor for each day
export function DayExerciseEditor ({day, exercise, onChange}) {
    const nextLabel = () => String.fromCharCode(65 + exercise.length) //A, B, C

    const addExercise = () => {
        const name = prompt(`Add exercise for ${day}:`)

        if(!name) return;
        onChange([...exercise, {label: nextLabel(), name: name.trim()}])
    };

    const removeExercise = index => {
        const updated = exercise.filter((_, i) => i !== index)
            .map((ex, i) => ({
                ...ex,
                label: String.fromCharCode(65 + i)
            }))
            onchange(updated)
    };

    const renameExercise = (index, name) => {
        const updated = [...exercise];
        updated[index] = {...updated[index], name}
        onChange(updated)
    };

    return (
        <div>
            <div>
                <strong>{day}</strong>
                <button type="button" onClick={addExercise}>+ Add exercise</button>
            </div>

            {
                exercise.length === 0 && <p>No exercise yet.</p>
            }
            {
                exercise.map((ex, i) => (
                    <div key={i}>
                        <span>{ex.label}</span>
                        <input type="text" value={ex.name} onChange={(e) => renameExercise(i, e.target.value)} placeholder="Exercise name"/>
                        <button type="button" onClick={() => removeExercise(i)}>Remove</button>
                    </div>
                ))
            }
        </div>
    )



}