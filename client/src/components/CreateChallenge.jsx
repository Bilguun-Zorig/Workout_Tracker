import { useState } from 'react'
import { api } from '../api/axios'

const typeToDefaultUnit = type => (type === 'steps' ? 'steps' : 'miles')

const CreateChallenge = ({ onCreated }) => {
    const [type, setType] = useState('run')
    const [period, setPeriod] = useState('weekly')
    const [target, setTarget] = useState('')
    const [unit, setUnit] = useState('miles')
    const [title, setTitle] = useState('')
    const [msg, setMsg] = useState('')

    const onTypeChange = v => {
        setType(v)
        const u = typeToDefaultUnit(v)
        setUnit(v)
    }

    const submit = async (e) => {
        e.preventDefault()
        setMsg('')

        const targetNum = target === '' ? null : Number(target)
        if (targetNum == null || Number.isNaN(targetNum) || targetNum <= 0) {
            setMsg('Target must be a positive number')
            return
        }

        try {
            const payload = {
                type,
                period,
                target: targetNum,
                unit,
                title: title.trim()
            }

            const { data } = await api.post('/challenges', payload)
            setMsg('Challenge created')
            setTarget('')
            setTitle('')
            onCreated?.(data.challenge)

        } catch (err) {
            setMsg(err.response?.data?.message || 'Failed to create challenge')
        }
    }



    return (
        <div>
            <form onSubmit={submit}>
                <h4>Create A Challenge</h4>
                <div>
                    <div>
                        <label htmlFor="type">Type</label>
                        <select value={type} onChange={e => onTypeChange(e.target.value)}>
                            <option value="run">Run</option>
                            <option value="steps">Steps</option>
                            <option value="swim">Swim</option>
                            <option value="cycle">Cycle</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="period">Period</label>
                        <select value={period} onChange={e => setPeriod(e.target.value)}>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="target">Target</label>
                        <input type="number" min="1" value={target} onChange={e => setTarget(e.target.value)}/>
                    </div>

                    <div>
                        <label htmlFor="unit">Unit</label>
                        <select value={unit} onChange={e => setUnit(e.target.value)} disabled={type === "steps"}>
                            <option value="miles">Miles</option>
                            <option value="km">km</option>
                            <option value="step">steps</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="title">Title</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder='e.g., Run 30 miles this week'/>
                    </div>

                    {msg && <p>{msg}</p>}
                </div>
                <button type='submit' className='btn btn-success'>Create</button>
            </form>
        </div>
    )
}

export default CreateChallenge