import React from 'react';
import { Clock, MapPin, MoreVertical } from 'lucide-react';

// Using a simplified local interface for now, matching backend Checkpoint
export interface Checkpoint {
    checkpointId?: number;
    locationName: string;
    scheduledTime: string; // ISO date string
    checkpointType: 'DEPARTURE' | 'TRANSIT' | 'ARRIVAL' | 'HOTEL_CHECKIN' | 'HOTEL_CHECKOUT' | 'ACTIVITY' | 'RETURN';
    notes?: string;
}

interface TimelineBuilderProps {
    checkpoints: Checkpoint[];
    onAddCheckpoint: () => void;
    onRemoveCheckpoint: (index: number) => void;
}

const TimelineBuilder: React.FC<TimelineBuilderProps> = ({ checkpoints, onAddCheckpoint, onRemoveCheckpoint }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trip Itinerary</h3>
                <button
                    onClick={onAddCheckpoint}
                    className="text-sm text-orange-500 font-semibold hover:text-orange-600 border border-orange-500 rounded px-3 py-1 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
                >
                    + Add Stop
                </button>
            </div>

            <div className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700 space-y-8">
                {checkpoints.length === 0 ? (
                    <div className="pl-4 text-gray-500 italic">No itinerary items yet. Start adding stops!</div>
                ) : (
                    checkpoints.map((point, index) => (
                        <div key={index} className="relative group">
                            {/* Dot */}
                            <div className="absolute -left-[31px] bg-white dark:bg-gray-800 border-2 border-orange-500 w-4 h-4 rounded-full mt-1.5"></div>

                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-1 uppercase tracking-wider">
                                            {point.checkpointType.replace('_', ' ')}
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            {point.locationName}
                                        </h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(point.scheduledTime).toLocaleString([], {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onRemoveCheckpoint(index)}
                                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                                {point.notes && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                        {point.notes}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TimelineBuilder;
