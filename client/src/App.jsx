import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import UserForm from './components/UserForm'
import UserProfile from './components/UserProfile'
import LoginForm from './components/LoginForm'


function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<UserForm/>}/>
          <Route path='/userlogin' element={<LoginForm/>}/>
          <Route path='/userProfile' element={<UserProfile/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
