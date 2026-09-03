import { ArrowRight, Check, RefreshCw } from "lucide-react";
import type { TripType } from "../../types/Booking";

interface TripTypeStepProps {
    tripType: TripType;
    onTripTypeChange: (tripType: TripType) => void;
}

const OPTIONS: Array<{
    value: TripType;
    title: string;
    description: string;
    icon: typeof ArrowRight;
}> = [
    {
        value: "ONE_WAY",
        title: "One way",
        description: "Travel to your destination without selecting a return flight.",
        icon: ArrowRight,
    },
    {
        value: "ROUND_TRIP",
        title: "Round trip",
        description: "Book your outbound and return journeys together.",
        icon: RefreshCw,
    },
];

const TripTypeStep = ({ tripType, onTripTypeChange }: TripTypeStepProps) => (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Step 1
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">How are you travelling?</h2>
        <p className="mt-2 text-sm text-slate-500">
            You can change this before selecting your seats.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
            {OPTIONS.map(({ value, title, description, icon: Icon }) => {
                const selected = tripType === value;

                return (
                    <button
                        key={value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onTripTypeChange(value)}
                        className={`relative rounded-2xl border-2 p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            selected
                                ? "border-blue-600 bg-blue-50 shadow-sm"
                                : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                        }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className={`rounded-xl p-3 ${
                                selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                            }`}>
                                <Icon size={22} />
                            </div>
                            <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                                selected
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : "border-slate-300 text-transparent"
                            }`}>
                                <Check size={14} />
                            </span>
                        </div>
                        <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
                    </button>
                );
            })}
        </div>
    </section>
);

export default TripTypeStep;