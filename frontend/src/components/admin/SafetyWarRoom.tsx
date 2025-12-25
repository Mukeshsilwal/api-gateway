import React, { useEffect, useState } from 'react';
import { getSystemActiveSOS } from '../../services/safetyService';
import { AlertCircle, MapPin, User, Clock, Shield, Phone, ExternalLink } from 'lucide-react';
import Card from '../ui/Card';

const SafetyWarRoom: React.FC = () => {
    const [activeSOS, setActiveSOS] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSOS = async () => {
            try {
                const data = await getSystemActiveSOS();
                setActiveSOS(data);
            } catch (error) {
                console.error('Failed to fetch system SOS', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSOS();
        const interval = setInterval(fetchSOS, 10000); // Polling every 10s
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Shield className="text-red-600" />
                        Safety War Room
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Live emergency monitoring across Nepal</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold flex items-center gap-2">
                        <AlertCircle size={18} />
                        {activeSOS.length} Active Emergencies
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Emergencies List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Emergency Feed</h2>
                    {activeSOS.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                            <Shield className="mx-auto text-green-500 mb-2 opacity-20" size={48} />
                            <p className="text-gray-500">No active SOS alerts. All systems normal.</p>
                        </div>
                    ) : (
                        activeSOS.map((sos) => (
                            <Card key={sos.sosId} className="border-l-4 border-l-red-600 hover:shadow-md transition-shadow">
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">User #{sos.userId}</h3>
                                                <p className="text-xs text-gray-500">Trip #{sos.tripId}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-bold animate-pulse">
                                            LIVE
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <MapPin size={14} className="text-red-500" />
                                            <span>{sos.latitude}, {sos.longitude}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Clock size={14} />
                                            <span>Last Heartbeat: {new Date(sos.lastHeartbeat).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-sm italic">
                                            "{sos.message || 'No message provided'}"
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-700">
                                            <Phone size={14} /> Contact User
                                        </button>
                                        <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <ExternalLink size={14} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {/* Tracking Map placeholder or Region Health */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Region Risk Assessment</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="aspect-video bg-gray-100 dark:bg-gray-900 relative flex items-center justify-center">
                            <MapPin className="text-red-500 absolute animate-bounce" style={{ top: '30%', left: '45%' }} size={32} />
                            <MapPin className="text-orange-500 absolute" style={{ top: '60%', left: '25%' }} size={24} />
                            <div className="text-center opacity-30">
                                <Shield size={64} className="mx-auto mb-2" />
                                <p className="font-bold">Live Risk Monitoring Map</p>
                                <p className="text-xs">GPS Overlay Active</p>
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            {[
                                { region: 'Solu-Khumbu', risk: 'HIGH', agents: 12, reason: 'Rapid weather change' },
                                { region: 'Annapurna Circuit', risk: 'MEDIUM', agents: 45, reason: 'High traffic' },
                                { region: 'Kathmandu Valley', risk: 'LOW', agents: 128, reason: 'Nominal' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <div>
                                        <h4 className="font-bold text-sm">{item.region}</h4>
                                        <p className="text-xs text-gray-500">{item.reason}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.risk === 'HIGH' ? 'bg-red-100 text-red-700' :
                                                item.risk === 'MEDIUM' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-green-100 text-green-700'
                                            }`}>
                                            {item.risk}
                                        </span>
                                        <p className="text-[10px] text-gray-400 mt-1">{item.agents} Active Trips</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SafetyWarRoom;
