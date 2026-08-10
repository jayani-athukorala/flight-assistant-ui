import { NavLink, useNavigate } from "react-router-dom";
import {
    Plane,
    BookOpen,
    Home,
    LogIn,
    LogOut,
} from "lucide-react";

import { useAuth } from "../context/useAuth";

const navItems = [
    {
        name: "Home",
        path: "/",
        icon: Home,
    },
    {
        name: "Flights",
        path: "/flights",
        icon: Plane,
    },
    {
        name: "Available",
        path: "/available",
        icon: Plane,
    },
    {
        name: "Bookings",
        path: "/bookings",
        icon: BookOpen,
    },
];

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header className="border-b bg-white">
            <div className="flex justify-between items-center h-16 px-6">

                {/* Logo */}
                <NavLink to="/" className="flex items-center gap-2" >
                    <Plane className="text-blue-600" size={30}/>

                    <span className="font-bold text-xl">
                        SkyRoute Airways
                    </span>
                </NavLink>

                {/* Navigation */}
                <nav className="flex items-center gap-2">

                    {navItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    [
                                        "flex items-center gap-2 px-4 py-2 rounded-lg transition",
                                        isActive
                                            ? "bg-blue-600 text-white"
                                            : "hover:bg-slate-100 text-slate-700",
                                    ].join(" ")
                                }
                            >
                                <Icon size={18} />
                                {item.name}
                            </NavLink>
                        );
                    })}

                    {/* Login / Logout */}
                    {!isAuthenticated ? (
                        <NavLink to="/login" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 ml-2" >
                            <LogIn size={18} />
                            Login
                        </NavLink>
                    ) : (
                        <div className="flex items-center gap-3 ml-2">

                            <span className="text-sm text-slate-600">
                                {user?.email}
                            </span>

                            <button type="button" onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900">
                                <LogOut size={18} />
                                Logout
                            </button>

                        </div>
                    )}

                </nav>
            </div>
        </header>
    );
};

export default Navbar;