import { Routes, Route } from 'react-router-dom'
// import './App.css'
import UserForm from './components/UserForm'
import UserProfile from './components/UserProfile'
import LoginForm from './components/LoginForm'
import ProtectedRoute from './components/ProtectedRoute'
import UserSettings from './components/UserSettings'
import CreateDailyWorkout from './components/CreateDailyWorkout'
import ExerciseHistory from './components/ExerciseHistory'


function App() {

  return (
    <>
        <Routes>
          <Route path='/' element={<UserForm/>}/>
          <Route path='/userlogin' element={<LoginForm/>}/>
          <Route path='/userProfile' element={
            <ProtectedRoute>
              <UserProfile/>
            </ProtectedRoute>
          }/>
          <Route path='/userSettings/:id' element={<UserSettings/>}/>
          <Route path='/workout-plan' element={<CreateDailyWorkout/>}/>
          <Route path='/sessions/history' element={<ExerciseHistory/>}/>
        </Routes>
    </>
  )
}

export default App
