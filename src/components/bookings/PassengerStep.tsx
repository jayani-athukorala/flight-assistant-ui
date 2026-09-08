import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Minus, Plus, UserRound } from "lucide-react";
import Input from "../common/Input";
import type { PassengerRequest } from "../../types/Booking";

type PassengerField = "firstName" | "lastName" | "passportNumber" | "email";
type PassengerStepMode = "FULL" | "COUNT_ONLY" | "DETAILS_ONLY";

interface PassengerStepProps {
    passengers: PassengerRequest[];
    adultCount: number;
    onAdultCountChange: (count: number) => void;
    onPassengerChange: (
        index: number,
        field: PassengerField,
        value: string
    ) => void;
    mode?: PassengerStepMode;
    onContinue?: () => void;
    continueLabel?: string;
}

const PassengerStep = ({
    passengers,
    adultCount,
    onAdultCountChange,
    onPassengerChange,
    mode = "FULL",
    onContinue,
    continueLabel = "Continue",
}: PassengerStepProps) => {
    const [activePassenger, setActivePassenger] = useState(0);
    const index = Math.min(activePassenger, Math.max(0, passengers.length - 1));
    const passenger = passengers[index];

    const changeCount = (count: number) => {
        const nextCount = Math.max(1, Math.min(6, count));
        onAdultCountChange(nextCount);
        setActivePassenger((current) => Math.min(current, nextCount - 1));
    };

    const isComplete = (item: PassengerRequest) =>
        Boolean(
            item.firstName.trim() &&
            item.lastName.trim() &&
            item.passportNumber.trim() &&
            item.email.trim()
        );

    const allComplete = passengers.length > 0 && passengers.every(isComplete);

    if (!passenger) return null;

    const countPanel = (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Travellers</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-950">How many passengers?</h2>
                    <p className="mt-2 text-sm text-slate-500">Add between one and six adult passengers.</p>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-2">
                    <button type="button" aria-label="Remove one passenger" onClick={() => changeCount(adultCount - 1)} disabled={adultCount <= 1} className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm transition hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
                        <Minus size={18} />
                    </button>
                    <div className="min-w-16 text-center">
                        <p className="text-lg font-bold text-slate-900">{adultCount}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Adults</p>
                    </div>
                    <button type="button" aria-label="Add one passenger" onClick={() => changeCount(adultCount + 1)} disabled={adultCount >= 6} className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
                        <Plus size={18} />
                    </button>
                </div>
            </div>
            {mode === "COUNT_ONLY" && onContinue && (
                <button type="button" onClick={onContinue} className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
                    {continueLabel}
                </button>
            )}
        </div>
    );

    const detailsPanel = (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
                {passengers.map((item, passengerIndex) => {
                    const selected = passengerIndex === index;
                    const complete = isComplete(item);
                    return (
                        <button key={`${item.passportNumber || "passenger"}-${passengerIndex}`} type="button" onClick={() => setActivePassenger(passengerIndex)} className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"}`}>
                            <UserRound size={16} />
                            {item.firstName.trim() || `Passenger ${passengerIndex + 1}`}
                            {complete && <Check size={15} />}
                        </button>
                    );
                })}
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Passenger {index + 1} details</h3>
                <p className="mt-1 text-sm text-slate-500">Enter the name exactly as it appears on the passport.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                <Input label="First name" value={passenger.firstName} onChange={(event) => onPassengerChange(index, "firstName", event.target.value)} placeholder="First name" />
                <Input label="Last name" value={passenger.lastName} onChange={(event) => onPassengerChange(index, "lastName", event.target.value)} placeholder="Last name" />
                <Input label="Passport number" value={passenger.passportNumber} onChange={(event) => onPassengerChange(index, "passportNumber", event.target.value.toUpperCase())} placeholder="Passport number" />
                <Input label="Email address" type="email" value={passenger.email} onChange={(event) => onPassengerChange(index, "email", event.target.value)} placeholder="name@example.com" />
            </div>

            <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
                <button type="button" disabled={index === 0} onClick={() => setActivePassenger((current) => current - 1)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">
                    <ChevronLeft size={17} /> Previous
                </button>

                {index < passengers.length - 1 ? (
                    <button type="button" disabled={!isComplete(passenger)} onClick={() => setActivePassenger((current) => current + 1)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
                        Next passenger <ChevronRight size={17} />
                    </button>
                ) : onContinue ? (
                    <button type="button" disabled={!allComplete} onClick={onContinue} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
                        {continueLabel} <ChevronRight size={17} />
                    </button>
                ) : (
                    <button type="button" disabled className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white opacity-40">
                        Next passenger <ChevronRight size={17} />
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <section className="space-y-5">
            {mode !== "DETAILS_ONLY" && countPanel}
            {mode !== "COUNT_ONLY" && detailsPanel}
        </section>
    );
};

export default PassengerStep;
