import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import apiClient from '../../services/api.client';

interface EventCloneButtonProps {
    eventId: number;
    eventName: string;
    onCloneSuccess?: (newEventId: number) => void;
}

export const EventCloneButton: React.FC<EventCloneButtonProps> = ({ eventId, eventName, onCloneSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleClone = async () => {
        setLoading(true);
        try {
            const response = await apiClient.post(`/api/bff/v1/events/${eventId}/clone`);
            const clonedEvent = response.data.data || response.data;

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setShowConfirm(false);
                if (onCloneSuccess && clonedEvent.id) {
                    onCloneSuccess(clonedEvent.id);
                }
            }, 2000);
        } catch (error) {
            console.error('Error cloning event:', error);
            alert('Failed to clone event');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
                <Check size={16} />
                <span className="text-sm font-medium">Event Cloned!</span>
            </div>
        );
    }

    if (showConfirm) {
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Clone "<strong>{eventName}</strong>"?
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    This will create a draft copy with all ticket types. Dates will be reset.
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={handleClone}
                        disabled={loading}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
                    >
                        {loading ? 'Cloning...' : 'Confirm Clone'}
                    </button>
                    <button
                        onClick={() => setShowConfirm(false)}
                        disabled={loading}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
        >
            <Copy size={16} />
            Clone Event
        </button>
    );
};

export default EventCloneButton;
