import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import apiService from '../../services/api.service';

interface QRScannerProps {
    eventId: number;
    onSuccess?: (result: CheckInResult) => void;
}

interface CheckInResult {
    success: boolean;
    ticketId: string;
    attendeeName: string;
    ticketType: string;
    eventName: string;
    alreadyCheckedIn: boolean;
    checkInTime: string;
    message: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({ eventId, onSuccess }) => {
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<CheckInResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (scanning) {
            const scanner = new Html5QrcodeScanner(
                'qr-reader',
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                false
            );

            scanner.render(onScanSuccess, onScanError);

            return () => {
                scanner.clear().catch(console.error);
            };
        }
    }, [scanning]);

    const onScanSuccess = async (decodedText: string) => {
        console.log('QR Code scanned:', decodedText);
        setLoading(true);
        setError(null);

        try {
            const response = await apiService.post('/api/bff/v1/check-in', {
                qrCode: decodedText,
                eventId: eventId,
                checkedInBy: 'Admin', // TODO: Get from auth context
                location: 'Main Entrance'
            });

            const checkInData = response.data.data || response.data;
            setResult(checkInData);

            if (onSuccess && checkInData.success) {
                onSuccess(checkInData);
            }

            // Auto-reset after 3 seconds
            setTimeout(() => {
                setResult(null);
            }, 3000);
        } catch (err: any) {
            console.error('Check-in error:', err);
            setError(err.response?.data?.message || 'Failed to process check-in');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const onScanError = (error: any) => {
        // Ignore scan errors (happens frequently when no QR in view)
        if (error?.toString().includes('NotFoundException')) {
            return;
        }
        console.warn('QR Scan error:', error);
    };

    const startScanning = () => {
        setScanning(true);
        setResult(null);
        setError(null);
    };

    const stopScanning = () => {
        setScanning(false);
    };

    return (
        <div className="space-y-4">
            {/* Scanner Controls */}
            <div className="flex gap-3">
                {!scanning ? (
                    <button
                        onClick={startScanning}
                        className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        Start Scanner
                    </button>
                ) : (
                    <button
                        onClick={stopScanning}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                        Stop Scanner
                    </button>
                )}
            </div>

            {/* Scanner Container */}
            {scanning && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div id="qr-reader" className="w-full"></div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center gap-3">
                    <Loader className="animate-spin text-blue-600" size={24} />
                    <span className="text-blue-800 dark:text-blue-300">Processing check-in...</span>
                </div>
            )}

            {/* Success Result */}
            {result && result.success && !result.alreadyCheckedIn && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 animate-in fade-in duration-300">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                            <CheckCircle className="text-green-600 dark:text-green-300" size={32} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">
                                ✓ Check-In Successful!
                            </h3>
                            <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
                                <p><strong>Name:</strong> {result.attendeeName}</p>
                                <p><strong>Ticket:</strong> {result.ticketType}</p>
                                <p><strong>Event:</strong> {result.eventName}</p>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                    Checked in at {new Date(result.checkInTime).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Already Checked In */}
            {result && result.alreadyCheckedIn && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 animate-in fade-in duration-300">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-full">
                            <AlertCircle className="text-yellow-600 dark:text-yellow-300" size={32} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-100 mb-2">
                                Already Checked In
                            </h3>
                            <div className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                                <p><strong>Name:</strong> {result.attendeeName}</p>
                                <p><strong>Ticket:</strong> {result.ticketType}</p>
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                                    Previously checked in at {new Date(result.checkInTime).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 animate-in fade-in duration-300">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-red-100 dark:bg-red-800 rounded-full">
                            <XCircle className="text-red-600 dark:text-red-300" size={32} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">
                                Check-In Failed
                            </h3>
                            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            {scanning && !loading && !result && !error && (
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Instructions:</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                        <li>Position the QR code within the scanner box</li>
                        <li>Hold steady until the code is detected</li>
                        <li>Result will appear automatically after scanning</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default QRScanner;
