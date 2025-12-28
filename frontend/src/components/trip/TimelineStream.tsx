import React from 'react';
import { Clock } from 'lucide-react';

interface TimelineStreamProps {
    journeys: any[];
    checkpoints: any[];
    timelineEvents: any[];
    onStatusChange?: (checkpoint: any, newStatus: string) => void;
}

const TimelineStream: React.FC<TimelineStreamProps> = ({ journeys, checkpoints, timelineEvents, onStatusChange }) => {
    // Flatten everything into a unified event list
    const journeyEvents = journeys.flatMap((j: any) => {
        const eventsList = [];
        if (j.bookingReference?.departureTime) {
            eventsList.push({
                id: `${j.journeyId}-dep`,
                originalId: j.journeyId, // For future use if we want to update journey status too
                time: j.bookingReference.departureTime,
                type: 'DEPARTURE',
                title: `Depart from ${j.bookingReference.source}`,
                description: `Bus ${j.bookingReference.busName || ''}`,
                status: 'COMPLETED',
                isEditable: false
            });
        }
        if (j.bookingReference?.arrivalTime) {
            eventsList.push({
                id: `${j.journeyId}-arr`,
                originalId: j.journeyId,
                time: j.bookingReference.arrivalTime,
                type: 'ARRIVAL',
                title: `Arrive at ${j.bookingReference.destination}`,
                description: 'End of journey',
                status: 'PENDING',
                isEditable: false
            });
        }
        return eventsList;
    });

    const checkpointEvents = checkpoints.map((cp: any) => ({
        id: `cp-${cp.checkpointId}`,
        originalId: cp.checkpointId,
        journeyId: cp.journeyId,
        data: cp,
        time: cp.scheduledTime,
        type: cp.checkpointType,
        title: cp.locationName,
        description: cp.notes || formatCheckpointType(cp.checkpointType),
        status: cp.status,
        isEditable: true
    }));

    const genericEvents = timelineEvents.map((evt: any) => ({
        id: `evt-${evt.eventId}`,
        time: evt.createdAt, // Fallback to createdAt if no scheduled time
        type: evt.type || 'EVENT',
        title: evt.description || 'Timeline Event',
        description: formatEventType(evt.type),
        status: 'COMPLETED',
        isEditable: false
    }));

    const allEvents = [...journeyEvents, ...checkpointEvents, ...genericEvents]
        .sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());

    const handleStatusClick = (event: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!event.isEditable || !onStatusChange) return;

        const nextStatus = getNextStatus(event.status);
        onStatusChange(event.data, nextStatus);
    };

    const getNextStatus = (current: string) => {
        if (current === 'PENDING') return 'IN_PROGRESS';
        if (current === 'IN_PROGRESS') return 'COMPLETED';
        return 'PENDING'; // Cycle back? Or stay completed? cycling back is good for errors
    };

    if (allEvents.length === 0) {
        return (
            <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-500">No timeline events generated yet</h3>
                <p className="text-gray-400 mt-2">Add bookings or checkpoints to see your timeline.</p>
            </div>
        );
    }

    return (
        <div className="relative pl-8 space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
            {/* Vertical Line */}
            <div className="absolute left-[54px] top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

            {allEvents.map((event: any) => {
                return (
                    <div key={event.id} className="relative flex gap-6">
                        {/* Time Bubble */}
                        <div className="w-24 text-right pt-2 shrink-0">
                            <p className="font-bold text-gray-900 dark:text-white">
                                {new Date(event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-xs text-gray-500">
                                {new Date(event.time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </p>
                        </div>

                        {/* Node */}
                        <div className={`relative z-10 w-4 h-4 rounded-full mt-3 border-2 shrink-0 ${getEventColor(event.type)}`}></div>

                        {/* Card */}
                        <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-shadow">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-900 dark:text-white">{event.title}</h4>
                                <button
                                    onClick={(e) => handleStatusClick(event, e)}
                                    disabled={!event.isEditable}
                                    className={`text-xs px-2 py-0.5 rounded-full transition-all ${event.isEditable ? 'cursor-pointer hover:ring-2 ring-offset-1 ring-orange-200' : 'cursor-default opacity-80'
                                        } ${getStatusColor(event.status)}`}
                                    title={event.isEditable ? `Current: ${event.status}. Click to change.` : ''}
                                >
                                    {event.status || 'PENDING'}
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Helper functions (kept same as before, just ensuring they are included)
const formatCheckpointType = (type: string) => {
    return type ? type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : 'Checkpoint';
};

const formatEventType = (type: string) => {
    return type ? type.replace(/\./g, ' ').replace(/_/g, ' ').toLowerCase() : 'Event';
};

const getEventColor = (type: string) => {
    if (type === 'DEPARTURE' || type === 'HOTEL_CHECKOUT') return 'bg-blue-500 border-white dark:border-gray-800';
    if (type === 'ARRIVAL' || type === 'HOTEL_CHECKIN') return 'bg-green-500 border-white dark:border-gray-800';
    if (type === 'TRANSIT') return 'bg-yellow-500 border-white dark:border-gray-800';
    if (type === 'ACTIVITY') return 'bg-purple-500 border-white dark:border-gray-800';
    return 'bg-gray-400 border-white dark:border-gray-800';
};

const getStatusColor = (status: string) => {
    if (status === 'COMPLETED' || status === 'REACHED') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    if (status === 'IN_PROGRESS') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    if (status === 'SKIPPED' || status === 'CANCELLED') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
};

export default TimelineStream;


