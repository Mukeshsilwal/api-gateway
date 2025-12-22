import React, { useState, useEffect } from 'react';
import { EventBasicInfoDto, EventCategory, EventType } from '../../types/event-dto';
import { Tag, Type, Globe } from 'lucide-react';
import ImageUpload from '../common/ImageUpload';

interface BasicInfoFormProps {
    data: Partial<EventBasicInfoDto>;
    onChange: (data: Partial<EventBasicInfoDto>) => void;
}

/**
 * Event Basic Info Form
 * Step 1 of event creation wizard
 */
const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ data, onChange }) => {
    const [formData, setFormData] = useState<any>(data);

    // Set defaults for language and timezone if not provided
    useEffect(() => {
        const needsDefaults = !formData.language || !formData.timezone;
        if (needsDefaults) {
            const updated = {
                ...formData,
                language: formData.language || 'English',
                timezone: formData.timezone || 'Asia/Kathmandu'
            };
            setFormData(updated);
            onChange(updated);
        }
    }, []);

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
            <div className="md:col-span-2">
                <ImageUpload
                    label="Cover Image *"
                    value={formData.coverImage}
                    onChange={(file) => updateField('coverImage', file)}
                    description="Upload a high-quality cover image (recommended 1200x600px)"
                />
            </div>
        </div>
    );
};

export default BasicInfoForm;
