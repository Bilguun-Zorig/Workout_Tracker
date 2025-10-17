import {useState, useEffect} from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const UserSettings = () => {

    const navigate = useNavigate()
    const { getSingleUser, updateUser, deleteUser } = useAuth() //from useContext
    const {id} = useParams()
    console.log("USER ID FROM USER SETTINGS <>", id)
    const [userInfo, setUserInfo] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [errorMessages, setErrorMessages] = useState({})

    useEffect(() => {
        if(!id) return;

        (async () => {

            try{
                const oneUser = await getSingleUser(id);
                setUserInfo({
                    firstName: oneUser.firstName || "",
                    lastName: oneUser.lastName || "",
                    email: oneUser.email || "",
                    password: "",
                    confirmPassword: ""
                })
            } catch (err){
                console.log(err)
            }
        })();

    }, [id]);


    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setErrorMessages({}); //clear previous errors

        try {
            const updates = {
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                email: userInfo.email
            };

            if(userInfo.password || userInfo.confirmPassword){
                if(userInfo.password !== userInfo.confirmPassword) {
                    setErrorMessages((prev) => ({
                        ...prev, 
                        confirmPassword: 'Password must match'
                    }));
                    return;
                }
                updates.password = userInfo.password;
            }

            await updateUser(id, updates);
            navigate('/userProfile');
        } catch (err) {
            const errorsFromBackEnd = err.response?.data?.errors || {};
            const newErrors = {
                firstName: errorsFromBackEnd.firstName?.message || '',
                lastName: errorsFromBackEnd.lastName?.message || '',
                email: errorsFromBackEnd.email?.message || '',
                password: errorsFromBackEnd.password?.message || '',
                confirmPassword: errorsFromBackEnd.confirmPassword?.message || ''
            }
            setErrorMessages(newErrors);
            console.log('Error from SETTINGS', err)
        }
    };

    const changeHandler = e => {
        setUserInfo({
            ...userInfo,
            [e.target.name]: e.target.value
        })
    }

    const onDelete = async () => {
        try {
            await deleteUser(id);
            navigate('/')
        } catch (err) {
            console.log(err)
        }
    }


    return (
        <div>
            <form onSubmit={onSubmitHandler}>
                <div>
                    <label htmlFor="firstName">First Name:</label>
                    <input type="text" name='firstName' onChange={changeHandler} value={userInfo.firstName}/>
                    {errorMessages.firstName ? <p>{errorMessages.firstName}</p> : null}
                </div>
                <div>
                    <label htmlFor="lastName">Last Name:</label>
                    <input type="text" name='lastName' onChange={changeHandler} value={userInfo.lastName}/>
                    {errorMessages.lastName ? <p>{errorMessages.lastName}</p> : null}
                </div>
                {/* <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" name='email' onChange={changeHandler} value={userInfo.email}/>
                    {errorMessages.email ? <p>{errorMessages.email}</p> : null}
                </div> */}
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" name='password' onChange={changeHandler} value={userInfo.password}/>
                    {errorMessages.password ? <p>{errorMessages.password}</p> : null}
                </div>
                <div>
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input type="password" name='confirmPassword' onChange={changeHandler} value={userInfo.confirmPassword}/>
                    {errorMessages.confirmPassword ? <p>{errorMessages.confirmPassword}</p> : null}
                </div>
                <input type="submit" />
            </form>
            <button type='button' className='btn btn-danger' onClick={onDelete}>Delete</button>
        </div>
    )
}

export default UserSettings