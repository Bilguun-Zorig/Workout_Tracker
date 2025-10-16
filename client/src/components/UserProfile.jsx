import React from 'react'
import {api} from '../api/axios'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const UserProfile = () => {
    
  const navigate = useNavigate();
  const {user, logout} = useAuth();

    console.log(user)
    const handleLogoutClick = async () => {
      try{
        await logout();
        navigate('/')
      } catch (err) {
        console.log(err)
      }
    }

  return (
    <div>
      <h1>Hello, {user?.firstName}</h1>
      <button onClick={handleLogoutClick} className="dropdown-item">Logout</button>
    </div>
  )
}

export default UserProfile