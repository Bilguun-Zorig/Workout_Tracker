import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
// import axios from 'axios';
// import {api} from '../api/axios'
import { useAuth } from '../context/AuthContext'

const UserForm = () => {

  const navigate = useNavigate()
  const { register } = useAuth() //from useContext

  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "prefer_not_to_say",
    age: "",
    height: "",
    weight: ""
  });

  const [errorMessages, setErrorMessages] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    age: "",
    height: "",
    weight: ""
  })

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      await register(userInfo);  // <-- posts + fetchMe() sets user
      navigate('/userProfile');
    } catch (err) {
      // const errors = err?.response?.data?.errors || {};
      // setErrorMessages(errors);
      console.log(err)
      // optional chaining (?.) — a safe way to access nested properties without crashing if something is undefined or null.
      let errorsFromBackEnd = err.response?.data?.errors || {};
      console.log(errorsFromBackEnd)

      let newErrorObj = { ...errorMessages }

      for (let fieldName in newErrorObj) {
        if (errorsFromBackEnd.hasOwnProperty(fieldName)) {
          newErrorObj[fieldName] = errorsFromBackEnd[fieldName]?.message || '';
        }
      }
      setErrorMessages(newErrorObj)
      console.log("ERROR Object MSG: ", newErrorObj)
      console.log("ERROR MSG: ", errorMessages)
    }
  };


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
          <input type="text" name='firstName' onChange={changeHandler} />
          {errorMessages.firstName ? <p>{errorMessages.firstName}</p> : null}
        </div>
        <div>
          <label htmlFor="lastName">Last Name:</label>
          <input type="text" name='lastName' onChange={changeHandler} />
          {errorMessages.lastName ? <p>{errorMessages.lastName}</p> : null}
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" name='email' onChange={changeHandler} />
          {errorMessages.email ? <p>{errorMessages.email}</p> : null}
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" name='password' onChange={changeHandler} />
          {errorMessages.password ? <p>{errorMessages.password}</p> : null}
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input type="password" name='confirmPassword' onChange={changeHandler} />
          {errorMessages.confirmPassword ? <p>{errorMessages.confirmPassword}</p> : null}
        </div>
        <select name="gender" value={userInfo.gender} onChange={changeHandler}>
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>

        <div>
          <label htmlFor="age">Age:</label>
          <input type="number" name='age' onChange={changeHandler} />
          {errorMessages.age ? <p>{errorMessages.age}</p> : null}
        </div>
        <div>
          <label htmlFor="height">Height:</label>
          <input type="number" name='height' onChange={changeHandler} />
          {errorMessages.height ? <p>{errorMessages.height}</p> : null}
        </div>

        <div>
          <label htmlFor="weight">Weight:</label>
          <input type="number" name='weight' onChange={changeHandler} />
          {errorMessages.weight ? <p>{errorMessages.weight}</p> : null}
        </div>
        <input type="submit" />
      </form>
    </div>
  )
}

export default UserForm