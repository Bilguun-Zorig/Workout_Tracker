import { useMemo, useState } from 'react'
import WeekPicker from './WeekPicker'
import { api } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { DaysOfWeekPicker, DayExerciseEditor } from './helpers/WorkoutHelpers'

const durationOptions = [4, 6, 8, 10, 12]

const CreatePlan = () => {

    const navigate = useNavigate();

    //Base fields
    const [title, setTitle] = useState('')
    const [instruction, setInstruction] = useState('')
    const [notes, setNotes] = useState('')
    const [durationWeeks, setDurationWeeks] = useState(8)

    //calendar
    const [startDateISO, setStartDateISO] = useState(null)
    const [preview, setPreview] = useState({ start: null, end: null })

    //Error messages
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    //schedule + template
    const [selectedDays, setSelectedDays] = useState([]) // Mon, Wed, Fri etc
    const [templateByDay, setTemplateByDay] = useState({}) // {Mon: [{label, name}], ...}

    const orderedDays = useMemo(
        () => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].filter( d => selectedDays.includes(d)), [selectedDays]
    )

    const handleWeekChange = ({ start, end }) => {
        setStartDateISO(start.toISOString());
        setPreview({
            start: start.startOf('week').format('YYYY-MM-DD'),
            end: end.endOf('week').format('YYYY-MM-DD')
        });
    };

    const setExercisesForDay = (day, exercises) => {
        setTemplateByDay(prev => ({...prev, [day]: exercises}))
    }

      const validate = () => {
    const e = {};
    if (!title) e.title = 'Title is required';
    if (!instruction) e.instruction = 'Instruction is required';
    if (!startDateISO) e.startDate = 'Start week is required';
    if (!durationWeeks) e.durationWeeks = 'Duration is required';
    if (orderedDays.length === 0) e.schedule = 'Pick at least one training day';
    // ensure each chosen day has at least one exercise
    for (const d of orderedDays) {
      const list = templateByDay[d] || [];
      if (list.length === 0) {
        e[`day:${d}`] = `Add at least one exercise for ${d}`;
      }
    }
    return e;
  };



    const savePlan = async () => {
        const e = validate()
        setErrors(e)

        if(Object.keys(e).length) return;

        try{
            setSubmitting(true)

            const weeklyTemplate = orderedDays.map( d => ({
                weekday: d,
                exercises: (templateByDay[d] || []).map(x => ({label: x.label, name: x.name.trim() }))
            }));

            await api.post('/workout-plan/new-plan', {
                title,
                instruction,
                startDate: startDateISO,
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
            submitting(false)
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

            <div>
                <div><strong>Select Start Week (Mon–Sun):</strong></div>
                <WeekPicker onWeekChange={handleWeekChange} />
                <div>
                {preview.start ? <>Selected: <b>{preview.start}</b> → <b>{preview.end}</b></> : 'Pick any day to select the whole week.'}
                </div>
                {errors.startDate && <p style={{ color: 'crimson' }}>{errors.startDate}</p>}
            </div>

            <div>
                <label htmlFor="totalWeek">Total Weeks:</label>
                <select value={durationWeeks} onChange={e => setDurationWeeks(parseInt(e.target.value, 10))}>
                    {durationOptions.map( w => <option key={w}>{w}</option>)}
                </select>
                {errors.durationWeeks && <p style={{ color: 'crimson' }}>{errors.durationWeeks}</p>}
                {
                    startDateISO && (
                        <div>
                            End preview: {' '}
                            <b>{dayjs(startDateISO).add(durationWeeks,'week').endOf('week').format('YYYY-MM-DD')}</b>
            &nbsp;• Deload week defaults to <b>Week {durationWeeks}</b>
                        </div>
                    )
                }
            </div>

            {/* Edit workout plan for each selected day */}
            {
                orderedDays.map( d => {
                    <div key={d}>
                        <DayExerciseEditor day={d} exercises={templateByDay[d] || []} onChange={(list) => setExercisesForDay(d, list)}/>
                        {errors[`day:${d}`] && <p style={{color:'crimson'}}>{errors[`day:${d}`]}</p>}
                    </div>
                })
            }

            <div>
                <label htmlFor="notes">Notes</label>
                                    <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="High effort, proper form, sleep 7-8h…"
                    />
                    {errors.notes && <p style={{color:'crimson'}}>{errors.notes}</p>}
            </div>

            {errors.form && <p style={{color:'crimson'}}>{errors.form}</p>}

            <button onClick={savePlan} disabled={submitting}>{submitting ? 'Saving...' : 'Save Plan'}</button>

        </div>

    )
}

export default CreatePlan