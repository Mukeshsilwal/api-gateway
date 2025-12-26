import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MovieSearchComponent = () => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    // Mock data
    const movies = [
        { id: 1, title: "Dune: Part Two", genre: "Sci-Fi/Adventure" },
        { id: 2, title: "Kung Fu Panda 4", genre: "Animation/Action" },
        { id: 3, title: "Godzilla x Kong", genre: "Action/Sci-Fi" },
        { id: 4, title: "Civil War", genre: "Action/Thriller" }
    ];

    const [selectedMovie, setSelectedMovie] = useState("");
    const [date, setDate] = useState("");
    const [guests, setGuests] = useState(1);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate("/qfx/movies");
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className={`relative overflow-hidden transition-all duration-700 ease-in-out ${isExpanded ? 'bg-white rounded-3xl shadow-2xl' : 'bg-transparent'}`}>

                {/* Initial State: CTA Card */}
                {!isExpanded && (
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl transform transition-all duration-500 hover:scale-[1.02]">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <span className="text-4xl">🎬</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Watch the Latest Blockbusters</h2>
                        <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
                            Experience cinema like never before. Book tickets for the hottest movies in town.
                        </p>
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="bg-white text-purple-600 font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-2xl hover:bg-purple-50 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            Start Movie Booking
                        </button>
                    </div>
                )}

                {/* Expanded State: Booking Form */}
                <div className={`transition-all duration-700 ease-in-out ${isExpanded ? 'opacity-100 max-h-[800px] p-8 md:p-12' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">Book Movie Tickets</h2>
                            <p className="text-gray-500">Select a movie and showtime</p>
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
                            {/* Movie Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Select Movie</label>
                                <select
                                    value={selectedMovie}
                                    onChange={(e) => setSelectedMovie(e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                >
                                    <option value="">Choose a movie...</option>
                                    {movies.map(movie => (
                                        <option key={movie.id} value={movie.id}>{movie.title}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* Guests */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Tickets</label>
                                <div className="flex items-center space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setGuests(Math.max(1, guests - 1))}
                                        className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="text-xl font-bold text-gray-800 w-8 text-center">{guests}</span>
                                    <button
                                        type="button"
                                        onClick={() => setGuests(guests + 1)}
                                        className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.01]"
                        >
                            Find Showtimes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MovieSearchComponent;
