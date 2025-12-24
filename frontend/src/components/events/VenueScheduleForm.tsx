import { useState, useEffect } from 'react';
import { VenueDto, EventType } from '../../types/event-dto';
import { Calendar, MapPin, Globe, Clock, Map } from 'lucide-react';

interface VenueScheduleFormProps {
    data: {
        startDateTime?: string;
        endDateTime?: string;
        timezone?: string;
        venue?: VenueDto;
        onlineLink?: string;
        type?: EventType;
    };
    onChange: (data: any) => void;
}

/**
 * Event Venue & Schedule Form
 * Step 2 of event creation wizard
 */
const VenueScheduleForm: React.FC<VenueScheduleFormProps> = ({ data, onChange }) => {
    // Local state to manage form fields
    const [formData, setFormData] = useState(data);

    // Update local state when prop data changes
    useEffect(() => {
        setFormData(data);
    }, [data]);

    const updateField = (field: string, value: any) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        onChange(updated);
    };

    const updateVenueField = (field: keyof VenueDto, value: any) => {
        const currentVenue = formData.venue || {
            name: '',
            address: { street: '', city: '', state: '', country: 'Nepal', postalCode: '' },
            capacity: 0
        };

        // Handle nested address updates
        if (field === 'address') {
            updateField('venue', { ...currentVenue, address: { ...currentVenue.address, ...value } });
        } else {
            updateField('venue', { ...currentVenue, [field]: value });
        }
    };

    const updateAddressField = (field: string, value: string) => {
        const currentVenue = formData.venue || {
            name: '',
            address: { street: '', city: '', state: '', country: 'Nepal', postalCode: '' },
            capacity: 0
        };
        const currentAddress = currentVenue.address || { street: '', city: '', state: '', country: 'Nepal', postalCode: '' };

        updateField('venue', {
            ...currentVenue,
            address: { ...currentAddress, [field]: value }
        });
    };

    return (
        <div className="space-y-8">
            {/* Date & Time Section */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="text-blue-600" size={20} />
                    Date & Time
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Start Date & Time *
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.startDateTime || ''}
                            onChange={(e) => updateField('startDateTime', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            End Date & Time *
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.endDateTime || ''}
                            onChange={(e) => updateField('endDateTime', e.target.value)}
                            min={formData.startDateTime}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Venue Section (Offline/Hybrid) */}
            {(formData.type === 'OFFLINE' || formData.type === 'HYBRID') && (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="text-purple-600" size={20} />
                        Venue Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Venue Name *
                            </label>
                            <input
                                type="text"
                                value={formData.venue?.name || ''}
                                onChange={(e) => updateVenueField('name', e.target.value)}
                                placeholder="e.g. Kathmandu Convention Center"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Capacity
                            </label>
                            <input
                                type="number"
                                value={formData.venue?.capacity || ''}
                                onChange={(e) => updateVenueField('capacity', parseInt(e.target.value))}
                                placeholder="e.g. 500"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <Map size={16} />
                        Address
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                value={formData.venue?.address?.street || ''}
                                onChange={(e) => updateAddressField('street', e.target.value)}
                                placeholder="Street Address"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                value={formData.venue?.address?.city || ''}
                                onChange={(e) => updateAddressField('city', e.target.value)}
                                placeholder="City"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                value={formData.venue?.address?.state || ''}
                                onChange={(e) => updateAddressField('state', e.target.value)}
                                placeholder="State / Province"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                value={formData.venue?.address?.country || 'Nepal'}
                                onChange={(e) => updateAddressField('country', e.target.value)}
                                placeholder="Country"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                value={formData.venue?.address?.postalCode || ''}
                                onChange={(e) => updateAddressField('postalCode', e.target.value)}
                                placeholder="Postal Code"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Online Link (Online/Hybrid) */}
            {(formData.type === 'ONLINE' || formData.type === 'HYBRID') && (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Globe className="text-purple-600" size={20} />
                        Online Access
                    </h3>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Meeting / Stream Link *
                        </label>
                        <input
                            type="url"
                            value={formData.onlineLink || ''}
                            onChange={(e) => updateField('onlineLink', e.target.value)}
                            placeholder="https://zoom.us/j/..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            This link will be shared with ticket holders.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VenueScheduleForm;
