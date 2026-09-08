import { useCallback, useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, CircleAlert, Loader2, Plus, Search, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/layout/PageContainer";
import { getAdminBookings } from "../services/bookingService";
import type { Booking, BookingStatus } from "../types/Booking";

type StatusFilter = BookingStatus | "ALL";

const localDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const currency = new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" });
const dateTime = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

export default function AdminBookingsPage() {
    const navigate = useNavigate();
    const today = localDate(new Date());
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [date, setDate] = useState(today);
    const [status, setStatus] = useState<StatusFilter>("CONFIRMED");
    const [email, setEmail] = useState("");
    const [debouncedEmail, setDebouncedEmail] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setDebouncedEmail(email.trim());
            setPage(0);
        }, 300);
        return () => window.clearTimeout(timeout);
    }, [email]);

    const loadBookings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getAdminBookings({
                status: status === "ALL" ? undefined : status,
                email: debouncedEmail || undefined,
                from: date || undefined,
                to: date || undefined,
                page,
                size: 12,
            });
            setBookings(result.content);
            setTotalPages(result.totalPages);
            setTotalElements(result.totalElements);
        } catch {
            setBookings([]);
            setError("Bookings could not be loaded. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [date, debouncedEmail, page, status]);

    useEffect(() => void loadBookings(), [loadBookings]);

    const reset = () => {
        setDate(today);
        setStatus("CONFIRMED");
        setEmail("");
        setPage(0);
    };

    return (
        <PageContainer>
            <div className="space-y-6">
                <header className="flex flex-col gap-4 rounded-3xl bg-slate-950 p-7 text-white sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Admin workspace</p>
                        <h1 className="mt-2 text-3xl font-bold">Booking operations</h1>
                        <p className="mt-2 text-sm text-slate-300">Review bookings created by every customer account.</p>
                    </div>
                    <button type="button" onClick={() => navigate("/available")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500">
                        <Plus size={18} /> Create booking
                    </button>
                </header>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid gap-4 lg:grid-cols-[1fr_1fr_2fr_auto] lg:items-end">
                        <label className="text-sm font-semibold text-slate-700">Booking date
                            <input type="date" value={date} onChange={(event) => { setDate(event.target.value); setPage(0); }} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
                        </label>
                        <label className="text-sm font-semibold text-slate-700">Status
                            <select value={status} onChange={(event) => { setStatus(event.target.value as StatusFilter); setPage(0); }} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
                                <option value="ALL">All statuses</option>
                                <option value="CONFIRMED">Active</option>
                                <option value="PENDING">Pending</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </label>
                        <label className="text-sm font-semibold text-slate-700">Created by email
                            <span className="relative mt-2 block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="customer@example.com" className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4" /></span>
                        </label>
                        <button type="button" onClick={reset} className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">Reset</button>
                    </div>
                </section>

                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-600">{totalElements} {totalElements === 1 ? "booking" : "bookings"}</p>
                    <p className="flex items-center gap-2 text-xs text-slate-500"><CalendarDays size={14} /> Defaults to today’s active bookings</p>
                </div>

                {loading && <div className="rounded-2xl bg-white p-14 text-center"><Loader2 className="mx-auto animate-spin text-blue-600" size={30} /></div>}
                {!loading && error && <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700"><CircleAlert className="mx-auto" /><p className="mt-2">{error}</p></div>}
                {!loading && !error && bookings.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><Ticket className="mx-auto text-slate-300" size={36} /><h2 className="mt-3 font-bold">No matching bookings</h2></div>}

                {!loading && !error && bookings.length > 0 && (
                    <div className="grid gap-4 xl:grid-cols-2">
                        {bookings.map((booking) => <AdminBookingCard key={booking.id} booking={booking} />)}
                    </div>
                )}

                {totalPages > 1 && (
                    <nav className="flex items-center justify-center gap-3" aria-label="Booking pages">
                        <button disabled={page === 0} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-slate-300 p-2 disabled:opacity-40"><ChevronLeft /></button>
                        <span className="text-sm font-semibold">Page {page + 1} of {totalPages}</span>
                        <button disabled={page + 1 >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-slate-300 p-2 disabled:opacity-40"><ChevronRight /></button>
                    </nav>
                )}
            </div>
        </PageContainer>
    );
}

const AdminBookingCard = ({ booking }: { booking: Booking }) => (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <header className="flex items-start justify-between gap-3">
            <div><p className="text-xs font-bold uppercase text-blue-600">{booking.bookingReference}</p><h2 className="mt-1 font-bold text-slate-950">{booking.createdByEmail}</h2></div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{booking.status}</span>
        </header>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-slate-500">Route</p><p className="font-semibold">{booking.outboundFlight.origin.code} → {booking.outboundFlight.destination.code}</p></div>
            <div><p className="text-xs text-slate-500">Trip</p><p className="font-semibold">{booking.tripType === "ROUND_TRIP" ? "Round trip" : "One way"}</p></div>
            <div><p className="text-xs text-slate-500">Passengers</p><p className="font-semibold">{booking.passengers.length}</p></div>
            <div><p className="text-xs text-slate-500">Total</p><p className="font-semibold">{currency.format(booking.totalPrice)}</p></div>
        </div>
        <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">Created {dateTime.format(new Date(booking.bookingDate))}</p>
    </article>
);
