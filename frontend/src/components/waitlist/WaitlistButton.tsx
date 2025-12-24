import { useState } from 'react';
import { Mail, Bell, CheckCircle } from 'lucide-react';
import apiClient from '../../services/api.client';

interface WaitlistButtonProps {
    eventId: number;
    eventName: string;
}

export const WaitlistButton: React.FC<WaitlistButtonProps> = ({ eventId, eventName }) => {
    const [joined, setJoined] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [showForm, setShowForm] = useState(false);

    const handleJoin = async () => {
        if (!email.trim()) return;

        setLoading(true);
        try {
            await apiClient.post(`/api/bff/v1/events/${eventId}/waitlist`, { email });
            setJoined(true);
            setShowForm(false);
        } catch (error) {
            console.error('Error joining waitlist:', error);
        } finally {
            setLoading(false);
        }
    };

    if (joined) {
        return (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={24} />
                    <div>
                        <p className="font-semibold text-green-900 dark:text-green-100">You're on the waitlist!</p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                            We'll notify you when tickets become available.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (showForm) {
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Bell size={20} />
                    Join Waitlist
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Enter your email to be notified when tickets become available.
                </p>
                <div className="flex gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                        onClick={handleJoin}
                        disabled={loading || !email.trim()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Joining...' : 'Join'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowForm(true)}
            className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center gap-2"
        >
            <Bell size={20} />
            Join Waitlist
        </button>
    );
};

export default WaitlistButton;
