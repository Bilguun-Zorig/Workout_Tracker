import { Routes, Route } from 'react-router-dom'
// import './App.css'
import UserForm from './components/UserForm'
import UserProfile from './components/UserProfile'
import LoginForm from './components/LoginForm'
import ProtectedRoute from './components/ProtectedRoute'


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
        </Routes>
    </>
  )
}

export default App
