import { useState } from 'react'
import WeekPicker from './WeekPicker'
import { api } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'


const durationOptions = [4, 6, 8, 10, 12]

const CreatePlan = () => {

    const navigate = useNavigate()
    const { user } = useAuth();

    const [title, setTitle] = useState('')
    const [instruction, setInstruction] = useState('')
    const [notes, setNotes] = useState('')
    const [durationWeeks, setDurationWeeks] = useState(8)

    const [startDateISO, setStartDateISO] = useState(null)

    const [preview, setPreview] = useState({ start: null, end: null })

    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    const handleWeekChange = ({ start, end }) => {
        setStartDateISO(start.toISOString());
        setPreview({
            start: start.format('YYYY-MM-DD'),
            end: end.format('YYYY-MM-DD')
        })
    }

    const savePlan = async () => {
        setErrors({})
        if (!title || !instruction || !startDateISO || !durationWeeks) {
            setErrors((e) => ({ ...e, form: 'Please, fill all required fields.' }))
            return;
        }
        try {
            setSubmitting(true)
            await api.post('/workout-plan/new-plan', {
                title,
                instruction,
                startDate: startDateISO,
                durationWeeks,
                notes
            })
            navigate('/userProfile')
        } catch (err) {
            console.log(err)
            const be = err.response?.data?.errors || {};

            const mapped = {
                title: be.title?.message || '',
                instruction: be.instruction?.message || '',
                startDate: be.startDate?.message || '',
                endDate: be.endDate?.message || '',
                durationWeeks: be.durationWeeks?.message || '',
                notes: be.notes?.message || '',
                form: err.response?.data?.message || 'Failed to create the plan'
            }
            setErrors(mapped)
        } finally {
            setSubmitting(false)
        }
    }


    return (
        <div style={{ maxWidth: 720, margin: '2rem auto', padding: '1rem' }}>
            <h2>Create Workout Plan</h2>

            <div style={{ marginBottom: 16 }}>
                <label>
                    <div>Plan Title *</div>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Push/Pull/Legs — 8 weeks"
                        style={{ width: '100%', padding: 8 }}
                    />
                </label>
                {errors.title && <p style={{ color: 'crimson' }}>{errors.title}</p>}
            </div>

            <div style={{ marginBottom: 16 }}>
                <label>
                    <div>Instruction *</div>
                    <textarea
                        rows={3}
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        placeholder="High effort, proper form, sleep 7-8h…"
                        style={{ width: '100%', padding: 8 }}
                    />
                </label>
                {errors.instruction && <p style={{ color: 'crimson' }}>{errors.instruction}</p>}
            </div>

            <div style={{ marginBottom: 16 }}>
                <div><strong>Select Start Week (Mon–Sun):</strong></div>
                <WeekPicker onWeekChange={handleWeekChange} />
                <div style={{ marginTop: 8, fontSize: 14, color: '#555' }}>
                    {preview.start ? (
                        <>
                            Selected week:&nbsp;
                            <strong>{preview.start}</strong> → <strong>{preview.end}</strong>
                        </>
                    ) : (
                        'Pick any day to select the whole week.'
                    )}
                </div>
                {errors.startDate && <p style={{ color: 'crimson' }}>{errors.startDate}</p>}
            </div>

            <div style={{ marginBottom: 16 }}>
                <label>
                    <div>Duration (weeks) *</div>
                    <select
                        value={durationWeeks}
                        onChange={(e) => setDurationWeeks(parseInt(e.target.value, 10))}
                        style={{ padding: 8 }}
                    >
                        {durationOptions.map((w) => (
                            <option key={w} value={w}>{w}</option>
                        ))}
                    </select>
                </label>
                {errors.durationWeeks && <p style={{ color: 'crimson' }}>{errors.durationWeeks}</p>}
                {/* Optional: show client-side preview of computed end date */}
                {startDateISO && (
                    <div style={{ marginTop: 6, fontSize: 13, color: '#666' }}>
                        Est. end date (preview):{' '}
                        <strong>
                            {dayjs(startDateISO).add(durationWeeks, 'week').endOf('week').format('YYYY-MM-DD')}
                        </strong>
                    </div>
                )}
            </div>

            <div style={{ marginBottom: 16 }}>
                <label>
                    <div>Notes</div>
                    <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Deload final week, adjust volume if needed…"
                        style={{ width: '100%', padding: 8 }}
                    />
                </label>
                {errors.notes && <p style={{ color: 'crimson' }}>{errors.notes}</p>}
            </div>

            {errors.form && <p style={{ color: 'crimson' }}>{errors.form}</p>}

            <button
                onClick={savePlan}
                disabled={submitting || !title || !instruction || !startDateISO || !durationWeeks}
                style={{ padding: '10px 16px' }}
            >
                {submitting ? 'Saving…' : 'Save Plan'}
            </button>
        </div>

    )
}

export default CreatePlan