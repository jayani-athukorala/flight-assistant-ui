import { Check } from "lucide-react";
import type { TripType } from "../../types/Booking";

interface BookingProgressProps {
    currentStep: number;
    tripType?: TripType;
}

const BookingProgress = ({
    currentStep,
    tripType = "ROUND_TRIP",
}: BookingProgressProps) => {
    const steps = tripType === "ROUND_TRIP"
        ? ["Trip", "Return", "Passengers", "Seats", "Review"]
        : ["Trip", "Passengers", "Seats", "Review"];

    return (
        <nav aria-label="Booking progress" className="mb-8">
            <ol className="flex items-start">
                {steps.map((label, index) => {
                    const stepNumber = index + 1;
                    const completed = stepNumber < currentStep;
                    const current = stepNumber === currentStep;

                    return (
                        <li key={label} className="flex flex-1 items-start last:flex-none">
                            <div className="flex flex-col items-center">
                                <div
                                    aria-current={current ? "step" : undefined}
                                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                                        completed
                                            ? "border-blue-600 bg-blue-600 text-white"
                                            : current
                                                ? "border-blue-600 bg-white text-blue-700 ring-4 ring-blue-100"
                                                : "border-slate-200 bg-white text-slate-400"
                                    }`}
                                >
                                    {completed ? <Check size={18} /> : stepNumber}
                                </div>
                                <span className={`mt-2 hidden text-xs font-semibold sm:block ${
                                    current ? "text-blue-700" : "text-slate-500"
                                }`}>
                                    {label}
                                </span>
                            </div>

                            {index < steps.length - 1 && (
                                <div className={`mx-2 mt-5 h-0.5 flex-1 ${
                                    completed ? "bg-blue-600" : "bg-slate-200"
                                }`} />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default BookingProgress;