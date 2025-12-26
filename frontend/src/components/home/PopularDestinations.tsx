import { MapPin, ArrowRight } from 'lucide-react';

const destinations = [
    {
        city: 'Kathmandu',
        description: 'The City of Temples',
        image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
        price: '800',
        color: 'from-orange-500 to-red-600'
    },
    {
        city: 'Pokhara',
        description: 'Gateway to Annapurna',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa',
        price: '1200',
        color: 'from-blue-400 to-indigo-600'
    },
    {
        city: 'Chitwan',
        description: 'Heart of the Jungle',
        image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2',
        price: '950',
        color: 'from-green-500 to-emerald-700'
    },
    {
        city: 'Lumbini',
        description: 'Birthplace of Buddha',
        image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b',
        price: '1100',
        color: 'from-amber-500 to-orange-600'
    }
];

export const PopularDestinations = () => {
    return (
        <section className="py-20 bg-white dark:bg-black transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-display mb-4">
                            Popular Destinations
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-lg">
                            Explore the most loved destinations in Nepal. Book your journey today.
                        </p>
                    </div>
                    <button className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/10 transition-all font-semibold text-gray-900 dark:text-white">
                        View All
                        <ArrowRight size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {destinations.map((dest, index) => (
                        <div
                            key={index}
                            className="group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer border border-transparent dark:border-white/10 transition-all"
                        >
                            {/* Image Background */}
                            <div className="absolute inset-0">
                                <img
                                    src={dest.image}
                                    alt={dest.city}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80"></div>
                            </div>

                            {/* Content */}
                            <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-medium mb-3`}>
                                        <MapPin size={14} />
                                        <span>Nepal</span>
                                    </div>

                                    <h3 className="text-3xl font-bold font-display mb-1">{dest.city}</h3>
                                    <p className="text-white/80 mb-4">{dest.description}</p>

                                    <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                        <div>
                                            <p className="text-xs text-white/70 uppercase tracking-wider font-semibold">Starting from</p>
                                            <p className="text-xl font-bold text-brand-orange-400">NPR {dest.price}</p>
                                        </div>
                                        <button className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center hover:bg-brand-orange-500 hover:text-white transition-colors">
                                            <ArrowRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <button className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-gray-200 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/10 transition-all font-semibold text-gray-900 dark:text-white">
                        View All Destinations
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </section>
    );
};
