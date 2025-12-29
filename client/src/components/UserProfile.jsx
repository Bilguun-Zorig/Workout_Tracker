import { useEffect, useState } from 'react'
import { api } from '../api/axios'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
// import dayjs from 'dayjs';
import dayjs from './helpers/dayjsConfig'
import ExerciseCommentRow from './ExerciseCommentRow'

const UserProfile = () => {

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [allSessions, setAllSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessages, setErrorMessages] = useState('')

  const [deloadInfo, setDeloadInfo] = useState(null)

  console.log(user)

  const [categoryFilter, setCategoryFilter] = useState('')
  
  const handleLogoutClick = async () => {
    try {
      await logout();
      navigate('/')
    } catch (err) {
      console.log(err)
    }
  }
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true)
        setErrorMessages('')

        //For the range query 
        const startOfWeek = dayjs().startOf('week');
        const nextWeek = startOfWeek.add(1, 'week');

        const { data } = await api.get('/workout-plan/sessions-by-weekly', {
          params: { from: startOfWeek.toISOString(), to: nextWeek.toISOString() }
        })
        if (!alive) return;
        setAllSessions(data.allSessions || [])
      } catch (err) {
        if (!alive) return;
        setErrorMessages(err.response?.data?.message || 'Failed to load sessions');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false }

  }, [])


  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data } = await api.get('/workout-plan/session/deload-check')
        //!Test to trigger deload week reminder
        // const { data } = await api.get('/workout-plan/session/deload-check', {params: {testDate: '2025-12-08', force: '1'}})

        console.log('DELOAD API: ', data); // <-- see what the backend returns

        if (!alive) return;
        if (data.shouldDeload) {
          setDeloadInfo(data)
        }
      } catch (err) {
        console.log('Deload check failed', err)
      }
    })();

    return () => { alive = false }

  }, [])



  return (
    <div>
      <div className="btn-group">
        <button className="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">{user?.firstName}</button>
        <ul className="dropdown-menu">
          {/* <li><a className="dropdown-item" href="/userSettings">Settings</a></li> */}
          <li><Link to={`/userSettings/${user._id}`} className="dropdown-item">Settings</Link></li>
          <li><a className="dropdown-item" href="#">Another action</a></li>
          <li><a className="dropdown-item" href="#">Something else here</a></li>
          <li><hr className="dropdown-divider"></hr></li>
          <li><button onClick={handleLogoutClick} className="dropdown-item">Logout</button></li>
        </ul>
        <Link to={'/workout-plan'}>Create Your Workout Plan</Link>
        <Link to={'/challenges'}>Create Challenge </Link>
      </div>
      {/* Deload pop-up */}
      {
        deloadInfo && (
          <div>
            <p>
              This is your {deloadInfo.weekNumber}th week starting
              This should be a deload week - consider reducing volume/intensity.
            </p>
            <button type='button' onClick={() => setDeloadInfo(null)}>Close</button>
          </div>
        )
      }

      {
        loading && <p>Loading sessions...</p>
      }
      {
        errorMessages && <p>{errorMessages}</p>
      }
      <div>
        <label htmlFor="categoryFilter">
          Filter by category: {' '}
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All</option>
            <option value="strength">🟦 Strength</option>
            <option value="hyrox">🟩 Hyrox</option>
            <option value="cardio">🟨 Cardio</option>
            <option value="mobility">🟥 Mobility</option>
          </select>
        </label>
      </div>
      {
        !loading && !errorMessages && (
          <main>
            {allSessions.length === 0 ? (<p>No workout session yet.</p>) : (
              <ul>
                {
                  allSessions.map(s => {
                    const exercisesForSession = Array.isArray(s.exercises) ? s.exercises : [];

                    const filteredExercises = categoryFilter ? exercisesForSession.filter(ex => ex.category === categoryFilter) : exercisesForSession;

                    if(categoryFilter && filteredExercises.length === 0) return null;

                    return (
                      <li key={s._id}>
                        <p>{dayjs(s.date).format('ddd, MM/DD/YYYY')}</p>
                        {filteredExercises.length > 0 ? (
                          <ol>
                            {filteredExercises.map((ex, i) => (
                              <ExerciseCommentRow
                                key={i}
                                sessionDate={s.date}
                                exercise={ex}
                                onSaved={(updatedSession) => {
                                  setAllSessions(prev =>
                                    prev.map(x => (x._id === updatedSession._id ? updatedSession : x))
                                  );
                                }}
                              />
                            ))}
                          </ol>
                        ) : (<p>No exercises saved</p>)}
                      </li>
                    )

                  })
                }
              </ul>
            )}
          </main>
        )
      }
    </div>
  )
}

export default UserProfile