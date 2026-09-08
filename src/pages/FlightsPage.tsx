import { useCallback, useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    CircleAlert,
    Clock3,
    Loader2,
    Plane,
    Plus,
    RefreshCw,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    X,
} from "lucide-react";
import { Navigate } from "react-router-dom";

import PageContainer from "../components/layout/PageContainer";
import FlightGrid from "../components/flights/FlightGrid";
import { getFlights } from "../services/flightService";
import { useAuth } from "../context/useAuth";
import type { Flight } from "../types/Flight";
import CreateFlightModal from "../components/flights/CreateFlightModal";

type StatusFilter =
    | "ALL"
    | "SCHEDULED"
    | "BOARDING"
    | "DEPARTED"
    | "COMPLETED"
    | "FULL"
    | "CANCELLED";

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
    { value: "ALL", label: "All statuses" },
    { value: "SCHEDULED", label: "Scheduled" },
    { value: "BOARDING", label: "Boarding" },
    { value: "DEPARTED", label: "Departed" },
    { value: "COMPLETED", label: "Completed" },
    { value: "FULL", label: "Full" },
    { value: "CANCELLED", label: "Cancelled" },
];

const localDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

// const airportText = (airport: Flight["origin"]) =>
//     typeof airport === "string"
//         ? airport
//         : `${airport.city} ${airport.code} ${airport.name}`;

