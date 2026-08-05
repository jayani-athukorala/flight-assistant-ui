import { NavLink } from "react-router-dom";
import {
    Plane,
    BookOpen,
    Home,
} from "lucide-react";

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
    return (
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto">

                <div className="flex justify-between items-center h-16 px-6">

                    {/* Logo */}

                    <div className="flex items-center gap-2">
                        <Plane className="text-blue-600" size={30}/>
                        <span className="font-bold text-xl">SkyRoute Airways</span>

                    </div>

                    {/* Navigation */}
                    <nav className="flex gap-2">

                        {navItems.map((item) => {

                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-4 py-2 rounded-lg transition

                    ${
                                            isActive
                                                ? "bg-blue-600 text-white"
                                                : "hover:bg-slate-100 text-slate-700"
                                        }`
                                    }
                                >
                                    <Icon size={18} />

                                    {item.name}
                                </NavLink>
                            );
                        })}
                    </nav>

                </div>

            </div>
        </header>
    );
};

export default Navbar;