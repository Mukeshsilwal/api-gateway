import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApiService from '../../services/api.service';
import API_CONFIG from '../../config/api';
import { DataTable } from './DataTable';

interface Movie {
    id: string | number;
    name: string;
    thumbnailUrl?: string;
    genre?: string;
    rating?: string;
    releaseDate?: string;
    duration?: string;
    [key: string]: any;
}

export const CinemaManager: React.FC = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMovies();
    }, []);

    async function fetchMovies() {
        try {
            setIsLoading(true);
            const data = await ApiService.get(API_CONFIG.ENDPOINTS.QFX_MOVIES_NOW_SHOWING);
            // The API might return { data: [...] } or just [...]
            // Since ApiService unwraps { data: ... }, we just need to check if it's an array
            const movieList = Array.isArray(data) ? data : ((data as any).data || []);
            setMovies(movieList);
        } catch (error) {
            console.error("Error fetching movies:", error);
            toast.error("Error loading movies");
        } finally {
            setIsLoading(false);
        }
    }

    const movieColumns = [
        { key: 'id', label: 'ID', sortable: true },
        {
            key: 'name',
            label: 'Movie Name',
            sortable: true,
            render: (name: string, movie: Movie) => (
                <div className="flex items-center gap-3">
                    {movie.thumbnailUrl && (
                        <img
                            src={movie.thumbnailUrl}
                            alt={name}
                            loading="lazy"
                            className="w-10 h-14 object-cover rounded-md shadow-sm"
                        />
                    )}
                    <span className="font-medium">{name}</span>
                </div>
            )
        },
        {
            key: 'genre',
            label: 'Genre',
            sortable: true
        },
        {
            key: 'rating',
            label: 'Rating',
            sortable: true,
            render: (rating: string) => (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                    {rating || 'N/A'}
                </span>
            )
        },
        {
            key: 'releaseDate',
            label: 'Release Date',
            sortable: true,
            render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A'
        },
        {
            key: 'duration',
            label: 'Duration',
            sortable: true
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                        Cinema Management
                    </h2>
                    <p className="text-gray-600 mt-1">Manage movies and showtimes</p>
                </div>
                <button
                    className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Movie
                </button>
            </div>

            {/* Movie List */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Now Showing</h3>
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                    </div>
                ) : (
                    <DataTable
                        columns={movieColumns}
                        data={movies}
                        itemsPerPage={10}
                        searchable={true}
                        exportable={true}
                    />
                )}
            </div>
        </div>
    );
}
