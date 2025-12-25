import React, { useState, useEffect } from 'react';
import { AlertCircle, Shield, MapPin, PhoneCall, Loader2, CheckCircle2 } from 'lucide-react';
import safetyService from '../../services/safetyService';
import authService from '../../services/authService';

const SafetyWidget: React.FC = () => {
    const [isSOSTriggering, setIsSOSTriggering] = useState(false);
    const [activeSOS, setActiveSOS] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Check for active SOS on mount if authenticated
        if (authService.isAuthenticated()) {
            fetchActiveSOS();
        }

        // Start watching location if SOS is active
        let watchId: number;
        if (activeSOS) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    safetyService.updateSOSHeartbeat(activeSOS.sosId, {
                        latitude: newLoc.lat,
                        longitude: newLoc.lng
                    }).catch(console.error);
                },
                (err) => console.error("Location error", err),
                { enableHighAccuracy: true }
            );
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [activeSOS?.sosId]);

    const fetchActiveSOS = async () => {
        try {
            const active = await safetyService.getActiveSOS();
            if (active && active.length > 0) {
                setActiveSOS(active[0]);
            }
        } catch (error) {
            console.error("Failed to fetch SOS status", error);
        }
    };

    const handleTriggerSOS = async () => {
        setIsSOSTriggering(true);
        try {
            // Get current location
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const sos = await safetyService.triggerSOS({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                message: "Emergency SOS triggered from mobile widget"
            });

            setActiveSOS(sos);
            setShowModal(true);
        } catch (error) {
            console.error("SOS Trigger failed", error);
            alert("Failed to trigger SOS. Please call emergency services directly.");
        } finally {
            setIsSOSTriggering(false);
        }
    };

    return (
        <>
            {/* Floating SOS Button */}
            <div className="fixed bottom-24 right-6 z-50">
                <button
                    onClick={() => setShowModal(true)}
                    className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${activeSOS ? 'bg-red-600 animate-pulse' : 'bg-red-500 hover:bg-red-600'
                        } text-white`}
                    title="SOS Safety Center"
                >
                    <Shield className="w-8 h-8" />
                </button>
            </div>

            {/* Safety Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 bg-red-600 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Shield className="w-6 h-6" />
                                <h2 className="text-xl font-bold uppercase tracking-wider">Safety Center</h2>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">
                                <Shield className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {activeSOS ? (
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                                        <AlertCircle className="w-10 h-10 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">SOS ACTIVE</h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Help is on the way. Your location is being tracked in real-time.
                                        </p>
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-red-500" />
                                        <div className="text-left text-sm">
                                            <p className="font-semibold dark:text-white">Current Location Shared</p>
                                            <p className="text-xs text-gray-500">Updating every 5 seconds</p>
                                        </div>
                                    </div>
                                    <button className="w-full bg-gray-200 dark:bg-gray-700 py-3 rounded-xl font-bold text-gray-700 dark:text-white hover:bg-gray-300 transition-colors">
                                        I'M SAFE NOW (End SOS)
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        <p className="text-gray-600 dark:text-gray-400 text-center">
                                            Emergency? Press and hold the button below to alert our responders and your emergency contacts.
                                        </p>
                                        <button
                                            onMouseDown={() => { }} // Could implement hold logic
                                            onClick={handleTriggerSOS}
                                            disabled={isSOSTriggering}
                                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-6 rounded-2xl font-black text-2xl shadow-xl shadow-red-200 dark:shadow-none transition-all flex items-center justify-center gap-3 active:scale-95"
                                        >
                                            {isSOSTriggering ? (
                                                <Loader2 className="w-8 h-8 animate-spin" />
                                            ) : (
                                                <>
                                                    <AlertCircle className="w-8 h-8" />
                                                    TRIGGER SOS
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button className="flex flex-col items-center gap-2 p-4 border dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <PhoneCall className="w-6 h-6 text-green-500" />
                                            <span className="text-xs font-semibold dark:text-gray-300">Call Guide</span>
                                        </button>
                                        <button className="flex flex-col items-center gap-2 p-4 border dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <CheckCircle2 className="w-6 h-6 text-blue-500" />
                                            <span className="text-xs font-semibold dark:text-gray-300">Safety Check</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SafetyWidget;
