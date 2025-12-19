import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const PlaneDetail = ({ flight }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        // Store selected flight in localStorage
        const stored = JSON.parse(localStorage.getItem("planeListDetails")) || { flightList: [] };
        const newData = {
            ...stored,
            selectedFlight: flight,
        };
        localStorage.setItem("planeListDetails", JSON.stringify(newData));
        navigate("/plane-seats");
    };

    const departure = flight?.departureDateTime ? new Date(flight.departureDateTime) : null;
    const departureDate = departure ? departure.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "TBD";
    const departureTime = departure ? departure.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD";

    const seats = Array.isArray(flight?.seats) ? flight.seats : [];
    const availableSeats = seats.filter((s) => !s.reserved).length;

    const duration = useMemo(() => {
        if (flight?.duration) return flight.duration;
        if (flight?.arrivalDateTime && flight?.departureDateTime) {
            try {
                const a = new Date(flight.arrivalDateTime);
                const d = new Date(flight.departureDateTime);
                const mins = Math.round((a - d) / 60000);
                if (!Number.isFinite(mins)) return null;
                const h = Math.floor(mins / 60);
                const m = mins % 60;
                return `${h}h ${m}m`;
            } catch (err) {
                return null;
            }
        }
        return null;
    }, [flight]);

    const priceFormatted = useMemo(() => {
        try {
            return new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR' }).format(flight?.basePrice ?? 0);
        } catch (_) {
            return `Rs. ${flight?.basePrice ?? 0}`;
        }
    }, [flight]);

    return (
        <article
            className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 mb-4"
        >
            <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                    {/* Left Section: Flight Info */}
                    <div className="flex-1">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                                {/* Placeholder for Airline Logo or Plane Icon */}
                                <svg className="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                                    {flight?.airline || 'Unknown Airline'} <span className="text-sm font-normal text-slate-500">({flight?.flightNumber})</span>
                                </h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                        {flight?.classType || 'Economy'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-8">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Departure</p>
                                <p className="text-lg font-bold text-slate-900">{departureTime}</p>
                                <p className="text-xs text-slate-500">{departureDate}</p>
                                <p className="text-xs text-slate-400">{flight?.source}</p>
                            </div>
                            <div className="flex-1 flex flex-col items-center">
                                <div className="w-full h-px bg-slate-200 relative top-3"></div>
                                <p className="text-xs text-slate-400 bg-white px-2 relative z-10">
                                    {duration || 'Direct'}
                                </p>
                                <svg className="w-4 h-4 text-slate-300 relative z-10 mt-1 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-500 mb-1">Arrival</p>
                                <p className="text-lg font-bold text-slate-900">
                                    {flight?.arrivalDateTime ? new Date(flight.arrivalDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {flight?.arrivalDateTime ? new Date(flight.arrivalDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD'}
                                </p>
                                <p className="text-xs text-slate-400">{flight?.destination}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Price & Action */}
                    <div className="flex flex-col justify-between items-end sm:border-l sm:border-slate-100 sm:pl-6 min-w-[140px]">
                        <div className="text-right">
                            <p className="text-sm text-slate-500">Starting from</p>
                            <p className="text-2xl font-bold text-sky-600">{priceFormatted}</p>
                            <p className="text-xs text-emerald-600 font-medium mt-1">
                                {availableSeats} seats left
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 w-full mt-4 sm:mt-0">
                            <button
                                onClick={handleClick}
                                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
                            >
                                Select Seats
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
};

PlaneDetail.propTypes = {
    flight: PropTypes.object.isRequired,
};

export default PlaneDetail;
