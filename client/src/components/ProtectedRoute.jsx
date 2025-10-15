import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({children, roles}){

    const {loading, isAuthenticated, roles: myRoles} = useAuth();
    console.log('ProtectedRoutes: <>', {loading, isAuthenticated, myRoles})

    if (loading) return <div>Loading...</div>
    //                                 try.   userlogin
    if(!isAuthenticated) {
        console.warn("🔒 Redirecting to /userlogin");
        return <Navigate to="/userlogin" replace/>
    }

    if(roles?.length && !roles.some(r => myRoles.includes(r))){
        return <Navigate to="/unauthorized" replace/>
    }

    return children;
}