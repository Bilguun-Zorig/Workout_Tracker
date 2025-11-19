import {useEffect, useState} from 'react'
import {api} from '../api/axios'
import dayjs from './helpers/dayjsConfig'



const ExerciseHistory = ({sessionDate, label, onClose}) => {

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState('')

    useEffect(() => {
        let alive = true;

        (async () => {
            try{
                setLoading(true)
                setErr('')
                const { data } = await api.get('/workout-plan/sessions/history', {
                    params: {date: sessionDate, label, limit: 10}
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

    }, [sessionDate, label])


  return (
    <div>
        <div>
            <strong>History for {label} on same weekday</strong>
            <button onClick={onClose}>Close</button>

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