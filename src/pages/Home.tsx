import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    BookOpen,
    CalendarCheck,
    CheckCircle2,
    MapPin,
    Plane,
    Search,
    ShieldCheck,
} from "lucide-react";

import PageContainer from "../components/layout/PageContainer";
import { useAuth } from "../context/useAuth";

const benefits = [
    {
        icon: Search,
        title: "Search destinations",
        description:
            "Find available flights by departure airport and destination.",
    },
    {
        icon: CalendarCheck,
        title: "Book with confidence",
        description:
            "Choose your flight, seat class and preferred seat in a few steps.",
    },
    {
        icon: BookOpen,
        title: "Manage bookings",
        description:
            "Review your trips and cancel eligible bookings from one place.",
    },
];

const Home = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const isAdmin = user?.role === "ADMIN";

    const findFlights = () => {
        navigate("/available");
    };

    return (
        <main className="overflow-hidden bg-slate-50">
            <section className="relative border-b border-slate-200 bg-white">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                >
                    <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
                    <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-sky-100/70 blur-3xl" />
                </div>

                <PageContainer>
                    <div className="relative grid min-h-[620px] items-center gap-12 py-20 lg:grid-cols-[1.15fr_0.85fr]">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                                <Plane size={16} />
                                Simple and reliable flight booking
                            </div>

                            <h1 className="mt-7 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                                Your next journey starts with{" "}
                                <span className="text-blue-600">
                                    SkyRoute Airways
                                </span>
                            </h1>

                            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                                Search routes, compare available flights, select
                                your seats and manage your booking in one secure
                                place.
                            </p>

                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={findFlights}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    <Search size={19} />
                                    Search flights
                                </button>

                                {isAuthenticated ? (
                                    <Link
                                        to={isAdmin ? "/flights" : "/bookings"}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                                    >
                                        {isAdmin
                                            ? "Flight operations"
                                            : "My bookings"}
                                        <ArrowRight size={18} />
                                    </Link>
                                ) : (
                                    <Link
                                        to="/register"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                                    >
                                        Create an account
                                        <ArrowRight size={18} />
                                    </Link>
                                )}
                            </div>

                            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
                                {["Real-time availability", "Secure booking", "Easy seat selection"].map(
                                    (item) => (
                                        <span
                                            key={item}
                                            className="flex items-center gap-2"
                                        >
                                            <CheckCircle2
                                                size={17}
                                                className="text-emerald-600"
                                            />
                                            {item}
                                        </span>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="relative mx-auto w-full max-w-lg">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-blue-200/60 to-sky-100/20 blur-2xl"
                            />

                            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl shadow-slate-900/10">
                                <div className="flex items-center justify-between gap-5">
                                    <div>
                                        <p className="text-sm font-semibold text-blue-600">
                                            Plan your journey
                                        </p>
                                        <h2 className="mt-1 text-2xl font-bold text-slate-950">
                                            Where would you like to go?
                                        </h2>
                                    </div>
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
                                        <Plane size={23} />
                                    </span>
                                </div>

                                <div className="mt-7 space-y-3">
                                    {[
                                        ["Departure", "Choose an origin airport"],
                                        ["Destination", "Choose a destination airport"],
                                    ].map(([label, value]) => (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={findFlights}
                                            className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                                        >
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                                                <MapPin size={19} />
                                            </span>
                                            <span>
                                                <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    {label}
                                                </span>
                                                <span className="mt-0.5 block font-semibold text-slate-700">
                                                    {value}
                                                </span>
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={findFlights}
                                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    <Search size={18} />
                                    Find flights
                                </button>

                                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
                                    <ShieldCheck
                                        size={15}
                                        className="text-emerald-600"
                                    />
                                    Your booking information is protected
                                </div>
                            </div>
                        </div>
                    </div>
                </PageContainer>
            </section>

            <PageContainer>
                <section className="py-20">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
                            Everything you need
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            A smoother way to book your flight
                        </h2>
                        <p className="mt-4 leading-7 text-slate-600">
                            SkyRoute keeps every part of your journey simple,
                            from searching for a route to managing a confirmed
                            booking.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {benefits.map(({ icon: Icon, title, description }) => (
                            <article
                                key={title}
                                className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                            >
                                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                                    <Icon size={22} />
                                </span>
                                <h3 className="mt-6 text-xl font-bold text-slate-900">
                                    {title}
                                </h3>
                                <p className="mt-3 leading-7 text-slate-600">
                                    {description}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>
            </PageContainer>
        </main>
    );
};

export default Home;
