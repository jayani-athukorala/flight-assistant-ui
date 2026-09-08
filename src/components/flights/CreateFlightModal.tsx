import { useMemo, useState, type FormEvent } from "react";
import { CircleAlert, Loader2, PlaneTakeoff, X } from "lucide-react";
import AirportAutocomplete from "./AirportAutocomplete";
import { createFlight } from "../../services/flightService";
import type { Airport } from "../../types/Airport";
import type { Flight } from "../../types/Flight";

interface Props {
    onClose: () => void;
    onCreated: (flight: Flight) => void;
}

const toLocalInputValue = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export default function CreateFlightModal({ onClose, onCreated }: Props) {
    const minimumTime = useMemo(() => toLocalInputValue(new Date()), []);
    const [origin, setOrigin] = useState<Airport | null>(null);
    const [destination, setDestination] = useState<Airport | null>(null);
    const [flightNumber, setFlightNumber] = useState("");
    const [airline, setAirline] = useState("");
    const [departureTime, setDepartureTime] = useState("");
    const [arrivalTime, setArrivalTime] = useState("");
    const [economyBasePrice, setEconomyBasePrice] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (event: FormEvent) => {
        event.preventDefault();

        if (!origin || !destination) {
            setError("Select both the departure and arrival airports.");
            return;
        }

        if (new Date(arrivalTime) <= new Date(departureTime)) {
            setError("Arrival must be later than departure.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const flight = await createFlight({
                flightNumber: flightNumber.trim().toUpperCase(),
                airline: airline.trim(),
                originAirportId: origin.id,
                destinationAirportId: destination.id,
                departureTime,
                arrivalTime,
                economyBasePrice: Number(economyBasePrice),
            });
            onCreated(flight);
        } catch (requestError: unknown) {
            const responseMessage = (
                requestError as { response?: { data?: { message?: string; error?: string } } }
            ).response?.data;
            setError(responseMessage?.message ?? responseMessage?.error ?? "Flight could not be created.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={onClose}>
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-flight-title"
                onMouseDown={(event) => event.stopPropagation()}
                className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            >
                <header className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <div>
                        <h2 id="create-flight-title" className="text-xl font-bold text-slate-950">Create flight</h2>
                        <p className="mt-1 text-sm text-slate-500">Add the schedule and one Economy base fare.</p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                        <X size={20} />
                    </button>
                </header>

                <form onSubmit={(event) => void submit(event)} className="space-y-5 p-6">
                    {error && (
                        <div role="alert" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            <CircleAlert className="shrink-0" size={18} /> {error}
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField label="Flight number" value={flightNumber} onChange={setFlightNumber} placeholder="SK201" />
                        <TextField label="Airline" value={airline} onChange={setAirline} placeholder="SAS" />
                        <AirportAutocomplete label="Departure airport" placeholder="Search city, code, or airport" value={origin} excludedAirportId={destination?.id} onChange={setOrigin} />
                        <AirportAutocomplete label="Arrival airport" placeholder="Search city, code, or airport" value={destination} excludedAirportId={origin?.id} onChange={setDestination} />
                        <DateTimeField label="Departure date and time" value={departureTime} min={minimumTime} onChange={setDepartureTime} />
                        <DateTimeField label="Arrival date and time" value={arrivalTime} min={departureTime || minimumTime} onChange={setArrivalTime} />
                    </div>

                    <label className="block text-sm font-semibold text-slate-700">
                        Economy base fare (SEK)
                        <input required min="1" step="0.01" type="number" value={economyBasePrice} onChange={(event) => setEconomyBasePrice(event.target.value)} placeholder="849.00" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                        <span className="mt-2 block text-xs font-normal text-slate-500">
                            The system automatically creates 12 seats and calculates Premium Economy, Business, and First Class prices.
                        </span>
                    </label>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                        <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                        <button disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                            {submitting ? <Loader2 className="animate-spin" size={18} /> : <PlaneTakeoff size={18} />}
                            {submitting ? "Creating…" : "Create flight"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

interface TextFieldProps {
    label: string;
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
}

const TextField = ({ label, value, placeholder, onChange }: TextFieldProps) => (
    <label className="text-sm font-semibold text-slate-700">
        {label}
        <input required value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
    </label>
);

interface DateTimeFieldProps {
    label: string;
    value: string;
    min: string;
    onChange: (value: string) => void;
}

const DateTimeField = ({ label, value, min, onChange }: DateTimeFieldProps) => (
    <label className="text-sm font-semibold text-slate-700">
        {label}
        <input required type="datetime-local" min={min} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
    </label>
);
