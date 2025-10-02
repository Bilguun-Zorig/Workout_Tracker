import React, {useState} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import axios from 'axios'


const LoginForm = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const [userInfo, setUserInfo] = useState({
        email: "",
        password: ""
    })

    const handleChange = (e) => {
        setUserInfo({
            ...userInfo,
            [e.target.name]: e.target.value
        })
    };

    const submitHandler = e => {
        e.preventDefault();
        axios.post('http://localhost:8000/api/user/login', userInfo, { withCredentials: true })
            .then(res => {
                console.log(res.data);
                navigate('/userProfile');
            })
            .catch(err => {
                console.log(err)
            });
    }




  return (
    <div>
        < h1 > Login</h1 >
                <form onSubmit={submitHandler}>
                    <div>
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" className="form-control" onChange={handleChange} value={userInfo.email} />
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input type="password" name="password" className="form-control" onChange={handleChange} value={userInfo.password} />
                    </div>
                    <div>
                        <button className="btn btn-primary">Login</button>
                    </div>
                    
                </form>
    </div>
  )
}

export default LoginForm