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
      <div className="btn-group">
        <button className="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">{user?.firstName}</button>
        <ul className="dropdown-menu">
          {/* <li><a className="dropdown-item" href="/userSettings">Settings</a></li> */}
          <li><Link to={`/userSettings/${user._id}`} className="dropdown-item">Settings</Link></li>
          <li><a className="dropdown-item" href="#">Another action</a></li>
          <li><a className="dropdown-item" href="#">Something else here</a></li>
          <li><hr className="dropdown-divider"></hr></li>
          <li><button  onClick={handleLogoutClick} className="dropdown-item">Logout</button></li>
        </ul>
      </div>
    </div>
  )
}

export default UserProfile