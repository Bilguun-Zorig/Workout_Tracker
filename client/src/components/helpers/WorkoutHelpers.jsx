import React from "react";

//? Days picker (checkbox)

export function DaysOfWeekPicker ({value, onChange}) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

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

export function DayExerciseEditor ({day, exercise, onChange}) {
    const nextLabel = () => String.fromCharCode


}