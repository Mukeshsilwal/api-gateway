import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QfxService from '../services/qfx.service';
import MainLayout from '../components/MainLayout';
import { toast } from 'react-toastify';

const QfxMovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [cinemas, setCinemas] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showtimes, setShowtimes] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [movieRes, cinemasRes] = await Promise.all([
                    QfxService.getMovieDetails(id),
                    QfxService.getCinemas()
                ]);
                setMovie(movieRes.data);
                setCinemas(cinemasRes.data || []);
            } catch (error) {
                console.error('Error fetching details:', error);
                toast.error('Failed to load movie details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        const fetchShowtimes = async () => {
            if (!movie || cinemas.length === 0) return;

            const showtimesMap = {};
            for (const cinema of cinemas) {
                try {
                    // Use CinemaID instead of id
                    const res = await QfxService.getShowtimes(id, cinema.CinemaID, selectedDate);
                    if (res.data && res.data.length > 0) {
                        showtimesMap[cinema.CinemaID] = res.data;
                    }
                } catch (error) {
                    console.error(`Error fetching showtimes for cinema ${cinema.CinemaID}:`, error);
                }
            }
            setShowtimes(showtimesMap);
        };

        fetchShowtimes();
    }, [movie, cinemas, selectedDate, id]);

    const handleShowtimeClick = (showtimeId) => {
        navigate(`/qfx/seats/${showtimeId}`);
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
            </MainLayout>
        );
    }

    if (!movie) {
        return (
            <MainLayout>
                <div className="text-center py-12 text-gray-500">Movie not found.</div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="bg-gray-900 text-white min-h-screen">
                {/* Hero Section */}
                <div className="relative h-[50vh] sm:h-[60vh]">
                    <div className="absolute inset-0">
                        <img
                            src={movie.PosterUrl || 'https://placehold.co/1200x600?text=No+Backdrop'}
                            alt={movie.MovieName}
                            className="w-full h-full object-cover opacity-40"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-8 sm:p-12">
                        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-end gap-8">
                            <img
                                src={movie.PosterUrl}
                                alt={movie.MovieName}
                                className="w-48 rounded-lg shadow-2xl hidden sm:block"
                            />
                            <div className="mb-4">
                                <h1 className="text-4xl sm:text-5xl font-bold mb-2">{movie.MovieName}</h1>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-4">
                                    <span className="bg-purple-600 px-2 py-1 rounded text-white font-bold">{movie.Rating}</span>
                                    <span>{movie.Duration} min</span>
                                    <span>{movie.Genre}</span>
                                    <span>{movie.Language || 'English'}</span>
                                </div>
                                <p className="max-w-2xl text-gray-300 text-lg line-clamp-3">{movie.Synopsis}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">Select Showtime</h2>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:border-purple-500"
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="space-y-8">
                        {cinemas.map((cinema) => {
                            const cinemaShowtimes = showtimes[cinema.CinemaID];
                            if (!cinemaShowtimes || cinemaShowtimes.length === 0) return null;

                            return (
                                <div key={cinema.CinemaID} className="bg-gray-800 rounded-lg p-6">
                                    <h3 className="text-xl font-bold mb-4 text-purple-400">{cinema.Name}</h3>
                                    <p className="text-sm text-gray-400 mb-4">{cinema.Location}</p>
                                    <div className="flex flex-wrap gap-4">
                                        {cinemaShowtimes.map((showtime) => (
                                            <button
                                                key={showtime.ShowtimeID}
                                                onClick={() => handleShowtimeClick(showtime.ShowtimeID)}
                                                className="px-6 py-3 bg-gray-700 hover:bg-purple-600 rounded-lg transition-colors border border-gray-600 hover:border-purple-500 group"
                                            >
                                                <div className="text-lg font-bold group-hover:text-white">
                                                    {new Date(showtime.ShowTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="text-xs text-gray-400 group-hover:text-purple-100">
                                                    {showtime.ScreenName}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {Object.keys(showtimes).length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                No showtimes available for this date.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default QfxMovieDetails;
