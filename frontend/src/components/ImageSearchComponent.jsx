import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BusListContext from "../context/busdetails";
import ApiService from "../services/api.service";
import API_CONFIG from "../config/api";

const ImageSearchComponent = () => {
  const navigate = useNavigate();
  const { setBusList } = useContext(BusListContext);
  const [isExpanded, setIsExpanded] = useState(false);

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [busStops, setBusStops] = useState([]);
  const [fetchError, setFetchError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setFetchError("");

    if (!source || !destination || !date) {
      setFetchError("Please select source, destination and date.");
      return;
    }

    if (source === destination) {
      setFetchError("Source and destination cannot be the same.");
      return;
    }

    localStorage.setItem("searchDetails", JSON.stringify({ source, destination, date }));
    setBusList([]);
    navigate("/buslist", { state: { source, destination, date } });
  };

  useEffect(() => {
    const getBusStops = async () => {
      try {
        const response = await ApiService.get(`${API_CONFIG.ENDPOINTS.GET_BUS_STOPS}`);
        if (response) {
          const data = await response.data;
          setBusStops(data);
        }
      } catch (error) {
        console.error("Failed to fetch bus stops:", error);
      }
    };
    getBusStops();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className={`relative overflow-hidden transition-all duration-700 ease-in-out ${isExpanded ? 'bg-white rounded-3xl shadow-2xl' : 'bg-transparent'}`}>

        {/* Initial State: CTA Card */}
        {!isExpanded && (
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl transform transition-all duration-500 hover:scale-[1.02]">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <span className="text-4xl">🚌</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Travel Across Nepal</h2>
            <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
              Comfortable buses, scenic routes, and affordable prices. Book your seat today.
            </p>
            <button
              onClick={() => setIsExpanded(true)}
              className="bg-white text-orange-600 font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-2xl hover:bg-orange-50 transition-all duration-300 transform hover:-translate-y-1"
            >
              Start Bus Booking
            </button>
          </div>
        )}

        {/* Expanded State: Booking Form */}
        <div className={`transition-all duration-700 ease-in-out ${isExpanded ? 'opacity-100 max-h-[800px] p-8 md:p-12' : 'opacity-0 max-h-0 overflow-hidden'}`}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Find Your Bus</h2>
              <p className="text-gray-500">Search for routes and schedules</p>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Source */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">From</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select source city</option>
                  {busStops.map((city) => (
                    <option key={city.name} value={city.name}>{city.name}</option>
                  ))}
                </select>
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">To</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select destination city</option>
                  {busStops.map((city) => (
                    <option key={city.name} value={city.name}>{city.name}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700">Travel Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={today}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {fetchError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
                {fetchError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-[1.01]"
            >
              Search Buses
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ImageSearchComponent;
