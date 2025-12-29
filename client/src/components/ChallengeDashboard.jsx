import {useEffect, useState} from 'react'
import {api} from '../api/axios'
import dayjs from './helpers/dayjsConfig'
import CreateChallenge from './CreateChallenge'
import CongratsPopsup from './CongratsPopsup'

function formatTitle (c) {
    if(c.title) return c.title;

    const typeLabel = {run: "Run", steps: 'Steps', swim: 'Swim', cycle: 'Cycle'}[c.type] || c.type;
    return `${typeLabel} ${c.target} ${c.unit} (${c.period})`
}

const ChallengeDashboard = () => {
    const [challenges, setChallenges] = useState([])
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState('')

    const [logValue, setLogValue] = useState({})
    const [congrats, setCongrats] = useState({open: false, challenge: null})

    const load = async () => {
        try {
            setLoading(true)
            setErr('')
            const {data} = await api.get('/challenges/active-challenges')
            setChallenges(data.challenges || [])
        }catch(e) {
            setErr(e.response?.data?.message || 'Failed to load challenges')
        }finally{
            setLoading(false)
        }
    }

    useEffect(() => {load()}, [])

    const log = async(id) => {
        const v = logValue[id]
        const amount = v === '' || v == null ? null : Number(v)
        if(amount == null || Number.isNaN(amount) || amount <= 0) return;

        try {
            const {data} = await api.patch(`/challenges/${id}/log`, {amount})

            //update list
            setChallenges(prev => prev.map(c => (c._id === id ? data.challenge : c)))
            setLogValue(prev => ({...prev, [id]: ''}))

            //show congrats if completed AND popup not shown yet
            const updated = data.challenge
            if(updated.isCompleted && !updated.celebrationShownAt) {
                setCongrats({open: true, challenge: updated})
            }

        } catch (e) {
            alert(e.response?.data?.message || 'Failed to log progress')
        }
    }

    const markShown = async(challengeId) => {
        try {
            const {data} = await api.patch(`/challenges/${challengeId}/celebration-shown`)
            setChallenges(prev => prev.map(c => (c._id === challengeId ? data.challenge : c)))
        } catch {
            // ignore
        }
    }
    
    const closeCongrats = async () => {
        const c = congrats.challenge
        setCongrats({open: false, challenge: null})
        if(c?._id) await markShown(c._id)
    }

  return (
    <div>
        <h2>Challenge</h2>
        {loading && <p>Loading...</p>}
        {err && <p>{err}</p>}

        {!loading && !err && challenges.length === 0 && (
            <p>No active challenges yet. Create one above.</p>
        )}

        {!loading && !err && challenges.length > 0 && (
            <ul>
                {challenges.map(c => {
                    const pct = Math.min(100, Math.round((c.current / c.target) * 100))
                    const title = formatTitle(c)

                    return (
                        <li key={c._id}>
                            <div>
                                <div>
                                    <strong>{title}</strong>
                                    <div>
                                        Window: {dayjs(c.startDate).format('MMM DD')} - {dayjs(c.endDate).subtract(1, 'day').format('MMM DD')}
                                    </div>
                                    <div>
                                        Progress: <strong>{c.current}</strong> / {c.target} {c.unit} ({pct}%)
                                        {c.isCompleted && <span>Completed</span>}
                                    </div>
                                </div>

                                <div>
                                    <input type="number" min='1' placeholder={`Add ${c.unit}`} value={logValue[c._id] ?? ''} onChange={e => setLogValue(prev => ({...prev, [c._id]: e.target.value }))}/>
                                    <button onClick={() => log(c._id)} className='btn btn-primary btn-sm'>Log</button>
                                </div>
                            </div>
                        </li>
                    )
                })}

            </ul>
        )}

        <CongratsPopsup open={congrats.open} title={congrats.challenge ? formatTitle(congrats.challenge) : ''} onClose={closeCongrats}/>

    </div>
  )
}

export default ChallengeDashboard