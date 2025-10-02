import React from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

const UserProfile = () => {
    
  const navigate = useNavigate()
  const handleLogoutClick = () => {
        axios.post('http://localhost:8000/api/user/logout', {}, { withCredentials: true })
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