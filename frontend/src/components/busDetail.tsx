import React, { useContext, useMemo, useCallback, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";
import SelectedBusContext from "../context/selectedbus";
import busIcon from "../assets/bus.svg";
import { SeatIcon } from "./SeatIcon";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { Clock, MapPin, Wifi, Wind, Info } from "lucide-react";

const BusDetail = ({ bus }) => {
  const navigate = useNavigate();
  const { setSelectedBus } = useContext(SelectedBusContext);

  const location = useLocation();
  const handleClick = useCallback(() => {
    const stored = JSON.parse(localStorage.getItem("busListDetails")) || { busList: [] };
    const newData = {
      ...stored,
      selectedBus: bus,
    };

    try {
      localStorage.setItem("busListDetails", JSON.stringify(newData));
    } catch (err) {
      console.warn("Could not persist selected bus:", err);
    }

    setSelectedBus(bus);

    // Preserve tripId if present in current URL
    const params = new URLSearchParams(location.search);
    const tripId = params.get('tripId');
    navigate(`/ticket-details${tripId ? `?tripId=${tripId}` : ''}`);
  }, [bus, setSelectedBus, navigate, location.search]);

  const departure = bus?.departureDateTime ? new Date(bus.departureDateTime) : null;
  const departureDate = departure ? departure.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "TBD";
  const departureTime = departure ? departure.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD";

  const seats = Array.isArray(bus?.seats) ? bus.seats : [];
  const availableSeats = seats.filter((s) => !s.reserved).length;

  const duration = useMemo(() => {
    if (bus?.duration) return bus.duration;
    if (bus?.arrivalDateTime && bus?.departureDateTime) {
      try {
        const a = new Date(bus.arrivalDateTime);
        const d = new Date(bus.departureDateTime);
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
  }, [bus]);

  const priceFormatted = useMemo(() => {
    try {
      return new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(bus?.basePrice ?? 0);
    } catch (_) {
      return `Rs. ${bus?.basePrice ?? 0}`;
    }
  }, [bus]);

  const [showSeatPreview, setShowSeatPreview] = useState(false);

  const seatPreview = useMemo(() => {
    const list = Array.isArray(bus?.seats) ? bus.seats : [];
    const cols = bus?.seatLayout?.cols || 4;
    const rows = Math.ceil(list.length / cols) || 0;
    const grid = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const seat = list[idx] || null;
        row.push(seat);
      }
      grid.push(row);
    }
    return { grid, cols, rows };
  }, [bus]);

  return (
    <Card hover className="overflow-hidden border-l-4 border-l-purple-600 dark:border-l-purple-500 transition-all duration-300">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Left Section: Bus Info */}
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center flex-shrink-0 border border-purple-200/50 dark:border-purple-800/40">
                <img
                  src={bus?.image || busIcon}
                  alt={bus?.busName || 'bus'}
                  loading="lazy"
                  className="w-8 h-8 object-contain opacity-90"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {bus?.busName || 'Unnamed Bus'}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                    {bus?.busType || 'Standard'}
                  </span>
                  {bus?.isAc && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                      <Wind size={12} /> AC
                    </span>
                  )}
                  {bus?.hasWifi && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                      <Wifi size={12} /> WiFi
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4 sm:gap-8">
              <div>
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <Clock size={12} /> Departure
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{departureTime}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{departureDate}</p>
              </div>

              <div className="flex-1 flex flex-col items-center">
                <div className="w-full h-px bg-slate-200 dark:bg-slate-700 relative top-3"></div>
                <div className="bg-white dark:bg-slate-900 px-2 relative z-10">
                  <span className="text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-0.5">
                    {duration || 'Direct'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <MapPin size={12} /> Arrival
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {bus?.arrivalDateTime ? new Date(bus.arrivalDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {bus?.arrivalDateTime ? new Date(bus.arrivalDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Section: Price & Action */}
          <div className="flex flex-col justify-between items-end sm:border-l sm:border-slate-100 dark:sm:border-slate-800 sm:pl-6 min-w-[160px]">
            <div className="text-right w-full">
              <p className="text-sm text-slate-500 dark:text-slate-400">Starting from</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{priceFormatted}</p>
              <p className={`text-xs font-semibold mt-1 ${availableSeats < 5 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {availableSeats} seats left
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full mt-6 sm:mt-0">
              <Button
                onClick={handleClick}
                className="w-full shadow-lg shadow-purple-500/20"
              >
                Select Seats
              </Button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowSeatPreview(!showSeatPreview); }}
                className="w-full text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center justify-center gap-1"
              >
                <Info size={14} />
                {showSeatPreview ? 'Hide Layout' : 'View Layout'}
              </button>
            </div>
          </div>
        </div>

        {/* Seat Preview */}
        {showSeatPreview && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Seat Layout Preview</h4>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"></div>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600"></div>
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Booked</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/70 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/70 dark:border-slate-700 overflow-x-auto">
              <div className="grid gap-2 min-w-max mx-auto" style={{ gridTemplateColumns: `repeat(${seatPreview.cols}, minmax(32px, 1fr))` }}>
                {seatPreview.grid.flat().map((seat, idx) => (
                  <div key={idx} className="aspect-square flex items-center justify-center">
                    {seat ? (
                      <SeatIcon
                        status={seat.reserved ? 'booked' : 'available'}
                        seatNumber={seat.seatNumber}
                        className="w-8 h-8"
                      />
                    ) : (
                      <div className="w-8 h-8 invisible" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

BusDetail.propTypes = {
  bus: PropTypes.object.isRequired,
};

export default BusDetail;
