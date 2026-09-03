import { useEffect, useId, useRef, useState } from "react";
import { Check, Loader2, MapPin, Search, X } from "lucide-react";
import { searchAirports } from "../../services/airportService";
import type { Airport } from "../../types/Airport";

interface AirportAutocompleteProps {
    label: string;
    placeholder: string;
    value: Airport | null;
    excludedAirportId?: number;
    onChange: (airport: Airport | null) => void;
}

const AirportAutocomplete = ({
                                 label,
                                 placeholder,
                                 value,
                                 excludedAirportId,
                                 onChange,
                             }: AirportAutocompleteProps) => {
    const id = useId();
    const containerRef = useRef<HTMLDivElement>(null);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Airport[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    useEffect(() => {
        if (value || query.trim().length < 2) {
            return;
        }

        const controller = new AbortController();
        const timeout = window.setTimeout(async () => {
            setLoading(true);
            try {
                const airports = await searchAirports(query, controller.signal);
                setResults(
                    airports.filter((airport) => airport.id !== excludedAirportId)
                );
                setOpen(true);
                setActiveIndex(-1);
            } catch {
                if (!controller.signal.aborted) setResults([]);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 300);

        return () => {
            window.clearTimeout(timeout);
            controller.abort();
        };
    }, [excludedAirportId, query, value]);

    useEffect(() => {
        const close = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const selectAirport = (airport: Airport) => {
        onChange(airport);
        setQuery("");
        setOpen(false);
        setLoading(false);
    };

    const displayedValue = value
        ? `${value.city} (${value.code})`
        : query;

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open || results.length === 0) return;

        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((current) => Math.min(current + 1, results.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((current) => Math.max(current - 1, 0));
        } else if (event.key === "Enter" && activeIndex >= 0) {
            event.preventDefault();
            selectAirport(results[activeIndex]);
        } else if (event.key === "Escape") {
            setOpen(false);
        }
    };

    return (
        <div ref={containerRef} className="relative">
            <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    id={id}
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={`${id}-options`}
                    aria-autocomplete="list"
                    autoComplete="off"
                    value={displayedValue}
                    placeholder={placeholder}
                    onFocus={(event) => {
                        if (value) event.currentTarget.select();
                        if (results.length > 0) setOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onChange={(event) => {
                        const nextQuery = event.target.value;
                        if (value) onChange(null);
                        setQuery(nextQuery);
                        setOpen(false);

                        if (nextQuery.trim().length < 2) {
                            setResults([]);
                            setLoading(false);
                        }
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-10 text-slate-900 outline-none transition focus:ring-4 focus:ring-blue-100"
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-600" size={18} />
                )}
                {!loading && displayedValue && (
                    <button
                        type="button"
                        aria-label={`Clear ${label}`}
                        onClick={() => {
                            setQuery("");
                            onChange(null);
                            setResults([]);
                            setOpen(false);
                            setLoading(false);
                            setActiveIndex(-1);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {open && !loading && (
                <ul id={`${id}-options`} role="listbox" className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                    {results.length === 0 ? (
                        <li className="px-4 py-5 text-center text-sm text-slate-500">
                            No matching airports found.
                        </li>
                    ) : results.map((airport, index) => (
                        <li key={airport.id} role="option" aria-selected={activeIndex === index}>
                            <button
                                type="button"
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => selectAirport(airport)}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left ${
                                    activeIndex === index ? "bg-blue-50" : "hover:bg-slate-50"
                                }`}
                            >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 font-bold text-blue-700">
                                    {airport.code}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate font-semibold text-slate-900">
                                        {airport.city} · {airport.name}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                        <MapPin size={12} /> {airport.country}
                                    </span>
                                </span>
                                {value?.id === airport.id && <Check size={17} className="text-blue-600" />}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AirportAutocomplete;