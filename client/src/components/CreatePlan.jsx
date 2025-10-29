import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { api } from '../api/axios'
import isoWeek from 'dayjs/plugin/isoWeek';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateRangeCalendar } from '@mui/x-date-pickers/DateRangeCalendar';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import { DaysOfWeekPicker, DayExerciseEditor } from './helpers/WorkoutHelpers'

dayjs.extend(isoWeek)

const durationOptions = [4, 6, 8, 10, 12]

const CreatePlan = () => {

    const navigate = useNavigate();

    //Base fields
    const [title, setTitle] = useState('')
    const [instruction, setInstruction] = useState('')
    const [notes, setNotes] = useState('')

    //Duration and range
    const [durationWeeks, setDurationWeeks] = useState(8)
    const [range, setRange] = useState(() => {
        const start = dayjs().startOf('week')
        const end = start.add(8, 'week').endOf('week')
        return [start, end]
    })

    // weekday template 
    const [selectedDays, setSelectedDays] = useState([]) // Mon, Wed, Fri etc
    const [templateByDay, setTemplateByDay] = useState({}) // {Mon: [{label, name}], ...}
    const [activeWeekday, setActiveWeekday] = useState(null)

    //Error messages
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    const [start, end] = range;
    const minDate = start?.startOf('day') || null;
    const maxDate = end?.endOf('day') || null;


    const orderedDays = useMemo(
        () => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].filter(d => selectedDays.includes(d)), [selectedDays]
    )

    // Sync duration -> range (keep start fixed and change end)
    const onDurationChange = (weeks) => {
        setDurationWeeks(weeks);

        if (!start) {
            const s = dayjs().startOf('week')
            const e = s.add(weeks, 'week').endOf('week')
            setRange([s, e])
        } else {
            const e = start.add(weeks, 'week').endOf('week')
            setRange([start.startOf('week'), e])
        }
    }

    //Sync range - duration (snap to allowed nearest up)
    const onRangeChange = newRange => {
        setRange(newRange)
        const [s, e] = newRange;
        if (s && e) {
            const raw = Math.max(1, e.endOf('week').diff(s.startOf('week'), 'week'))
            const chosen = durationOptions.find(w => w >= raw) ?? durationOptions[durationOptions.length - 1];
            setDurationWeeks(chosen)
        }
    }

    //clicking any date inside range picks its weekday and opens that editor
    const handleDayClick = d => {
        if (!d || !start || !end) return;
        if (d.isBefore(start, 'day') || d.isAfter(end, 'day')) return;
        const wd = d.format('ddd');
        setActiveWeekday(wd);
        if (!selectedDays.includes(wd)) {
            setSelectedDays(prev => [...prev, wed])
        }
    }




    const setExercisesForDay = (day, exercises) => {
        setTemplateByDay(prev => ({ ...prev, [day]: exercises }))
    }

    const validate = () => {
        const e = {};
        if (!title) e.title = 'Title is required';
        if (!instruction) e.instruction = 'Instruction is required';
        if (!start || !end) e.range = "Date range is required";
        if (!durationWeeks) e.durationWeeks = 'Duration is required';
        if (orderedDays.length === 0) e.schedule = 'Pick at least one training day';
        for (const d of orderedDays) {
            const list = templateByDay[d] || [];
            if (list.length === 0) e[`day:${d}`] = `Add at least one exercise for ${d}`;
        }
        return e;
    };



    const savePlan = async () => {
        const e = validate()
        setErrors(e)

        if (Object.keys(e).length) return;

        try {
            setSubmitting(true)

            const weeklyTemplate = orderedDays.map(d => ({
                weekday: d,
                exercises: (templateByDay[d] || []).map(x => ({ label: x.label, name: x.name.trim() }))
            }));

            await api.post('/workout-plan/new-plan', {
                title,
                instruction,
                startDate: start.startOf('week').toISOString(),
                durationWeeks,
                notes,
                weeklyTemplate //New sent to API
            })
            navigate('/userProfile')
        } catch (err) {
            const be = err.response?.data || {};
            setErrors({
                form: be.message || 'Failed to create the plan.',
                ...Object.fromEntries(
                    Object.entries(be.errors || {}).map(([k, v]) => [k, v?.message || ''])
                ),
            });
            console.error(err);
        } finally {
            setSubmitting(false)
        }
    }


    return (
        <div>
            <h2>Create Workout Plan</h2>

            <div>
                    <label htmlFor='title'>Plan Title *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Push/Pull/Legs — 8 weeks"
                    />
                {errors.title && <p style={{ color: 'crimson' }}>{errors.title}</p>}
            </div>

            <div>
                    <label htmlFor='instruction'>Instruction *</label>
                    <textarea
                        rows={3}
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        placeholder="High effort, proper form, sleep 7-8h…"
                    />
                {errors.instruction && <p style={{ color: 'crimson' }}>{errors.instruction}</p>}
            </div>
            {/* Date range + duration */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:16, alignItems:'start' }}>
          <div>
            <label><strong>Date Range *</strong></label>
            <DateRangeCalendar
              value={range}
              onChange={onRangeChange}
            />
            {errors.range && <p style={{ color:'crimson' }}>{errors.range}</p>}
          </div>

          <div>
            <label>Total Weeks *</label>
            <select
              value={durationWeeks}
              onChange={(e) => onDurationChange(parseInt(e.target.value, 10))}
              style={{ width:'100%', padding:8 }}
            >
              {ALLOWED.map(w => <option key={w} value={w}>{w}</option>)}
            </select>

            {start && end && (
              <div style={{ marginTop:10, fontSize:13, color:'#555' }}>
                Start: <b>{start.startOf('week').format('YYYY-MM-DD')}</b><br/>
                End: <b>{end.endOf('week').format('YYYY-MM-DD')}</b><br/>
                Deload defaults to <b>Week {durationWeeks}</b>
              </div>
            )}
            {errors.durationWeeks && <p style={{ color:'crimson' }}>{errors.durationWeeks}</p>}

            {/* Click any date in-range to pick weekday to edit */}
            <div style={{ marginTop:18 }}>
              <label><strong>Click a date to edit that weekday</strong></label>
              <DateCalendar
                value={null}
                onChange={handleDayClick}
                minDate={minDate}
                maxDate={maxDate}
              />
              {errors.schedule && <p style={{ color:'crimson' }}>{errors.schedule}</p>}
            </div>
          </div>
        </div>
      </LocalizationProvider>

            {/* Show which days are selected */}
            <div>
                <label htmlFor="trainingDays"> Training days (repeated weekly)</label>
                <DaysOfWeekPicker value={selectedDays} onChange={selectedDays}/>
            </div>

            {/* Active weekday editor (if any) */}
            <div>
            <DayExerciseEditor day={activeWeekday} exercises={templateByDay[activeWeekday] || []} onChange={(list) => setExercisesForDay(activeWeekday, list)}/>
            {errors[`day:${activeWeekday}`] && <p style={{color:'crimson'}}>{errors[`day:${activeWeekday}`]}</p>}

            </div>

                  {/* Also render editors for *all* selected days (optional; keeps UX transparent) */}
                {orderedDays
                    .filter(d => d !== activeWeekday)
                    .map(d => (
                    <div key={d} style={{ marginTop: 12 }}>
                        <DayExerciseEditor
                        day={d}
                        exercises={templateByDay[d] || []}
                        onChange={(list) => setExercisesForDay(d, list)}
                        />
                        {errors[`day:${d}`] && <p style={{color:'crimson'}}>{errors[`day:${d}`]}</p>}
                    </div>
                    ))}
            {/* Notes */}
            <div>
                <label htmlFor="notes">Notes</label>
                                    <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="High effort, proper form, sleep 7-8h…"
                    />
            </div>

            {errors.form && <p style={{color:'crimson'}}>{errors.form}</p>}

            <button onClick={savePlan} disabled={submitting}>{submitting ? 'Saving...' : 'Save Plan'}</button>

        </div>
    )
}

export default CreatePlan