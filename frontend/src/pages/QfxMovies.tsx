import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QfxService from '../services/qfx.service';
import MainLayout from '../components/MainLayout';

interface Movie {
    MovieID: string | number;
    MovieName: string;
    PosterUrl?: string;
    Rating?: string;
    Genre?: string;
    Duration?: string | number;
    Synopsis?: string;
    Language?: string;
}

const QfxMovies = () => {
    const [nowShowing, setNowShowing] = useState<Movie[]>([]);
    const [upcoming, setUpcoming] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'nowShowing' | 'upcoming'>('nowShowing');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const results = await Promise.all([
                    QfxService.getNowShowingMovies(),
                    QfxService.getUpcomingMovies()
                ]);

                // Handle response structure variances safely
                const nowShowingRes = results[0];
                const upcomingRes = results[1];

                setNowShowing(Array.isArray(nowShowingRes) ? nowShowingRes : (nowShowingRes?.data || []));
                setUpcoming(Array.isArray(upcomingRes) ? upcomingRes : (upcomingRes?.data || []));
            } catch (error) {
                console.error('Error fetching movies:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    const handleMovieClick = (movieId: string | number) => {
        if (activeTab === 'nowShowing') {
            navigate(`/qfx/movie/${movieId}`);
        }
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                            QFX Cinemas
                        </h1>
                        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                            Experience the magic of movies.
                        </p>
                    </div>

                    <div className="flex justify-center mb-8">
                        <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
                            <button
                                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'nowShowing'
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                onClick={() => setActiveTab('nowShowing')}
                            >
                                Now Showing
                            </button>
                            <button
                                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'upcoming'
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                onClick={() => setActiveTab('upcoming')}
                            >
                                Coming Soon
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {(activeTab === 'nowShowing' ? nowShowing : upcoming).map((movie) => (
                                <div
                                    key={movie.MovieID}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
                                    onClick={() => handleMovieClick(movie.MovieID)}
                                >
                                    <div className="relative pb-[150%]">
                                        <img
                                            src={movie.PosterUrl || 'https://placehold.co/300x450?text=No+Poster'}
                                            alt={movie.MovieName}
                                            className="absolute top-0 left-0 w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-bold">
                                            {movie.Rating || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-bold text-gray-900 truncate">{movie.MovieName}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{movie.Genre}</p>
                                        <div className="mt-4 flex justify-between items-center">
                                            <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                                {movie.Duration} min
                                            </span>
                                            {activeTab === 'nowShowing' && (
                                                <button className="text-sm font-medium text-orange-600 hover:text-orange-500">
                                                    Book Now &rarr;
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && (activeTab === 'nowShowing' ? nowShowing : upcoming).length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No movies found.
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default QfxMovies;
