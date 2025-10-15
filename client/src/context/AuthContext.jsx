import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {api} from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider ({children}){

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const isAuthenticated = !!user;
    const roles = user?.roles || []

    // const fetchMe = async () => {
    //     try{
    //         const {data} = await api.get('/auth/me');
    //         setUser(data.user);
    //     } catch {
    //         setUser(null)
    //     }
    // }

    const fetchMe = async () => {
        try {
            const { data } = await api.get('/auth/me', {
            headers: { 'X-Skip-Auth-Redirect': 'true' } // <- don't redirect on this probe
            });
            setUser(data.user);
        } catch {
            setUser(null);
        }
        };





    useEffect(() => {
        (async ()=>{
            setLoading(true)
            await fetchMe()
            setLoading(false)
        })();
    }, [])

    // useEffect(() => {
    //     const PUBLIC = ['/', '/userlogin', '/register'];
    //     if (PUBLIC.includes(window.location.pathname)) {
    //         setLoading(false);
    //         return;
    //     }
    //     (async () => {
    //         setLoading(true);
    //         await fetchMe();
    //         setLoading(false);
    //     })();
    //     }, []);




    const login = async (credentials) => {
        await api.post('/user/login', credentials);
        await fetchMe();
    }

    const register = async (payload) => {
        await api.post('/user', payload);
        await fetchMe();
    }

    const logout = async () => {
        await api.post('/user/logout', {});
        setUser(null);
    }
/**?
 * performance optimization — to avoid recalculating or recreating objects/functions unnecessarily on every render
 */
    const value = useMemo(() => ({
        user, roles, loading, isAuthenticated, login, register, logout, fetchMe
    }), [user, roles, loading, isAuthenticated])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if(!ctx) throw new Error('useAuth must be used within AuthProvider')
    
    return ctx
}