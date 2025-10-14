import React from 'react'
import {api} from '../api/axios'
import { Link, useNavigate } from 'react-router-dom'

const UserProfile = () => {
    
  const navigate = useNavigate()
  const handleLogoutClick = () => {
        api.post('/user/logout', {})
            .then(res => {
                console.log(res);
                navigate('/')
            })
            .catch(err => console.log(err))
    }
  return (
    <div>UserProfile

      <button onClick={handleLogoutClick} className="dropdown-item">Logout</button>
    </div>
  )
}

export default UserProfile