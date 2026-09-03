import { useCallback, useEffect, useState } from "react";
import {
    Archive,
    CalendarCheck,
    Loader2,
    Plane,
    RefreshCw,
    Search,
    XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import BookingCard from "../components/bookings/BookingCard";
import PageTitle from "../components/common/PageTitle";
import PageContainer from "../components/layout/PageContainer";
import { getMyBookings } from "../services/bookingService";
import type { Booking } from "../types/Booking";

type BookingTab = "UPCOMING" | "CANCELLED" | "ARCHIVED";

interface BookingLoadResult {
    requestKey: string | null;
    bookings: Booking[];
    error: string | null;
}

const TABS: Array<{
    id: BookingTab;
    label: string;
    icon: typeof CalendarCheck;
}> = [
    { id: "UPCOMING", label: "Upcoming", icon: CalendarCheck },
    { id: "CANCELLED", label: "Cancelled", icon: XCircle },
    { id: "ARCHIVED", label: "Archived", icon: Archive },
];

const filterBookings = (bookings: Booking[], tab: BookingTab) => {
    if (tab === "UPCOMING") {
        return bookings.filter((booking) => booking.status !== "CANCELLED");
    }

    if (tab === "CANCELLED") {
        return bookings.filter((booking) => booking.status === "CANCELLED");
    }

    return bookings;
};

const BookingLookupPage = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState<BookingTab>("UPCOMING");
    const [reloadNumber, setReloadNumber] = useState(0);
    const [loadResult, setLoadResult] = useState<BookingLoadResult>({
        requestKey: null,
        bookings: [],
        error: null,
    });

    const requestKey = `${tab}:${reloadNumber}`;

    useEffect(() => {
        let active = true;
        const archived = tab === "ARCHIVED";

        void getMyBookings({ archived })
            .then((data) => {
                if (!active) return;

                setLoadResult({
                    requestKey,
                    bookings: filterBookings(data, tab),
                    error: null,
                });
            })
            .catch(() => {
                if (!active) return;

                setLoadResult({
                    requestKey,
                    bookings: [],
                    error: "We could not load your bookings. Please try again.",
                });
            });

        return () => {
            active = false;
        };
    }, [requestKey, tab]);

    const reloadBookings = useCallback(() => {
        setReloadNumber((current) => current + 1);
    }, []);

    const requestCompleted = loadResult.requestKey === requestKey;
    const loading = !requestCompleted;
    const error = requestCompleted ? loadResult.error : null;
    const bookings = requestCompleted ? loadResult.bookings : [];

    const emptyMessage =
        tab === "UPCOMING"
            ? "You have no upcoming bookings."
            : tab === "CANCELLED"
                ? "You have no cancelled bookings."
                : "Your archive is empty.";

    return (
        <PageContainer>
            <div className="space-y-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <PageTitle
                        title="My bookings"
                        subtitle="View upcoming trips and manage your booking history."
                    />

                    <button
                        type="button"
                        onClick={() => navigate("/available")}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Search size={19} />
                        Book a flight
                    </button>
                </div>

                <nav
                    aria-label="Booking categories"
                    className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
                >
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setTab(id)}
                            aria-current={tab === id ? "page" : undefined}
                            className={`inline-flex min-w-fit flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                tab === id
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            <Icon size={17} />
                            {label}
                        </button>
                    ))}
                </nav>

                {loading && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <Loader2
                            className="mx-auto animate-spin text-blue-600"
                            size={30}
                        />
                        <p className="mt-3 font-semibold text-slate-700">
                            Loading bookings...
                        </p>
                    </div>
                )}

                {!loading && error && (
                    <div
                        role="alert"
                        className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
                    >
                        <XCircle className="mx-auto text-red-500" size={32} />
                        <p className="mt-3 font-medium text-red-700">{error}</p>
                        <button
                            type="button"
                            onClick={reloadBookings}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
                        >
                            <RefreshCw size={16} />
                            Try again
                        </button>
                    </div>
                )}

                {!loading && !error && bookings.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                        <Plane className="mx-auto text-slate-300" size={36} />
                        <h2 className="mt-4 text-lg font-bold text-slate-800">
                            {emptyMessage}
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Your bookings will appear here.
                        </p>
                    </div>
                )}

                {!loading && !error && bookings.length > 0 && (
                    <div className="grid items-start gap-6 xl:grid-cols-2">
                        {bookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                onChanged={reloadBookings}
                            />
                        ))}
                    </div>
                )}
            </div>
        </PageContainer>
    );
};

export default BookingLookupPage;
