import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

const PaymentFailure = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [errorMessage, setErrorMessage] = useState('Your payment could not be processed.');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        let dataParam = params.get('data');
        const msgParam = params.get('message');

        // 1. Handle Malformed URL for failure case too
        if (!dataParam) {
            const searchString = location.search;
            if (searchString.includes('?data=')) {
                const parts = searchString.split('?data=');
                if (parts.length > 1) {
                    dataParam = parts[1].split('&')[0];
                }
            }
        }

        // 2. Decode Data to get error message
        if (dataParam) {
            try {
                const decodedString = atob(dataParam);
                const jsonData = JSON.parse(decodedString);

                // eSewa failure structure might vary, but capturing common fields
                if (jsonData.message) {
                    setErrorMessage(jsonData.message);
                } else if (jsonData.error_message) {
                    setErrorMessage(jsonData.error_message);
                } else if (jsonData.status) {
                    setErrorMessage(`Payment status: ${jsonData.status}`);
                }

                console.log('❌ Decoded Failure Data:', jsonData);
            } catch (e) {
                console.error('Failed to decode failure data:', e);
            }
        } else if (msgParam) {
            setErrorMessage(msgParam);
        }

    }, [location.search]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="max-w-md w-full text-center border-red-100 shadow-xl">
                <div className="py-8 px-4">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        We couldn't complete your transaction. <br />
                        <span className="text-red-600 text-sm font-medium bg-red-50 px-2 py-1 rounded mt-2 inline-block break-words max-w-full">
                            {errorMessage}
                        </span>
                    </p>

                    <div className="space-y-3">
                        <Button
                            onClick={() => navigate(-1)}
                            className="w-full gap-2 shadow-lg shadow-red-500/20 bg-red-600 hover:bg-red-700 text-white"
                        >
                            <RefreshCw size={18} /> Try Again
                        </Button>
                        <Button
                            onClick={() => navigate('/')}
                            variant="ghost"
                            className="w-full gap-2"
                        >
                            <Home size={18} /> Return to Home
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PaymentFailure;
