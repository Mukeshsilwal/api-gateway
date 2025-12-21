import React from 'react';
import { EventBasicInfoDto, EventTicketingDto, VenueDto, EventType } from '../../types/event-dto';
import { Calendar, MapPin, Globe, Ticket, Clock, CheckCircle } from 'lucide-react';

interface ReviewEventProps {
    data: EventBasicInfoDto & EventTicketingDto & { venue?: VenueDto, onlineLink?: string };
}

/**
 * Event Review Component
 * Step 4 of event creation wizard (ReadOnly View)
 */
const ReviewEvent: React.FC<ReviewEventProps> = ({ data }) => {
    return (
        <div className="space-y-8">
            {/* Header / Basic Info Summary */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="h-48 w-full bg-gray-100 relative">
                    {data.coverImage ? (
                        <img
                            src={data.coverImage}
                            alt={data.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            No Cover Image
                        </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-gray-800 shadow-sm">
                        {data.category}
                    </div>
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-bold text-white shadow-sm ${data.type === 'ONLINE' ? 'bg-purple-500' : 'bg-orange-500'
                        }`}>
                        {data.type}
                    </div>
                </div>

                <div className="p-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{data.name}</h2>
                    <p className="text-gray-600 mb-4">{data.shortDescription || data.description?.substring(0, 150) + '...'}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {data.tags?.map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Schedule & Location */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-blue-600" />
                        When & Where
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Date & Time</p>
                            <p className="text-gray-900 font-medium">
                                Start: {new Date(data.startDateTime || '').toLocaleString()}
                            </p>
                            <p className="text-gray-900 font-medium">
                                End: {new Date(data.endDateTime || '').toLocaleString()}
                            </p>
                        </div>

                        {data.type !== 'ONLINE' && data.venue && (
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Venue</p>
                                <div className="flex items-start gap-2 text-gray-800">
                                    <MapPin size={18} className="mt-0.5 text-orange-500 shrink-0" />
                                    <div>
                                        <p className="font-bold">{data.venue.name}</p>
                                        <p>{data.venue.address?.street}, {data.venue.address?.city}</p>
                                        <p>{data.venue.address?.country}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {data.type !== 'OFFLINE' && data.onlineLink && (
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Online Access</p>
                                <div className="flex items-center gap-2 text-blue-600 break-all">
                                    <Globe size={18} className="shrink-0" />
                                    <a href={data.onlineLink} target="_blank" rel="noreferrer" className="underline hover:text-blue-800">
                                        {data.onlineLink}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Ticketing Summary */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Ticket size={20} className="text-green-600" />
                        Ticketing
                    </h3>

                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Sales Start:</span>
                            <span className="font-medium">{new Date(data.salesStartDate || '').toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Sales End:</span>
                            <span className="font-medium">{new Date(data.salesEndDate || '').toLocaleDateString()}</span>
                        </div>

                        <div className="border-t border-gray-200 my-4 pt-4">
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Ticket Types</p>
                            {data.ticketTypes && data.ticketTypes.length > 0 ? (
                                <div className="space-y-2">
                                    {data.ticketTypes.map((ticket, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                            <div>
                                                <p className="font-bold text-gray-900">{ticket.name}</p>
                                                <p className="text-xs text-gray-500">{ticket.quantity} available</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">NPR {ticket.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No tickets added</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
                <div>
                    <h4 className="font-bold text-blue-900">Ready to Submit?</h4>
                    <p className="text-sm text-blue-700">
                        Your event will be submitted for admin approval. Please double-check all details before proceeding.
                        You can save as a draft if you're not ready yet.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReviewEvent;
