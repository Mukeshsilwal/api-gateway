import EsewaPaymentUI from '../components/payment/EsewaPaymentUI';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const EsewaDemo = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">eSewa Payment Integration Demo</h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            This page demonstrates the robust eSewa payment flow, including validation,
                            idempotency, and error handling (simulated).
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                        {/* Demo 1: Standard Flow */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Standard Payment Flow</h2>
                            <p className="text-sm text-gray-500 mb-4">
                                Try entering valid details. This will attempt to initiate a payment via the RC environment.
                            </p>
                            <EsewaPaymentUI
                                amount="150.00"
                                productName="Demo Bus Ticket"
                            />
                        </div>

                        {/* Demo 2: Error Simulation (Conceptual) */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Features & Behavior</h2>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 text-sm text-gray-600">
                                <ul className="space-y-3 list-disc pl-4">
                                    <li>
                                        <strong>Idempotency:</strong> Every click generates a unique <code>Reference ID</code> to prevent duplicate charges.
                                    </li>
                                    <li>
                                        <strong>Validation:</strong> Try clicking "Pay" without filling fields to see inline validation.
                                    </li>
                                    <li>
                                        <strong>409 Handling:</strong> If the backend reports a duplicate transaction, a friendly error message is shown automatically.
                                    </li>
                                    <li>
                                        <strong>Direct POST:</strong> Attempts to POST directly to eSewa first, falling back to a hidden form if CORS blocks it.
                                    </li>
                                    <li>
                                        <strong>Accessibility:</strong> Screen reader friendly alerts and focus management.
                                    </li>
                                </ul>

                                <div className="mt-6 p-4 bg-blue-50 rounded-lg text-blue-800 text-xs">
                                    <strong>Dev Note:</strong> Check the browser console to see the detailed logs of the payment initiation process.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default EsewaDemo;
