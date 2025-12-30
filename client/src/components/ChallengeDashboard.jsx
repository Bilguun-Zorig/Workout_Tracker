import {useEffect, useState} from 'react'
import {api} from '../api/axios'
import dayjs from './helpers/dayjsConfig'
import CreateChallenge from './CreateChallenge'
import CongratsPopsup from './CongratsPopsup'
import { useNavigate } from 'react-router-dom'

function formatTitle (c) {
    if(c?.title) return c.title;

    const typeLabel = {run: "Run", steps: 'Steps', swim: 'Swim', cycle: 'Cycle'}[c?.type] || c?.type || 'Challenge';
    return `${typeLabel} ${c?.target} ${c?.unit ?? ''} (${c.period ?? ''})`.trim()
}

const ChallengeDashboard = () => {
    const [challenges, setChallenges] = useState([])
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState('')

    const [logValue, setLogValue] = useState({})
    const [congrats, setCongrats] = useState({open: false, challenge: null})

    const navigate = useNavigate()

    const normalizeList = data => {
        //Accept multiple possible response shapes to avoid crashes during backend iteration
        if(Array.isArray(data?.challenges)) return data.challenges;
        if(Array.isArray(data?.items)) return data.items;
        if(Array.isArray(data?.activeChallenges)) return data.activeChallenges;
        if(Array.isArray(data?.challenge)) return data.challenge;
        return []
    }

    const load = async () => {
        try {
            setLoading(true)
            setErr('')
            const {data} = await api.get('/challenges/active-challenges')
            setChallenges(data.challenges || [])
        }catch(e) {
            setErr(e.response?.data?.message || 'Failed to load challenges')
            setChallenges([])
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
            const updated = data?.challenge || data?.updated || data?.item
            if(!updated?._id) throw new Error('Missing updated challenge in response')
            //update list
            setChallenges(prev => prev.map((c) => (c._id === id ? updated : c)))
            setLogValue(prev => ({...prev, [id]: ''}))

            //Show congrats if completed AND popup not shown yet
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
            const updated = data?.challenge || data?.updated || data?.item
            if(!updated?._id) return;

            setChallenges(prev => prev.map((c) => (c._id === challengeId ? updated : c)))
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
        <h2>Challenges</h2>
        <CreateChallenge onCreated={load} />
        {loading && <p>Loading...</p>}
        {err && <p>{err}</p>}

        {!loading && !err && challenges.length === 0 && (
            <p>No active challenges yet. Create one above.</p>
        )}

        <button type='button' onClick={() => navigate(-1)}>Back</button>

        {!loading && !err && challenges.length > 0 && (
            <ul>
                {/* {challenges.map(c => {
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
                })} */}

                {challenges.filter(Boolean).map((c) => {
                    const current = Number(c.current ?? 0)
                    const target = Number(c.target ?? 0)
                    const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
                    const title = formatTitle(c)

                    const startOk = dayjs(c.startDate).isValid()
                    const endOk = dayjs(c.endDate).isValid()

                    return (
                        <li key={c._id}>
                            <div>
                                <div>
                                    <strong>{title}</strong>

                                    <div>
                                        Window: {' '}
                                        {startOk ? dayjs(c.startDate).format('MMM DD') : '—'} →{' '}
                                        {endOk ? dayjs(c.endDate).subtract(1, 'day').format('MMM DD') : '—'}
                                    </div>

                                    <div>
                                        Progress: <strong>{current}</strong> / {target} {c.unit} ({pct}%)
                                        {c.isCompleted && <span>Completed!!</span>}
                                    </div>
                                </div>

                                <div>
                                    <input type="number" min='1' placeholder={`Add ${c.unit}`} value={logValue[c._id] ?? ''} onChange={(e) => setLogValue((prev) => ({...prev, [c._id]: e.target.value}))}/>
                                    <button onClick={() => log(c._id)} className='btn btn-primary btn-sm'>Log</button>
                                </div>

                                {/* progress bar */}
                                <div>
                                    <div style={{width: `${pct}%`, height: 10, borderRadius: 6, background: '#4caf50'}}/>
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