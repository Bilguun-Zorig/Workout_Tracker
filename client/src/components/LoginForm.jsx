import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
// import {api} from '../api/axios'
import { useAuth } from '../context/AuthContext';


const LoginForm = () => {

    const navigate = useNavigate();
    const {login} = useAuth();

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

    // const submitHandler = e => {
    //     e.preventDefault();
    //     api.post('/user/login', userInfo)
    //         .then(res => {
    //             console.log(res.data);
    //             // navigate('/userProfile');
    //             setTimeout(() => {
    //                 navigate('/userProfile');
    //             }, 200);
    //         })
    //         .catch(err => {
    //             console.log('LOGING ERROR<> ',err)
    //         });
    // }

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
        await login(userInfo);     // <-- posts + fetchMe() to set user in context
        navigate('/userProfile');
        } catch (err) {
        console.log('LOGIN ERROR', err);
        }
    };



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