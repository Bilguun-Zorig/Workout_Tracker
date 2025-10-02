import React, { useEffect, useState } from 'react'
import {useNavigate} from 'react-router-dom'
import axios from 'axios';

const UserForm = () => {

  const navigate = useNavigate()

  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errorMessages, setErrorMessages] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  })



  const onSubmitHandler = e => {
    e.preventDefault();
    axios.post("http://localhost:8000/api/user", userInfo, { withCredentials: true })
      .then(res => {
        console.log(res.data);
        navigate('/userProfile')
      })
      .catch(err => {
        console.log(err)
        let errorsFromBackEnd = err.response.data.errors;
        console.log(errorsFromBackEnd)
        let newErrorObj = { ...errorMessages }
        for (let fieldName in errorMessages) {
          if (errorsFromBackEnd.hasOwnProperty(fieldName)) {
            newErrorObj[fieldName] = errorsFromBackEnd[fieldName].message;
          } else {
            newErrorObj[fieldName] = ""; //clear the error
          }
        }
        setErrorMessages(newErrorObj)
        console.log("ERROR Object MSG: ", newErrorObj)
        console.log("ERROR MSG: ", errorMessages)
      })
  }

  const changeHandler = e => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div>
      <form onSubmit={onSubmitHandler}>
        <div>
          <label htmlFor="firstName">First Name:</label>
          <input type="text" name='firstName' onChange={changeHandler}  />
          {errorMessages.firstName ? <p>{errorMessages.firstName}</p> : null}
        </div>
        <div>
          <label htmlFor="lastName">Last Name:</label>
          <input type="text" name='lastName' onChange={changeHandler}  />
          {errorMessages.lastName ? <p>{errorMessages.lastName}</p> : null}
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" name='email' onChange={changeHandler}  />
          {errorMessages.email ? <p>{errorMessages.email}</p> : null}
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" name='password' onChange={changeHandler} />
          {errorMessages.password ? <p>{errorMessages.password}</p> : null}
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input type="password" name='confirmPassword' onChange={changeHandler}  />
          {errorMessages.confirmPassword ? <p>{errorMessages.confirmPassword}</p> : null}
        </div>

        <input type="submit" />
      </form>
    </div>
  )
}

export default UserForm