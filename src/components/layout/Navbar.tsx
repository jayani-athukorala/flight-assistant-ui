import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    BookOpen,
    Home,
    LogIn,
    LogOut,
    Menu,
    Plane,
    Search,
    X,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";

const publicItems = [
    { name: "Home", path: "/", icon: Home },
];

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isAdmin = user?.role === "ADMIN";
    const navItems = [
        ...publicItems,
        ...(isAdmin
            ? [
                { name: "Flight operations", path: "/flights", icon: Plane },
                { name: "Booking operations", path: "/admin/bookings", icon: BookOpen },
            ]
            : []),
        ...(isAuthenticated && !isAdmin
            ? [{ name: "My bookings", path: "/bookings", icon: BookOpen }]
            : []),
    ];

    const closeMenu = () => setMobileOpen(false);

    const handleLogout = () => {
        closeMenu();
        logout();
        navigate("/", { replace: true });
    };

    const findFlights = () => {
        navigate("/available");
    };

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <NavLink
                    to="/"
                    onClick={closeMenu}
                    className="flex items-center gap-3"
                >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
                        <Plane size={22} />
                    </span>
                    <span>
                        <span className="block text-lg font-bold leading-tight text-slate-950">
                            SkyRoute
                        </span>
                        <span className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 sm:block">
                            Airways
                        </span>
                    </span>
                </NavLink>

                <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
                    {navItems.map(({ name, path, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={path === "/"}
                            className={({ isActive }) =>
                                `flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                                    isActive
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                                }`
                            }
                        >
                            <Icon size={17} />
                            {name}
                        </NavLink>
                    ))}

                    <button
                        type="button"
                        onClick={findFlights}
                        className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                        <Search size={17} />
                        Find flights
                    </button>
                </nav>

                <div className="hidden items-center gap-3 lg:flex">
                    {!isAuthenticated ? (
                        <NavLink
                            to="/login"
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            <LogIn size={17} /> Sign in
                        </NavLink>
                    ) : (
                        <>
                            <div className="max-w-44 text-right">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                    {user?.email}
                                </p>
                                <p className="text-xs text-slate-400">Signed in</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleLogout}
                                aria-label="Sign out"
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                            >
                                <LogOut size={18} />
                            </button>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setMobileOpen((open) => !open)}
                    aria-expanded={mobileOpen}
                    aria-label="Toggle navigation"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 lg:hidden"
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {mobileOpen && (
                <div className="border-t border-slate-100 bg-white px-4 py-4 shadow-lg lg:hidden">
                    <nav className="mx-auto grid max-w-7xl gap-1" aria-label="Mobile navigation">
                        {navItems.map(({ name, path, icon: Icon }) => (
                            <NavLink
                                key={path}
                                to={path}
                                end={path === "/"}
                                onClick={closeMenu}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-xl px-4 py-3 font-semibold ${
                                        isActive
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-slate-700 hover:bg-slate-50"
                                    }`
                                }
                            >
                                <Icon size={18} /> {name}
                            </NavLink>
                        ))}

                        <button
                            type="button"
                            onClick={findFlights}
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <Search size={18} />
                            Find flights
                        </button>

                        <div className="mt-3 border-t border-slate-100 pt-3">
                            {!isAuthenticated ? (
                                <NavLink
                                    to="/login"
                                    onClick={closeMenu}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white"
                                >
                                    <LogIn size={18} /> Sign in
                                </NavLink>
                            ) : (
                                <div className="space-y-3">
                                    <p className="truncate px-2 text-sm text-slate-500">
                                        Signed in as <strong className="text-slate-800">{user?.email}</strong>
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 font-semibold text-red-700"
                                    >
                                        <LogOut size={18} /> Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Navbar;
