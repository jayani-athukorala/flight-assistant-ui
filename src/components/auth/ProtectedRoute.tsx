import { Navigate, useLocation, } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/useAuth";

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({
                            children,
                        }: ProtectedRouteProps) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                state={{
                    from:
                        location.pathname +
                        location.search,
                }}
                replace
            />
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;