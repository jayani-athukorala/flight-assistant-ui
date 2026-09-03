import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/useAuth";

interface AdminRouteProps {
    children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
    const { isAuthenticated, isInitializing, user } = useAuth();
    const location = useLocation();

    if (isInitializing) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={30} />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user?.role !== "ADMIN") {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
