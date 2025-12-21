import React, { useState } from 'react';
import { EventTicketingDto, TicketTypeDto } from '../../types/event-dto';
import { Plus, Trash2, Ticket, Calendar, Users } from 'lucide-react';

interface TicketingFormProps {
    data: Partial<EventTicketingDto>;
    onChange: (data: Partial<EventTicketingDto>) => void;
}

/**
 * Event Ticketing Form
 * Step 2 of event creation wizard
 */
const TicketingForm: React.FC<TicketingFormProps> = ({ data, onChange }) => {
    const [formData, setFormData] = useState<Partial<EventTicketingDto>>(data);

    const updateField = (field: keyof EventTicketingDto, value: any) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        onChange(updated);
    };

    const addTicketType = () => {
        const newTicket: TicketTypeDto = {
            name: '',
            price: 0,
            quantity: 0,
            sortOrder: (formData.ticketTypes?.length || 0) + 1,
            isActive: true,
        };
        updateField('ticketTypes', [...(formData.ticketTypes || []), newTicket]);
    };

    const updateTicketType = (index: number, field: keyof TicketTypeDto, value: any) => {
        const tickets = [...(formData.ticketTypes || [])];
        tickets[index] = { ...tickets[index], [field]: value };
        updateField('ticketTypes', tickets);
    };

    const removeTicketType = (index: number) => {
        const tickets = formData.ticketTypes?.filter((_: TicketTypeDto, i: number) => i !== index) || [];
        updateField('ticketTypes', tickets);
    };

    const ticketColors = [
        'bg-blue-500', 'bg-purple-500', 'bg-green-500',
        'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'
    ];

    return (
        <div className="space-y-6">
            {/* Sales Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar size={16} className="inline mr-1" />
                        Sales Start Date *
                    </label>
                    <input
                        type="datetime-local"
                        value={formData.salesStartDate || ''}
                        onChange={(e) => updateField('salesStartDate', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar size={16} className="inline mr-1" />
                        Sales End Date *
                    </label>
                    <input
                        type="datetime-local"
                        value={formData.salesEndDate || ''}
                        onChange={(e) => updateField('salesEndDate', e.target.value)}
                        min={formData.salesStartDate}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>
            </div>

            {/* Ticket Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Users size={16} className="inline mr-1" />
                        Min Tickets Per Order
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={formData.minTicketsPerOrder || 1}
                        onChange={(e) => updateField('minTicketsPerOrder', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Users size={16} className="inline mr-1" />
                        Max Tickets Per Order
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={formData.maxTicketsPerOrder || 10}
                        onChange={(e) => updateField('maxTicketsPerOrder', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.allowWaitlist || false}
                        onChange={(e) => updateField('allowWaitlist', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Allow waitlist when sold out</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.requireApproval || false}
                        onChange={(e) => updateField('requireApproval', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Require approval for bookings</span>
                </label>
            </div>

            {/* Ticket Types */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Ticket size={20} />
                        Ticket Types
                    </h3>
                    <button
                        type="button"
                        onClick={addTicketType}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <Plus size={18} />
                        Add Ticket Type
                    </button>
                </div>

                {(!formData.ticketTypes || formData.ticketTypes.length === 0) && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 mb-3">No ticket types added yet</p>
                        <button
                            type="button"
                            onClick={addTicketType}
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                            Add your first ticket type
                        </button>
                    </div>
                )}

                <div className="space-y-4">
                    {formData.ticketTypes?.map((ticket, index) => (
                        <div key={index} className="p-4 border-2 border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full ${ticketColors[index % ticketColors.length]}`}></div>
                                    <span className="font-semibold text-gray-900">Ticket Type {index + 1}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeTicketType(index)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ticket Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={ticket.name}
                                        onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                                        placeholder="e.g., General Admission, VIP"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={ticket.description || ''}
                                        onChange={(e) => updateTicketType(index, 'description', e.target.value)}
                                        placeholder="Brief description"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price (NPR) *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={ticket.price}
                                        onChange={(e) => updateTicketType(index, 'price', parseFloat(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={ticket.quantity}
                                        onChange={(e) => updateTicketType(index, 'quantity', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Available From
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={ticket.availableFrom || ''}
                                        onChange={(e) => updateTicketType(index, 'availableFrom', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Available To
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={ticket.availableTo || ''}
                                        onChange={(e) => updateTicketType(index, 'availableTo', e.target.value)}
                                        min={ticket.availableFrom}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="mt-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={ticket.isActive}
                                        onChange={(e) => updateTicketType(index, 'isActive', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary */}
            {formData.ticketTypes && formData.ticketTypes.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-blue-700">Total Ticket Types:</span>
                            <span className="font-semibold ml-2">{formData.ticketTypes.length}</span>
                        </div>
                        <div>
                            <span className="text-blue-700">Total Capacity:</span>
                            <span className="font-semibold ml-2">
                                {formData.ticketTypes.reduce((sum, t) => sum + (t.quantity || 0), 0)}
                            </span>
                        </div>
                        <div>
                            <span className="text-blue-700">Price Range:</span>
                            <span className="font-semibold ml-2">
                                NPR {Math.min(...formData.ticketTypes.map(t => t.price))} - {Math.max(...formData.ticketTypes.map(t => t.price))}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketingForm;
