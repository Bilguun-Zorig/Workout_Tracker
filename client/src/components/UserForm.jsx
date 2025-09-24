import React, {useEffect, useState} from 'react'
import axios from 'axios';

const UserForm = () => {

  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });



  const onSubmitHandler = e => {
    e.preventDefault();
    axios.post("http://localhost:8000/api/user", userInfo)
      .then(res => {
        console.log(res);
        setUserInfo({
          firstName: "",
          lastName: "",
          email: "",
          password: ""
        })
      })
      .catch(err => console.log(err))
  }

  const changeHandler = e => {
    setUserInfo({
      ...userInfo, 
      [e.target.name]: e.target.value
    })
  }

  return (
    <div>
      <form action="#" onSubmit={onSubmitHandler}>
        <div>
          <label htmlFor="firstName">First Name:</label>
          <input type="text" name='firstName' onChange={changeHandler} value={userInfo.firstName}/>
        </div>
        <div>
          <label htmlFor="lastName">Last Name:</label>
          <input type="text" name='lastName' onChange={changeHandler} value={userInfo.lastName}/>
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" name='email' onChange={changeHandler} value={userInfo.email}/>
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" name='password' onChange={changeHandler} value={userInfo.password}/>
        </div>
        
        <input type="submit" />
      </form>
    </div>
  )
}

export default UserForm