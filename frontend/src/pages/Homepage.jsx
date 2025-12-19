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
  <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
      <Icon size={24} />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
  </div>
);

const RouteCard = ({ from, to, price, image, time }) => (
  <div className="group relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer shadow-md hover:shadow-xl transition-all">
    <img
      src={image}
      alt={`${from} to ${to}`}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end">
      <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <div className="flex items-center gap-2 text-white/90 text-sm mb-2 font-medium">
          <Clock size={14} />
          <span>{time}</span>
        </div>
        <h3 className="text-white text-xl font-bold mb-1 flex items-center gap-2">
          {from} <ArrowRight size={16} className="text-primary-400" /> {to}
        </h3>
        <p className="text-primary-300 text-sm font-semibold">Starting from Rs. {price}</p>
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
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
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
                <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">Popular Bus Routes</h2>
                <p className="text-gray-500">Explore the most travelled paths across Nepal</p>
              </div>
              <button className="text-primary font-semibold hover:text-primary-700 transition-colors flex items-center gap-2">
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
