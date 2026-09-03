import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { AlertTriangle, Loader2, X } from "lucide-react";

import { cancelBooking } from "../../services/bookingService";

interface CancelBookingProps {
    bookingId: number;
    bookingReference?: string;
    onCancelled?: () => void | Promise<void>;
}

interface ApiErrorResponse {
    message?: string;
}

const CancelBooking = ({
                           bookingId,
                           bookingReference,
                           onCancelled,
                       }: CancelBookingProps) => {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !submitting) {
                setOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        cancelButtonRef.current?.focus();

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, submitting]);

    const openDialog = () => {
        setError(null);
        setOpen(true);
    };

    const closeDialog = () => {
        if (submitting) return;

        setError(null);
        setOpen(false);
    };

    const handleConfirm = async () => {
        setSubmitting(true);
        setError(null);

        try {
            await cancelBooking(bookingId);
            await onCancelled?.();
            setOpen(false);
        } catch (caughtError: unknown) {
            const message = axios.isAxiosError<ApiErrorResponse>(caughtError)
                ? caughtError.response?.data?.message
                : undefined;

            setError(
                message ??
                "Unable to cancel this booking. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={openDialog}
                className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
                Cancel booking
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeDialog();
                        }
                    }}
                >
                    <section
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="cancel-booking-title"
                        aria-describedby="cancel-booking-description"
                        className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                            <div className="flex items-start gap-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                                    <AlertTriangle size={22} />
                                </span>

                                <div>
                                    <h2
                                        id="cancel-booking-title"
                                        className="text-xl font-bold text-slate-950"
                                    >
                                        Cancel booking?
                                    </h2>
                                    <p
                                        id="cancel-booking-description"
                                        className="mt-2 text-sm leading-6 text-slate-600"
                                    >
                                        {bookingReference
                                            ? `Booking ${bookingReference} will be cancelled.`
                                            : "This booking will be cancelled."}{" "}
                                        This action may not be reversible.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeDialog}
                                disabled={submitting}
                                aria-label="Close cancellation dialog"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <div className="px-6 py-5">
                            {error && (
                                <p
                                    role="alert"
                                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                                >
                                    {error}
                                </p>
                            )}

                            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    ref={cancelButtonRef}
                                    type="button"
                                    onClick={closeDialog}
                                    disabled={submitting}
                                    className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Keep booking
                                </button>

                                <button
                                    type="button"
                                    onClick={() => void handleConfirm()}
                                    disabled={submitting}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting && (
                                        <Loader2
                                            className="animate-spin"
                                            size={17}
                                        />
                                    )}
                                    {submitting
                                        ? "Cancelling..."
                                        : "Yes, cancel booking"}
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
};

export default CancelBooking;
