import React from 'react';
import { HotelCard } from './HotelCard';
import InfiniteScroll from 'react-infinite-scroll-component';

export function HotelList({ hotels, loading, hasMore, loadMore }) {
    if (loading && hotels.length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-md p-4 animate-pulse h-80">
                        <div className="bg-gray-200 h-40 rounded-xl mb-4"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-20 bg-gray-200 rounded mb-4"></div>
                        <div className="flex justify-between mt-auto">
                            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!loading && hotels.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No hotels found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                    We couldn't find any hotels matching your search criteria. Try adjusting your filters or search for a different city.
                </p>
            </div>
        );
    }

    return (
        <InfiniteScroll
            dataLength={hotels.length}
            next={loadMore}
            hasMore={hasMore}
            loader={
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
            }
            className="!overflow-visible" // Fix for some layout issues with infinite scroll
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel, index) => (
                    <HotelCard key={hotel.hotelId || hotel.id || hotel.hotelCode || index} hotel={hotel} />
                ))}
            </div>
        </InfiniteScroll>
    );
}
