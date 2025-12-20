import React, { Suspense, useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';
import LoadingFallback from '../components/LoadingFallback';
import FeaturedHotelsSection from '../components/hotels/FeaturedHotelsSection';
import RecommendationsSection from '../components/hotels/RecommendationsSection';
import { ShieldCheck, Clock, CreditCard, Headphones, MapPin, ArrowRight } from 'lucide-react';
import homeService from '../services/home.service';


const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors">
      <Icon size={24} />
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
  </div>
);

const RouteCard = ({ from, to, price, image, time }) => (
  <div className="group relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer shadow-md hover:shadow-2xl transition-all">
    <img
      src={image}
      alt={`${from} to ${to}`}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/95 via-stone-800/50 to-transparent p-6 flex flex-col justify-end">
      <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <div className="flex items-center gap-2 text-white/90 text-sm mb-2 font-medium">
          <Clock size={14} />
          <span>{time}</span>
        </div>
        <h3 className="text-white text-xl font-bold mb-1 flex items-center gap-2">
          {from} <ArrowRight size={16} className="text-orange-400" /> {to}
        </h3>
        <p className="text-orange-300 text-sm font-semibold">Starting from Rs. {price}</p>
      </div>
    </div>
  </div>
);

const Homepage = () => {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const data = await homeService.getHomeData();
        setHomeData(data);
      } catch (err) {
        console.error("Error fetching home data:", err);
        setError("Failed to load content.");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const features = [
    {
      icon: ShieldCheck,
      title: "Secure Payments",
      description: "Your transactions are protected with top-tier encryption and PCI-DSS standards."
    },
    {
      icon: Clock,
      title: "Instant Confirmation",
      description: "Receive your tickets via email and SMS immediately after successful payment."
    },
    {
      icon: CreditCard,
      title: "Multiple Payments",
      description: "Pay securely via eSewa, Khalti, IME Pay, or Mobile Banking."
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Our dedicated support team is available round the clock to assist you."
    }
  ];

  const popularRoutes = [
    {
      from: "Kathmandu",
      to: "Pokhara",
      price: "1,200",
      time: "7 Hours",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop"
    },
    {
      from: "Kathmandu",
      to: "Chitwan",
      price: "1,000",
      time: "5 Hours",
      image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=800&auto=format&fit=crop"
    },
    {
      from: "Pokhara",
      to: "Lumbini",
      price: "1,500",
      time: "6 Hours",
      image: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=800&auto=format&fit=crop"
    },
    {
      from: "Kathmandu",
      to: "Janakpur",
      price: "1,800",
      time: "8 Hours",
      image: "https://images.unsplash.com/photo-1558258695-5eef4432111b?q=80&w=800&auto=format&fit=crop"
    }
  ];

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><LoadingFallback /></div>;
  }

  // Fallback structures if API fails or returns partial data
  const featuredHotels = homeData?.hotelData?.featuredHotels || [];
  const recommendedHotels = homeData?.hotelData?.personalizedRecommendations || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow">
        <HeroSection availableCities={homeData?.hotelData?.availableCities} />

        {/* Features Section */}
        <section className="py-20 container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </section>

        {/* Popular Routes Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Popular Bus Routes</h2>
                <p className="text-slate-600">Explore the most travelled paths across Nepal</p>
              </div>
              <button className="text-slate-700 font-semibold hover:text-orange-600 transition-colors flex items-center gap-2">
                View All Routes <ArrowRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularRoutes.map((route, index) => (
                <RouteCard key={index} {...route} />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Events Section */}
        <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Upcoming Events</h2>
                <p className="text-slate-600">Discover concerts, sports, conferences and more</p>
              </div>
              <a
                href="/events"
                className="text-slate-700 font-semibold hover:text-purple-600 transition-colors flex items-center gap-2"
              >
                Browse All Events <ArrowRight size={18} />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Event Card 1 */}
              <a
                href="/events"
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&auto=format&fit=crop"
                    alt="Music Concert"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Music
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Summer Music Festival</h3>
                  <p className="text-slate-600 text-sm mb-4">Join us for an unforgettable night of live music</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">📅 Dec 25, 2024</span>
                    <span className="text-purple-600 font-semibold">From $50</span>
                  </div>
                </div>
              </a>

              {/* Event Card 2 */}
              <a
                href="/events"
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop"
                    alt="Sports Event"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Sports
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Championship Finals</h3>
                  <p className="text-slate-600 text-sm mb-4">Witness the ultimate showdown live</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">📅 Jan 15, 2025</span>
                    <span className="text-green-600 font-semibold">From $75</span>
                  </div>
                </div>
              </a>

              {/* Event Card 3 */}
              <a
                href="/events"
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=800&auto=format&fit=crop"
                    alt="Tech Conference"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Technology
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Tech Summit 2025</h3>
                  <p className="text-slate-600 text-sm mb-4">Explore the future of innovation</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">📅 Feb 20, 2025</span>
                    <span className="text-blue-600 font-semibold">From $100</span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Featured Hotels Section */}
        {featuredHotels.length > 0 && (
          <FeaturedHotelsSection hotels={featuredHotels} />
        )}

        {/* Recommendations Section */}
        {recommendedHotels.length > 0 && (
          <RecommendationsSection hotels={recommendedHotels} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Homepage;
