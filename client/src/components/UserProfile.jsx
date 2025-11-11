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

  console.log(user)
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
      </div>

      {
        loading && <p>Loading sessions...</p>
      }
      {
        errorMessages && <p>{errorMessages}</p>
      }
      {
        !loading && !errorMessages && (
          <main>
            {allSessions.length === 0 ? (<p>No workout session yet.</p>) : (
              <ul>
                {
                  allSessions.map(s => (
                    <li key={s._id}>
                      {/* <p>{new Date(s.date).toLocaleDateString()}</p> */}
                      <p>{dayjs(s.date).format('ddd, MM/DD/YYYY')}</p>
                      {
                        Array.isArray(s.exercises) && s.exercises.length > 0 ? (
                          <ol>
                            {s.exercises.map((ex, i) => (
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
                        ) : (<p>No exercises saved</p>)
                      }
                    </li>
                  ))
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