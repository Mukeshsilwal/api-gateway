import React, { useState } from 'react';
import { handleEsewaPayment } from '../../utils/esewaSecurePayment';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ShieldCheck, Lock, AlertTriangle, Smartphone, Mail, User } from 'lucide-react';

/**
 * Comprehensive eSewa Payment UI
 * 
 * Features:
 * - Full form with validation (Name, Email, Phone)
 * - Trust indicators & eSewa branding
 * - Accessible error handling (ARIA alerts)
 * - Idempotent payment submission
 * - Responsive design
 */
const EsewaPaymentUI = ({
    amount = "0.00",
    productName = "Service Payment",
    onSuccess,
    onFailure
}) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });

    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'error'
    const [msg, setMsg] = useState('');

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

        // Nepal Phone Validation (98XXXXXXXX or 97XXXXXXXX)
        if (!formData.phone.trim()) newErrors.phone = "Phone is required";
        else if (!/^(98|97)\d{8}$/.test(formData.phone)) newErrors.phone = "Invalid Nepal mobile number (10 digits starting with 98/97)";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error on type
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handlePayment = async () => {
        if (status === 'loading') return;

        if (!validateForm()) {
            setMsg("Please correct the errors in the form.");
            setStatus('error');
            return;
        }

        setStatus('loading');
        setMsg('');

        const paymentContext = {
            amount: amount,
            productName: productName,
            customerName: formData.name,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            successUrl: onSuccess || `${window.location.origin}/payment/success`,
            failureUrl: onFailure || `${window.location.origin}/payment/failed`,
            bookingDetails: {
                notes: formData.notes
            }
        };

        await handleEsewaPayment(
            paymentContext,
            (isLoading) => {
                if (isLoading) setStatus('loading');
            },
            (errorMsg) => {
                setMsg(errorMsg);
                setStatus('error');
            }
        );
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 font-sans">
            {/* Header */}
            <div className="bg-[#60bb46] p-6 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-white/10 skew-y-3 transform origin-bottom-left"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-1">NPR {parseFloat(amount).toLocaleString('en-NP', { minimumFractionDigits: 2 })}</h2>
                    <p className="text-green-50 text-sm opacity-90">{productName}</p>
                </div>
            </div>

            {/* Trust Indicator */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Lock size={12} className="text-green-600" />
                <span>Secure payment powered by <strong>eSewa</strong></span>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">
                {/* Error Banner */}
                {msg && (
                    <div
                        role="alert"
                        className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-start gap-3 animate-fade-in"
                    >
                        <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">Payment Issue</p>
                            <p>{msg}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <Input
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        error={errors.name}
                        icon={User}
                        placeholder="Ram Bahadur"
                        disabled={status === 'loading'}
                    />

                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        error={errors.email}
                        icon={Mail}
                        placeholder="ram@example.com"
                        disabled={status === 'loading'}
                    />

                    <Input
                        label="Mobile Number"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        error={errors.phone}
                        icon={Smartphone}
                        placeholder="98XXXXXXXX"
                        maxLength={10}
                        disabled={status === 'loading'}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
                        <textarea
                            name="notes"
                            rows="2"
                            value={formData.notes}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm"
                            placeholder="Any special instructions..."
                            disabled={status === 'loading'}
                        ></textarea>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <Button
                        onClick={handlePayment}
                        disabled={status === 'loading'}
                        isLoading={status === 'loading'}
                        className="w-full bg-[#60bb46] hover:bg-[#4ca036] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-200 transition-all transform active:scale-[0.98]"
                        aria-label={status === 'loading' ? "Processing secure payment..." : `Pay NPR ${amount} with eSewa`}
                        aria-busy={status === 'loading'}
                    >
                        {status === 'loading' ? 'Processing Securely...' : 'Pay with eSewa'}
                    </Button>

                    <p className="text-xs text-center text-gray-400 mt-4">
                        You will be redirected to eSewa to complete your payment.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EsewaPaymentUI;
