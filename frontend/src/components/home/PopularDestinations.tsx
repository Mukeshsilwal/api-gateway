import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, Bus, Hotel, Clock, Star } from 'lucide-react';

const destinations = [
    {
        city: 'Pokhara',
        category: 'lakes',
        description: 'Lakeside serenity & gateway to the Annapurnas',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop',
        price: '1,050',
        duration: '6 hrs by bus',
        rating: '4.9',
        hotelsCount: '120+ Stays',
        tag: 'Top Rated'
    },
    {
        city: 'Kathmandu',
        category: 'cultural',
        description: 'UNESCO World Heritage temples & vibrant heritage',
        image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?q=80&w=1200&auto=format&fit=crop',
        price: '800',
        duration: 'Transit Hub',
        rating: '4.8',
        hotelsCount: '250+ Stays',
        tag: 'Capital City'
    },
    {
        city: 'Chitwan',
        category: 'wildlife',
        description: 'Jungle safaris, rhinos, & authentic Tharu culture',
        image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=1200&auto=format&fit=crop',
        price: '950',
        duration: '5 hrs by bus',
        rating: '4.8',
        hotelsCount: '80+ Resorts',
        tag: 'Safari'
    },
    {
        city: 'Lumbini',
        category: 'cultural',
        description: 'Sacred birthplace of Lord Buddha & monastic zones',
        image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1200&auto=format&fit=crop',
        price: '1,150',
        duration: '7 hrs by bus',
        rating: '4.9',
        hotelsCount: '50+ Hotels',
        tag: 'Peace Garden'
    },
    {
        city: 'Nagarkot',
        category: 'lakes',
        description: 'Panoramic Himalayan sunrise & peaceful ridge walks',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
        price: '450',
        duration: '1.5 hrs from KTM',
        rating: '4.7',
        hotelsCount: '40+ Resorts',
        tag: 'Sunrise View'
    },
    {
        city: 'Bandipur',
        category: 'cultural',
        description: 'Preserved Newari hilltop town with mountain views',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
        price: '900',
        duration: '4.5 hrs by bus',
        rating: '4.8',
        hotelsCount: '35+ Inns',
        tag: 'Heritage'
    }
];

export const PopularDestinations = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'lakes' | 'cultural' | 'wildlife'>('all');

    const filteredDestinations = selectedCategory === 'all'
        ? destinations
        : destinations.filter(d => d.category === selectedCategory);

    const handleBookBus = (city: string) => {
        navigate('/buslist', {
            state: {
                source: 'kathmandu',
                destination: city.toLowerCase(),
                date: new Date().toISOString().split('T')[0]
            }
        });
    };

    const handleExploreHotels = (city: string) => {
        navigate(`/hotels?city=${city.toLowerCase()}`);
    };

    return (
        <section className="py-20 bg-white dark:bg-black transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-brand-orange-600 dark:text-brand-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
                            <MapPin size={14} />
                            Himalayan Highlights
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-display">
                            Popular Destinations in Nepal
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-base mt-1">
                            From snowy Himalayan vistas to tropical wildlife safaris, discover Nepal’s most celebrated locations with direct booking.
                        </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2 bg-gray-100 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-200/60 dark:border-white/10">
                        {[
                            { id: 'all', label: 'All Places' },
                            { id: 'lakes', label: 'Lakes & Peaks' },
                            { id: 'cultural', label: 'Cultural Heritage' },
                            { id: 'wildlife', label: 'Jungle & Safari' },
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id as any)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                                    selectedCategory === cat.id
                                        ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredDestinations.map((dest, index) => (
                        <div
                            key={index}
                            className="group relative h-[420px] rounded-3xl overflow-hidden border border-gray-200/80 dark:border-white/10 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 flex flex-col justify-between p-6"
                        >
                            {/* Background Image with Zoom */}
                            <div className="absolute inset-0 z-0">
                                <img
                                    src={dest.image}
                                    alt={dest.city}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20"></div>
                            </div>

                            {/* Top Badges */}
                            <div className="relative z-10 flex items-center justify-between">
                                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold flex items-center gap-1.5">
                                    <MapPin size={13} className="text-brand-orange-400" />
                                    {dest.tag}
                                </span>
                                <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-amber-400 text-xs font-bold flex items-center gap-1">
                                    <Star size={13} className="fill-amber-400" />
                                    {dest.rating}
                                </span>
                            </div>

                            {/* Bottom Content & Interactive Actions */}
                            <div className="relative z-10 space-y-4">
                                <div>
                                    <div className="flex items-center gap-3 text-xs text-white/80 mb-1">
                                        <span className="flex items-center gap-1">
                                            <Clock size={13} />
                                            {dest.duration}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Hotel size={13} />
                                            {dest.hotelsCount}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold font-display text-white">
                                        {dest.city}
                                    </h3>
                                    <p className="text-white/80 text-sm mt-1 line-clamp-2">
                                        {dest.description}
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                                    <div>
                                        <span className="text-[11px] uppercase tracking-wider text-white/70 block">Bus tickets from</span>
                                        <span className="text-lg font-extrabold text-brand-orange-400">NPR {dest.price}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleBookBus(dest.city)}
                                            className="px-3.5 py-2 rounded-xl bg-white text-gray-900 hover:bg-brand-orange-500 hover:text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-md"
                                        >
                                            <Bus size={14} />
                                            Book Bus
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleExploreHotels(dest.city)}
                                            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                                            title="View Hotels"
                                        >
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <button
                        onClick={() => navigate('/buslist')}
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:shadow-xl transition-all hover:-translate-y-0.5"
                    >
                        <span>Explore All 40+ Destinations & Routes</span>
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </section>
    );
};
export default PopularDestinations;
