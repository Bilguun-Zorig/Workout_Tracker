import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {api} from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider ({children}){

    const [user, setUser] = useState(null) // state variable and When app calls setUser(data.user) (inside fetchMe()), React updates that state.
    const [loading, setLoading] = useState(true)
    const isAuthenticated = !!user;
    const roles = user?.roles || []

    /**
     * fetchMe() gets the user data from your API.
        Calls setUser(data.user) → React updates the state.
        user changes → triggers re-render → useMemo() runs again and rebuilds the value object with the new user.
        Any component using useAuth() (like UserProfile) re-renders with the new user.
     */
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

    //? use it in LoginForm
    const login = async (credentials) => {
        await api.post('/user/login', credentials);
        await fetchMe();
    }

    //? use it in UserForm
    const register = async (payload) => {
        await api.post('/user', payload);
        await fetchMe();
    }
    
    //? logout
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