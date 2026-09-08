import { useEffect, useState } from "react";
import {
    ArrowRight,
    MapPin,
    Plane,
    Search,
    X,
} from "lucide-react";

import AirportAutocomplete from "./AirportAutocomplete";
import type { Airport } from "../../types/Airport";

interface FlightSearchModalProps {
    open: boolean;
    onClose: () => void;
    onSearch: (
        origin: Airport,
        destination: Airport,
        departureDate: string
    ) => void;

    initialOrigin?: Airport | null;
    initialDestination?: Airport | null;
}

interface FlightSearchDialogProps {
    onClose: () => void;
    onSearch: (
        origin: Airport,
        destination: Airport,
        departureDate: string
    ) => void;
    initialOrigin: Airport | null;
    initialDestination: Airport | null;
}

const FlightSearchDialog = ({
                                onClose,
                                onSearch,
                                initialOrigin,
                                initialDestination,
                            }: FlightSearchDialogProps) => {
    const [origin, setOrigin] =
        useState<Airport | null>(initialOrigin);

    const [destination, setDestination] =
        useState<Airport | null>(initialDestination);

    const today = () => {
        const value = new Date();
        const offset = value.getTimezoneOffset();
        return new Date(value.getTime() - offset * 60_000)
            .toISOString()
            .slice(0, 10);
    };

    const [departureDate, setDepartureDate] = useState(today);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow = "hidden";
        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.body.style.overflow =
                previousOverflow;

            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [onClose]);

    const sameAirport =
        origin !== null &&
        destination !== null &&
        origin.id === destination.id;

    const canSearch =
        origin !== null &&
        destination !== null &&
        Boolean(departureDate) &&
        !sameAirport;

    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (
            !origin ||
            !destination ||
            sameAirport
        ) {
            return;
        }

        onSearch(origin, destination, departureDate);
    };

    const swapAirports = () => {
        setOrigin(destination);
        setDestination(origin);
    };

    return (
        <div
            role="presentation"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="flight-search-title"
                aria-describedby="flight-search-description"
                className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
            >
                <header className="relative overflow-hidden rounded-t-3xl bg-slate-950 px-6 py-6 text-white sm:px-8">
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.5),transparent_50%)]"
                    />

                    <div className="relative flex items-start justify-between gap-5">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                                <Plane size={23} />
                            </div>

                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                                    Plan your journey
                                </p>

                                <h2
                                    id="flight-search-title"
                                    className="mt-1 text-2xl font-bold"
                                >
                                    Where would you like to fly?
                                </h2>

                                <p
                                    id="flight-search-description"
                                    className="mt-2 text-sm text-slate-300"
                                >
                                    Search by airport, city, country or
                                    IATA code.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close flight search"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="p-6 sm:p-8"
                >
                    <div className="grid items-end gap-3 md:grid-cols-[1fr_auto_1fr]">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <MapPin
                                    size={17}
                                    className="text-blue-600"
                                />
                                Departure airport
                            </div>

                            <AirportAutocomplete
                                label="From"
                                placeholder="City, airport or code"
                                value={origin}
                                excludedAirportId={
                                    destination?.id
                                }
                                onChange={setOrigin}
                            />

                            {origin && (
                                <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                                    <p className="font-semibold text-slate-900">
                                        {origin.city} ({origin.code})
                                    </p>

                                    <p className="mt-0.5 truncate text-xs text-slate-500">
                                        {origin.name}, {origin.country}
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            aria-label="Swap departure and destination"
                            disabled={!origin && !destination}
                            onClick={swapAirports}
                            className="mb-1 flex h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-500 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-40 md:w-12"
                        >
                            <ArrowRight
                                className="rotate-90 md:rotate-0"
                                size={19}
                            />
                        </button>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <MapPin
                                    size={17}
                                    className="text-blue-600"
                                />
                                Destination airport
                            </div>

                            <AirportAutocomplete
                                label="To"
                                placeholder="City, airport or code"
                                value={destination}
                                excludedAirportId={origin?.id}
                                onChange={setDestination}
                            />

                            {destination && (
                                <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                                    <p className="font-semibold text-slate-900">
                                        {destination.city} (
                                        {destination.code})
                                    </p>

                                    <p className="mt-0.5 truncate text-xs text-slate-500">
                                        {destination.name},{" "}
                                        {destination.country}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <label className="mt-6 block text-sm font-semibold text-slate-700">
                        Departure date
                        <div className="relative mt-2">
                            <input
                                type="date"
                                required
                                min={today()}
                                value={departureDate}
                                onChange={(event) => setDepartureDate(event.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>
                    </label>

                    {sameAirport && (
                        <p
                            role="alert"
                            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                        >
                            Departure and destination airports must be
                            different.
                        </p>
                    )}

                    <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={!canSearch}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Search size={18} />
                            Find flights
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};

const FlightSearchModal = ({
                               open,
                               onClose,
                               onSearch,
                               initialOrigin = null,
                               initialDestination = null,
                           }: FlightSearchModalProps) => {
    if (!open) {
        return null;
    }

    /*
     * Because this dialog is unmounted whenever open is false,
     * its state is recreated from the current initial airports
     * each time it opens.
     */
    return (
        <FlightSearchDialog
            onClose={onClose}
            onSearch={onSearch}
            initialOrigin={initialOrigin}
            initialDestination={initialDestination}
        />
    );
};

export default FlightSearchModal;