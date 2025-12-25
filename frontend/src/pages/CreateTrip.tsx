import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTrip, type CreateTripRequest, type Trip } from '../services/tripService';
import { Calendar, DollarSign, FileText, MapPin, Users, CheckCircle, Bus, Hotel, Ticket, X } from 'lucide-react';
import { toast } from 'react-toastify';

const CreateTripPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<1 | 2>(1); // 1: Details, 2: Add-ons
    const [createdTrip, setCreatedTrip] = useState<Trip | null>(null);
    const [formData, setFormData] = useState<CreateTripRequest>({
        tripName: '',
        tripType: 'LEISURE',
        touristType: 'NEPALI',
        startDate: '',
        endDate: '',
        budget: 0,
        description: '',
    });

    // Step 1: Submit Details & Create Trip
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const trip = await createTrip(formData);
            setCreatedTrip(trip);
            setStep(2); // Move to "Integrated Booking" step
            toast.success('Trip created successfully! Now let\'s add some bookings.');
        } catch (err: any) {
            alert('Failed to create trip: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'budget' ? Number(value) : value,
        }));
    };

    // Helper for quick navigation to search pages with context
    const navigateToSearch = (type: 'bus' | 'hotel' | 'event') => {
        if (!createdTrip) return;

        const params = new URLSearchParams();
        params.set('tripId', createdTrip.tripId.toString());
        params.set('tripName', createdTrip.tripName);
        params.set('date', createdTrip.startDate.split('T')[0]); // Pre-fill start date

        // Pre-fill destination from trip name if possible (simple heuristic)
        // In a real app, we'd have a destination field in the trip model
        const possibleDest = createdTrip.tripName.split(' ')[0];
        if (possibleDest) params.set('destination', possibleDest);

        let path = '';
        if (type === 'bus') path = '/bus';
        if (type === 'hotel') path = '/hotels';
        if (type === 'event') path = '/events';

        navigate(`${path}?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Header Progress */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {step === 1 ? 'Plan Your Trip' : 'Customize Your Trip'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {step === 1 ? 'Start by defining your journey details' : `Great start! Now add bookings to "${createdTrip?.tripName}"`}
                        </p>
                    </div>
                    {/* Step Indicator */}
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                        <div className={`w-12 h-1 ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                    </div>
                </div>

                {/* Step 1: Trip Details Form */}
                {step === 1 && (
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
                        {/* Trip Name */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                <MapPin className="w-4 h-4" />
                                Trip Name *
                            </label>
                            <input
                                type="text"
                                name="tripName"
                                value={formData.tripName}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Pokhara Weekend Getaway"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Trip Type & Tourist Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    <FileText className="w-4 h-4" />
                                    Trip Type *
                                </label>
                                <select
                                    name="tripType"
                                    value={formData.tripType}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="LEISURE">Leisure</option>
                                    <option value="BUSINESS">Business</option>
                                    <option value="ADVENTURE">Adventure</option>
                                    <option value="CULTURAL">Cultural</option>
                                    <option value="PILGRIMAGE">Pilgrimage</option>
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    <Users className="w-4 h-4" />
                                    Tourist Type *
                                </label>
                                <select
                                    name="touristType"
                                    value={formData.touristType}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="NEPALI">Nepali</option>
                                    <option value="INTERNATIONAL">International</option>
                                </select>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    <Calendar className="w-4 h-4" />
                                    Start Date *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    <Calendar className="w-4 h-4" />
                                    End Date *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Budget */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                <DollarSign className="w-4 h-4" />
                                Budget (NPR) *
                            </label>
                            <input
                                type="number"
                                name="budget"
                                value={formData.budget}
                                onChange={handleChange}
                                required
                                min="0"
                                step="100"
                                placeholder="50000"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                <FileText className="w-4 h-4" />
                                Description (Optional)
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Describe your trip plans..."
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/trips')}
                                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating...' : 'Next: Add Bookings'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 2: Integrated Booking Wizard */}
                {step === 2 && createdTrip && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        {/* Success Banner */}
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            <div>
                                <h3 className="font-semibold text-green-900 dark:text-green-300">Trip Created Successfully!</h3>
                                <p className="text-sm text-green-800 dark:text-green-400">
                                    You can now immediately book services for this trip. We've pre-filled your dates.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {/* Option 1: Bus */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:border-orange-500 transition-colors cursor-pointer group p-6"
                                onClick={() => navigateToSearch('bus')}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition">
                                            <Bus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Book Bus Tickets</h3>
                                            <p className="text-gray-500 dark:text-gray-400">Find comfortable rides for your journey</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-300 group-hover:bg-orange-100 group-hover:text-orange-700">
                                        Start Search →
                                    </div>
                                </div>
                            </div>

                            {/* Option 2: Hotel */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:border-orange-500 transition-colors cursor-pointer group p-6"
                                onClick={() => navigateToSearch('hotel')}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition">
                                            <Hotel className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reserve Hotels</h3>
                                            <p className="text-gray-500 dark:text-gray-400">Stay in top-rated places</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-300 group-hover:bg-orange-100 group-hover:text-orange-700">
                                        Start Search →
                                    </div>
                                </div>
                            </div>

                            {/* Option 3: Event */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:border-orange-500 transition-colors cursor-pointer group p-6"
                                onClick={() => navigateToSearch('event')}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center group-hover:bg-green-200 transition">
                                            <Ticket className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Find Events</h3>
                                            <p className="text-gray-500 dark:text-gray-400">Discover local activities</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-300 group-hover:bg-orange-100 group-hover:text-orange-700">
                                        Start Search →
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Final Action */}
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button
                                onClick={() => navigate(`/trips/${createdTrip.tripId}`)}
                                className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-bold hover:shadow-lg transition flex items-center gap-2"
                            >
                                <CheckCircle className="w-5 h-5" />
                                I'm Done Adding Items
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateTripPage;
