import { ArrowRight, CalendarDays, Plane, RotateCcw } from "lucide-react";
import type { Flight } from "../../types/Flight";

interface ReturnFlightStepProps {
    outboundFlight: Flight;
    onContinue: () => void;
}

const dateTime = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

const ReturnFlightStep = ({ outboundFlight, onContinue }: ReturnFlightStepProps) => (
    <section className="space-y-5">
        <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Return journey
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Choose your flight home</h2>
            <p className="mt-2 text-sm text-slate-500">
                We will search for flights returning to {outboundFlight.origin.code}.
            </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
            <div className="border-b border-blue-100 bg-blue-50 px-6 py-4">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Selected outbound flight
                </p>
            </div>
            <div className="grid gap-5 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <Plane className="text-blue-600" size={20} />
                        <p className="text-xl font-bold text-slate-900">
                            {outboundFlight.origin.code} → {outboundFlight.destination.code}
                        </p>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                        {outboundFlight.airline} · {outboundFlight.flightNumber}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 sm:text-right">
                    <CalendarDays size={16} />
                    {dateTime.format(new Date(outboundFlight.departureTime))}
                </div>
            </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                    <RotateCcw size={22} />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Return route
                    </p>
                    <h3 className="mt-1 text-2xl font-bold text-slate-900">
                        {outboundFlight.destination.code} → {outboundFlight.origin.code}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Available return flights will be shown on the next screen.
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={onContinue}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
                Browse return flights
                <ArrowRight size={18} />
            </button>
        </div>
    </section>
);

export default ReturnFlightStep;