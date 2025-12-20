import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import hotelsApi from "../api/hotelsApi";
import NavigationBar from "../components/Navbar";
import Footer from "../components/Footer";
import { Star, MapPin, Phone, Mail, Info, Wifi, Coffee, Car, ShieldCheck } from "lucide-react";
import BookingModal from "../components/bookings/BookingModal";
import bookingService from "../services/bookingService";

const HotelDetail = () => {
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const bookingParams = location.state || {};

    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [bookingModalData, setBookingModalData] = useState(null);

    useEffect(() => {
        // If hotel data is passed via navigation (from HotelList), use it immediately
        if (bookingParams.hotel) {
            const preLoadedHotel = bookingParams.hotel;
            setHotel(preLoadedHotel);

            // If rooms are already present in the passed hotel object, use them
            if (preLoadedHotel.rooms && Array.isArray(preLoadedHotel.rooms) && preLoadedHotel.rooms.length > 0) {
                setRooms(preLoadedHotel.rooms);
                setIsLoading(false);
                return; // Skip fetching if we have data
            }

            // If we have hotel details but NO rooms, likely need to fetch rooms
            // But we can show the hotel details immediately while loading rooms
        }

        fetchHotelDetails();
    }, [hotelId, bookingParams.hotel]);

    // Check availability when dates change
    useEffect(() => {
        if (bookingParams.checkIn && bookingParams.checkOut && hotelId) {
            checkAvailability();
        }
    }, [bookingParams.checkIn, bookingParams.checkOut, bookingParams.guests, hotelId]);

    const fetchHotelDetails = async () => {
        // If we already have hotel data from state, don't show full page loader, just maybe a progress bar or nothing if we are just fetching rooms
        if (!hotel) setIsLoading(true);

        try {
            // If we already have hotel details from state, we might only need to fetch rooms
            // But to be safe and get fresh data, we often fetch details again. 
            // However, the user optimization request specifically asked to use existing data.

            let currentHotelData = hotel;

            if (!currentHotelData) {
                const [data] = await Promise.all([
                    hotelsApi.getHotelDetails(hotelId),
                ]);
                currentHotelData = data;
                setHotel(currentHotelData);
            }

            // Use rooms from hotel details if available, otherwise fetch separately
            if (currentHotelData.rooms && Array.isArray(currentHotelData.rooms) && currentHotelData.rooms.length > 0) {
                setRooms(currentHotelData.rooms);
            } else {
                try {
                    const identifier = currentHotelData.id || hotelId;
                    const roomsData = await hotelsApi.getHotelRooms(identifier);
                    setRooms(roomsData);
                } catch (error) {
                    console.log("No rooms found or error fetching rooms:", error);
                    setRooms([]);
                }
            }
        } catch (error) {
            toast.error("Failed to load hotel details");
            console.error("Error loading hotel:", error);
            if (!hotel) navigate('/hotels'); // Only redirect if we have NOTHING
        } finally {
            setIsLoading(false);
        }
    };

    const checkAvailability = async () => {
        if (!bookingParams.checkIn || !bookingParams.checkOut) return;

        try {
            const request = {
                hotelId: parseInt(hotelId),
                checkIn: `${bookingParams.checkIn}T14:00:00`, // Default times if not provided
                checkOut: `${bookingParams.checkOut}T11:00:00`,
                guestsCount: bookingParams.guests || 1
            };

            const response = await bookingService.checkAvailability(request);

            if (response && response.data) {
                // Update rooms with availability info or replace rooms list
                // Strategy: active rooms are those in the available list.
                // Or if the API returns ONLY available rooms, we might want to flag others as unavailable.
                // For simplicity, let's assume the API returns available rooms. 
                // We'll mark rooms as 'available' if they are in the response.

                const availableRoomIds = new Set(response.data.map(r => r.roomId || r.id));

                setRooms(prevRooms => prevRooms.map(room => ({
                    ...room,
                    isAvailable: availableRoomIds.has(room.id),
                    // If the API returns specific price/details for this date, merge them
                    ...response.data.find(r => (r.roomId === room.id || r.id === room.id))
                })));
            }
        } catch (error) {
            console.error("Error checking availability:", error);
            // Optionally toast.error("Could not check availability");
        }
    };

    const handleBookRoom = (room) => {
        if (!bookingParams.checkIn || !bookingParams.checkOut) {
            toast.warn("Please select check-in and check-out dates first.");
            return;
        }

        navigate('/hotel-booking', {
            state: {
                hotel,
                room,
                checkIn: bookingParams.checkIn,
                checkOut: bookingParams.checkOut,
                guests: bookingParams.guests
            }
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <NavigationBar />
                <main className="flex-grow pt-24 pb-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="animate-pulse space-y-8">
                            <div className="h-96 bg-gray-200 rounded-2xl"></div>
                            <div className="space-y-4">
                                <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!hotel) return null;

    const images = hotel.images && hotel.images.length > 0
        ? hotel.images
        : ["https://placehold.co/800x600?text=Hotel+Image"];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <NavigationBar />

            <main className="flex-grow pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Breadcrumb / Back */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors text-sm font-medium"
                    >
                        ← Back to Hotels
                    </button>

                    {/* Hero Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-lg group">
                                <img
                                    src={images[selectedImage]}
                                    alt={hotel.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => { e.target.src = "https://placehold.co/800x600?text=Hotel+Image"; }}
                                />
                                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                                    {selectedImage + 1} / {images.length}
                                </div>
                            </div>
                            {images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent opacity-70 hover:opacity-100'
                                                }`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Hotel Info */}
                        <div className="flex flex-col justify-center space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">
                                        {hotel.type || 'Luxury Hotel'}
                                    </span>
                                    {hotel.stars && (
                                        <div className="flex text-yellow-400 text-sm">
                                            {[...Array(parseInt(hotel.stars) || 5)].map((_, i) => (
                                                <Star key={i} size={14} fill="currentColor" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">{hotel.name}</h1>
                                <div className="flex items-center text-gray-500 text-sm">
                                    <MapPin size={16} className="mr-1.5 text-indigo-500" />
                                    {hotel.address || `${hotel.city}, ${hotel.country}`}
                                </div>
                            </div>

                            {/* Combined Rating Block */}
                            <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-fit">
                                <div className="bg-indigo-600 text-white w-12 h-12 flex items-center justify-center rounded-lg font-bold text-xl">
                                    {hotel.rating || 4.9}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">Excellent</div>
                                    <div className="text-xs text-gray-500">{hotel.reviews || 128} verified reviews</div>
                                </div>
                            </div>

                            <p className="text-gray-600 leading-relaxed">
                                {hotel.description || "Experience luxury and comfort in the heart of the city. Enjoy world-class amenities and exceptional service."}
                            </p>

                            {/* Amenities Grid */}
                            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                                <div className="flex items-center gap-2"><Wifi size={16} className="text-green-500" /> Free High-Speed Wi-Fi</div>
                                <div className="flex items-center gap-2"><Coffee size={16} className="text-orange-500" /> Breakfast Included</div>
                                <div className="flex items-center gap-2"><Car size={16} className="text-blue-500" /> Free Parking</div>
                                <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-indigo-500" /> 24/7 Security</div>
                            </div>

                            {/* Contact */}
                            <div className="flex gap-6 pt-4 border-t border-gray-100">
                                {hotel.phone && (
                                    <a href={`tel:${hotel.phone.replace(/\s+/g, '')}`} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors">
                                        <Phone size={18} />
                                        <span className="text-sm font-medium">{hotel.phone}</span>
                                    </a>
                                )}
                                {hotel.email && (
                                    <a href={`mailto:${hotel.email}`} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors">
                                        <Mail size={18} />
                                        <span className="text-sm font-medium">Email Hotel</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Booking Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Rooms</h2>
                            {rooms.length > 0 ? (
                                <div className="space-y-4">
                                    {rooms.map((room) => (
                                        <RoomCard
                                            key={room.id}
                                            room={room}
                                            isDateSelected={!!(bookingParams.checkIn && bookingParams.checkOut)}
                                            isAvailable={room.isAvailable !== false} // Default to true if not checked yet, or strict check? 
                                            // Better UX: if dates selected, strict check. If not, show all as "Select Dates"
                                            onBook={(roomWithSelection) => {
                                                if (!bookingParams.checkIn || !bookingParams.checkOut) {
                                                    toast.warn("Please select check-in and check-out dates first.");
                                                    return;
                                                }
                                                setBookingModalData({
                                                    room: {
                                                        ...room,
                                                        ...roomWithSelection,
                                                        hotelId: hotel.id // Ensure hotelId is passed
                                                    },
                                                    context: {
                                                        checkInDate: bookingParams.checkIn,
                                                        checkOutDate: bookingParams.checkOut,
                                                        guests: bookingParams.guests || 1
                                                    }
                                                });
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <Info className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">No rooms available</h3>
                                    <p className="text-gray-500">Try changing your dates or check back later.</p>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Your Stay</h3>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Check-in</label>
                                            <input
                                                type="date"
                                                className="w-full bg-transparent border-b border-gray-300 focus:border-indigo-600 outline-none py-1 text-sm font-medium"
                                                value={bookingParams.checkIn || ''}
                                                onChange={(e) => navigate('.', { state: { ...bookingParams, checkIn: e.target.value }, replace: true })}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Check-out</label>
                                            <input
                                                type="date"
                                                className="w-full bg-transparent border-b border-gray-300 focus:border-indigo-600 outline-none py-1 text-sm font-medium"
                                                value={bookingParams.checkOut || ''}
                                                onChange={(e) => navigate('.', { state: { ...bookingParams, checkOut: e.target.value }, replace: true })}
                                                min={bookingParams.checkIn || new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Guests</label>
                                            <select
                                                className="w-full bg-transparent border-b border-gray-300 focus:border-indigo-600 outline-none py-1 text-sm font-medium"
                                                value={bookingParams.guests || 1}
                                                onChange={(e) => navigate('.', { state: { ...bookingParams, guests: parseInt(e.target.value) }, replace: true })}
                                            >
                                                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg text-blue-700">
                                        <Info size={14} />
                                        <span>Select dates to see accurate pricing</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
            {bookingModalData && (
                <BookingModal
                    room={bookingModalData.room}
                    context={bookingModalData.context}
                    onClose={() => setBookingModalData(null)}
                />
            )}
        </div>
    );
};

// Internal RoomCard Component
const RoomCard = ({ room, onBook, isDateSelected, isAvailable }) => {
    // Determine initial state if options exist
    const [selectedRentType, setSelectedRentType] = useState(room.availableRentTypes?.[0]?.id || "");
    const [selectedMealPlan, setSelectedMealPlan] = useState(room.availableMealPlans?.[0]?.id || "");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleBookClick = () => {
        onBook({
            rentTypeId: selectedRentType,
            mealPlanId: selectedMealPlan
        });
    };

    const images = room.images && room.images.length > 0 ? room.images : [];

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all flex flex-col sm:flex-row gap-6">
            {/* Room Image - Left Side */}
            {images.length > 0 && (
                <div className="w-full sm:w-1/3 md:w-1/4 h-48 sm:h-auto flex-shrink-0 relative rounded-xl overflow-hidden group">
                    <img
                        src={images[currentImageIndex]}
                        alt={room.roomType || room.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "https://placehold.co/400x300?text=Room"; }}
                    />
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                                {currentImageIndex + 1}/{images.length}
                            </div>
                        </>
                    )}
                </div>
            )}

            <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{room.roomType || room.name}</h3>
                    {room.size && <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{room.size} sq ft</span>}
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.description || "Spacious room with modern amenities."}</p>

                {/* Options Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                    {room.availableRentTypes?.length > 0 && (
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Rent Type</label>
                            <select
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={selectedRentType}
                                onChange={(e) => setSelectedRentType(e.target.value)}
                            >
                                {room.availableRentTypes.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.name} {type.durationHours ? `(${type.durationHours}h)` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {room.availableMealPlans?.length > 0 && (
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Meal Plan</label>
                            <select
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={selectedMealPlan}
                                onChange={(e) => setSelectedMealPlan(e.target.value)}
                            >
                                <option value="">No Meal Plan</option>
                                {room.availableMealPlans.map(plan => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name} (+{plan.price})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-2">
                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md">Free Cancellation</span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">Breakfast Included</span>
                </div>
            </div>
            <div className="sm:text-right flex flex-col justify-between min-w-[140px]">
                <div>
                    <div className="text-3xl font-bold text-indigo-600">
                        NPR {(room.price || room.basePrice || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">per night / excluding tax</div>
                </div>
                <button
                    onClick={handleBookClick}
                    disabled={isDateSelected && !isAvailable}
                    className={`mt-4 w-full font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 ${isDateSelected && !isAvailable
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#60bb46] hover:bg-[#4ca036] text-white"
                        }`}
                >
                    {isDateSelected ? (
                        isAvailable ? "Book Now" : "Unavailable"
                    ) : "Select Dates"}
                </button>
            </div>
        </div>
    );
};

export default HotelDetail;
