import {useEffect, useState} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api/axios'
import dayjs from './helpers/dayjsConfig'

const ExerciseProgress = () => {

  const [points, setPoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const location = useLocation()
  const navigate = useNavigate()

  const {exerciseName} = location.state || {}

  useEffect(() => {
    if(!exerciseName) {
        setErr('Missing exercise name. Please open progress from a workout session')
        setLoading(false)
        return
    }

    let alive = true;

    (async () => {
        try{
            setLoading(true)
            setErr('')
            const {data} = await api.get('/workout-plan/session/progress', {params: {name: exerciseName}})

            if(!alive) return
            setPoints(data.points || [])
        } catch (e) {
            if (!alive) return;
            setErr(e.response?.data?.message || 'Failed to load progress')
        }finally {
            if (alive) setLoading(false)
        }
    })()

    return () => {alive = false}

  }, [exerciseName])

  return (
    <div>
        <button type='button' onClick={() => navigate(-1)}>Back</button>
        <h2>Progress for: {exerciseName || '(unknown)'}</h2>
        {loading && <p>{err}</p>}

        {!loading && !err && points.length === 0 && (<p>No history found yet for this exercise</p>)}

        {!loading && !err && points.length > 0 && (
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Result</th>
                        <th>RPE</th>
                        <th>PR</th>
                        <th>Comment</th>
                    </tr>
                </thead>
                <tbody>
                    {points.map((p, idx) => (
                        <tr key={idx}>
                            <td>{dayjs(p.date).format('YYYY-MM_MD')}</td>
                            <td>{p.result}</td>
                            <td>{typeof p.rpe === 'number' ? p.rpe : '-'}</td>
                            <td>{p.isPr ? '🏅' : ''}</td>
                            <td>{p.comment || ''}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </div>
  )
}

export default ExerciseProgress