const FlightsPage = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === "ADMIN";
    const [flights, setFlights] = useState<Flight[]>([]);
    const [date, setDate] = useState(localDate(new Date()));
    const [status, setStatus] = useState<StatusFilter>("SCHEDULED");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [createdByEmail, setCreatedByEmail] = useState("");
    const [debouncedCreatedByEmail, setDebouncedCreatedByEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [createOpen, setCreateOpen] = useState(false);

    useEffect(() => {
        const timeout = window.setTimeout(
            () => setDebouncedSearch(search.trim()),
            300
        );
        return () => window.clearTimeout(timeout);
    }, [search]);

    useEffect(() => {
        const timeout = window.setTimeout(
            () => setDebouncedCreatedByEmail(createdByEmail.trim()),
            300
        );
        return () => window.clearTimeout(timeout);
    }, [createdByEmail]);

    const loadFlights = useCallback(async () => {
        if (!isAdmin) return;

        setLoading(true);
        setError(null);

        try {
            const data = await getFlights({
                date: date || undefined,
                status: status === "ALL" ? undefined : status,
                query: debouncedSearch || undefined,
                createdByEmail: debouncedCreatedByEmail || undefined,
            });
            setFlights(data);
        } catch {
            setFlights([]);
            setError("Flight operations could not be loaded. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [date, debouncedCreatedByEmail, debouncedSearch, isAdmin, status]);

    useEffect(() => {
        void loadFlights();
    }, [loadFlights]);

    useEffect(() => {
        const interval = window.setInterval(() => void loadFlights(), 60_000);
        return () => window.clearInterval(interval);
    }, [loadFlights]);

    const filteredFlights = useMemo(() => flights.filter((flight) => {
        const matchesDate = !date || flight.departureTime.slice(0, 10) === date;
        const matchesStatus = status === "ALL" || flight.status === status;
        const terms = `${flight.flightNumber} ${flight.airline} ${flight.origin.code} ${flight.origin.city} ${flight.destination.code} ${flight.destination.city}`.toLowerCase();
        const matchesSearch = !debouncedSearch || terms.includes(debouncedSearch.toLowerCase());
        return matchesDate && matchesStatus && matchesSearch;
    }), [date, debouncedSearch, flights, status]);

    const statistics = useMemo(() => {
        const now = Date.now();
        return {
            total: filteredFlights.length,
            scheduled: filteredFlights.filter(
                (flight) => flight.status === "SCHEDULED"
            ).length,
            attention: filteredFlights.filter(
                (flight) =>
                    flight.status === "CANCELLED" || flight.status === "FULL"
            ).length,
            completed: filteredFlights.filter(
                (flight) => flight.status === "COMPLETED" ||
                    (flight.status === "DEPARTED" && new Date(flight.departureTime).getTime() <= now)
            ).length,
        };
    }, [filteredFlights]);

    const resetFilters = () => {
        setDate(localDate(new Date()));
        setStatus("SCHEDULED");
        setSearch("");
        setCreatedByEmail("");
    };

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return (
        <PageContainer>
            <div className="space-y-6">
                <header className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl">
                    <div className="bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.5),_transparent_48%)] px-6 py-8 sm:px-9">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                                    <ShieldCheck size={16} /> Admin workspace
                                </p>
                                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                    Flight operations
                                </h1>
                                <p className="mt-3 max-w-2xl text-slate-300">
                                    Monitor schedules, disruptions, and departures across the network.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={() => setCreateOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500">
                                    <Plus size={18} /> Create flight
                                </button>
                                <button type="button" onClick={() => void loadFlights()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-blue-50 disabled:opacity-60">
                                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <OperationStat icon={Plane} label="Flights found" value={statistics.total} tone="blue" />
                    <OperationStat icon={CalendarDays} label="Scheduled" value={statistics.scheduled} tone="emerald" />
                    <OperationStat icon={CircleAlert} label="Needs attention" value={statistics.attention} tone="red" />
                    <OperationStat icon={Clock3} label="Departed" value={statistics.completed} tone="slate" />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <SlidersHorizontal size={18} className="text-blue-600" />
                        <h2 className="font-bold text-slate-900">Filters</h2>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_2fr_2fr_auto] xl:items-end">
                        <div>
                            <label htmlFor="operation-date" className="mb-2 block text-sm font-semibold text-slate-700">
                                Flight date
                            </label>
                            <input
                                id="operation-date"
                                type="date"
                                value={date}
                                onChange={(event) => setDate(event.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label htmlFor="operation-created-by" className="mb-2 block text-sm font-semibold text-slate-700">
                                Created by email
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    id="operation-created-by"
                                    type="email"
                                    value={createdByEmail}
                                    onChange={(event) => setCreatedByEmail(event.target.value)}
                                    placeholder="admin@example.com"
                                    className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="operation-status" className="mb-2 block text-sm font-semibold text-slate-700">
                                Status
                            </label>
                            <select
                                id="operation-status"
                                value={status}
                                onChange={(event) => setStatus(event.target.value as StatusFilter)}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="operation-search" className="mb-2 block text-sm font-semibold text-slate-700">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    id="operation-search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Flight number, airline, airport, or city"
                                    className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={resetFilters}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            <X size={17} /> Reset
                        </button>
                    </div>
                </section>

                {loading && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center shadow-sm">
                        <Loader2 className="mx-auto animate-spin text-blue-600" size={32} />
                        <p className="mt-3 font-semibold text-slate-700">Loading flight operations...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
                        <CircleAlert className="mx-auto" size={28} />
                        <p className="mt-3 font-semibold">{error}</p>
                        <button type="button" onClick={() => void loadFlights()} className="mt-3 text-sm font-bold underline">
                            Try again
                        </button>
                    </div>
                )}

                {!loading && !error && filteredFlights.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                        <Plane className="mx-auto text-slate-300" size={38} />
                        <h2 className="mt-4 text-lg font-bold text-slate-900">No matching flights</h2>
                        <p className="mt-2 text-sm text-slate-500">Adjust the date, status, or search term.</p>
                    </div>
                )}

                {!loading && !error && filteredFlights.length > 0 && (
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-slate-900">Operational schedule</h2>
                                <p className="text-sm text-slate-500">
                                    {filteredFlights.length} {filteredFlights.length === 1 ? "result" : "results"}
                                </p>
                            </div>
                        </div>
                        <FlightGrid flights={filteredFlights} />
                    </section>
                )}
            </div>

            {createOpen && (
                <CreateFlightModal
                    onClose={() => setCreateOpen(false)}
                    onCreated={(flight) => {
                        setFlights((current) => [flight, ...current]);
                        setCreateOpen(false);
                    }}
                />
            )}
        </PageContainer>
    );
};

interface OperationStatProps {
    icon: typeof Plane;
    label: string;
    value: number;
    tone: "blue" | "emerald" | "red" | "slate";
}

const toneStyles = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-700",
};

const OperationStat = ({ icon: Icon, label, value, tone }: OperationStatProps) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneStyles[tone]}`}>
            <Icon size={19} />
        </div>
        <p className="mt-4 text-3xl font-bold text-slate-950">{value}</p>
        <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
    </div>
);

export default FlightsPage;
