import axios from 'axios';


// This Instance of Axios will allow you to have one place to control baseURL 
export const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true //send or receive the httpOnly cookie
})

const login_route = '/userlogin'

api.interceptors.response.use(
    (response) => response,

    // (error) => {
    //     if(error.response?.status === 401){
    //         localStorage.removeItem('user')
    //         window.location.href = '/userlogin'

    //     }
    //     return Promise.reject(error)
    // } 

    (error) => {
        const status = error.response?.status;
        const url = error.config?.url;
        const skip = error.config?.headers?.['X-Skip-Auth-Redirect'] === 'true';

        if (status === 401 && !skip && url !== '/auth/me') {
        localStorage.removeItem('user');
        if (window.location.pathname !== login_route) {
            window.location.assign(login_route);
        }
        }
        return Promise.reject(error)
    }


)