import {useEffect, useState} from 'react'
import {api} from '../api/axios'
import dayjs from './helpers/dayjsConfig'
import { useLocation, useNavigate } from 'react-router-dom'



const ExerciseHistory = () => {

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState('')

    const location = useLocation()
    const navigate = useNavigate()

    //data passed from Link state
    const {sessionDate} = location.state || {}

    useEffect(() => {

        //If user opened /sessions/history directly with no state
        if(!sessionDate) {
            setErr('Missing exercise context. Please open history from a workout session')
            setLoading(false)
            return;
        }

        let alive = true;

        (async () => {
            try{
                setLoading(true)
                setErr('')
                const { data } = await api.get('/workout-plan/sessions/history', {
                    params: {date: sessionDate, limit: 10}
                })
                if(!alive) return;
                setItems(data.items || []);
            } catch (e) {
                if(!alive) return;
                setErr(e.response?.data?.message || 'Failed to load history')
            } finally {
                if(alive) setLoading(false);
            }
        })();

    }, [sessionDate])


  return (
    <div>
        <button type='button' onClick={() => navigate(-1)}>Back</button>
        <div>
            <strong>History for same weekday as {' '}</strong>
            {/* <button onClick={onClose}>Close</button> */}

            {loading && <p>Loading...</p>}
            {err && <p>{err}</p>}

            {
                !loading && !err && (
                    <ul>
                        {items.length === 0 ? (
                            <li>No previous entries.</li>
                        ) : (
                            items.map((s) => (
                                <li key={s._id || s.date}>
                                    <div>{dayjs(s.date).format('ddd, MM/DD/YYYY')}</div>
                                    <ul>
                                        {(s.exercises || []).map((ex, i) => (
                                            <li key={i}>
                                                <strong>{ex.label}</strong>: {ex.name}
                                                {ex.result ? `(${ex.result})` : ''}
                                                {ex.comment ? `-(${ex.comment})` : ''}

                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))
                        )}
                    </ul>
                )
            }

        </div>
    </div>
  )
}

export default ExerciseHistory