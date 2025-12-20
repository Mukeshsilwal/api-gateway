import React, { useState } from 'react';
import { EventBasicInfoDto, EventCategory, EventType } from '../../types/event-dto';
import { Calendar, MapPin, Tag, Type, Globe } from 'lucide-react';

interface BasicInfoFormProps {
    data: Partial<EventBasicInfoDto>;
    onChange: (data: Partial<EventBasicInfoDto>) => void;
}

/**
 * Event Basic Info Form
 * Step 1 of event creation wizard
 */
const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ data, onChange }) => {
    const [formData, setFormData] = useState<Partial<EventBasicInfoDto>>(data);

    const updateField = (field: keyof EventBasicInfoDto, value: any) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        onChange(updated);
    };

    const categories: EventCategory[] = [
        'MUSIC', 'SPORTS', 'CONFERENCE', 'WORKSHOP',
        'FESTIVAL', 'EXHIBITION', 'THEATER', 'COMEDY', 'NETWORKING', 'OTHER'
    ];

    const types: EventType[] = ['ONLINE', 'OFFLINE', 'HYBRID'];

    return (
        <div className="space-y-6">
            {/* Event Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Type size={16} className="inline mr-1" />
                    Event Name *
                </label>
                <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Enter your event name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                />
            </div>

            {/* Category & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Tag size={16} className="inline mr-1" />
                        Category *
                    </label>
                    <select
                        value={formData.category || ''}
                        onChange={(e) => updateField('category', e.target.value as EventCategory)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Globe size={16} className="inline mr-1" />
                        Event Type *
                    </label>
                    <select
                        value={formData.type || ''}
                        onChange={(e) => updateField('type', e.target.value as EventType)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    >
                        <option value="">Select type</option>
                        {types.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar size={16} className="inline mr-1" />
                        Start Date & Time *
                    </label>
                    <input
                        type="datetime-local"
                        value={formData.startDateTime || ''}
                        onChange={(e) => updateField('startDateTime', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar size={16} className="inline mr-1" />
                        End Date & Time *
                    </label>
                    <input
                        type="datetime-local"
                        value={formData.endDateTime || ''}
                        onChange={(e) => updateField('endDateTime', e.target.value)}
                        min={formData.startDateTime}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>
            </div>

            {/* Venue (for offline/hybrid) */}
            {(formData.type === 'OFFLINE' || formData.type === 'HYBRID') && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin size={16} className="inline mr-1" />
                        Venue Name *
                    </label>
                    <input
                        type="text"
                        value={formData.venue?.name || ''}
                        onChange={(e) => updateField('venue', { ...formData.venue, name: e.target.value })}
                        placeholder="Enter venue name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>
            )}

            {/* Online Link (for online/hybrid) */}
            {(formData.type === 'ONLINE' || formData.type === 'HYBRID') && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Online Event Link *
                    </label>
                    <input
                        type="url"
                        value={formData.onlineLink || ''}
                        onChange={(e) => updateField('onlineLink', e.target.value)}
                        placeholder="https://zoom.us/j/..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>
            )}

            {/* Short Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                </label>
                <input
                    type="text"
                    value={formData.shortDescription || ''}
                    onChange={(e) => updateField('shortDescription', e.target.value)}
                    placeholder="Brief one-line description"
                    maxLength={150}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="text-xs text-gray-500 mt-1">
                    {(formData.shortDescription || '').length}/150 characters
                </div>
            </div>

            {/* Full Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description *
                </label>
                <textarea
                    value={formData.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Describe your event in detail..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                />
            </div>

            {/* Tags */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                </label>
                <input
                    type="text"
                    value={formData.tags?.join(', ') || ''}
                    onChange={(e) => updateField('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                    placeholder="music, live, concert, rock"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Cover Image */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image URL *
                </label>
                <input
                    type="url"
                    value={formData.coverImage || ''}
                    onChange={(e) => updateField('coverImage', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                />
                {formData.coverImage && (
                    <div className="mt-3">
                        <img
                            src={formData.coverImage}
                            alt="Cover preview"
                            className="w-full h-48 object-cover rounded-lg"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL';
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default BasicInfoForm;
