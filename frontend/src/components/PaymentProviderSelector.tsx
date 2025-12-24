import { PaymentProvider } from "../types/common";

interface PaymentProviderSelectorProps {
    selectedProvider: PaymentProvider;
    onSelect: (provider: PaymentProvider) => void;
    disabled?: boolean;
}

const PaymentProviderSelector: React.FC<PaymentProviderSelectorProps> = ({
    selectedProvider,
    onSelect,
    disabled = false,
}) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Select Payment Method</h3>
            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => onSelect("ESEWA")}
                    disabled={disabled}
                    className={`
            relative flex items-center justify-center p-4 border rounded-lg transition-all
            ${selectedProvider === "ESEWA"
                            ? "border-green-500 bg-green-50 ring-2 ring-green-500 ring-opacity-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
                >
                    <span className={`font-bold text-xl ${selectedProvider === 'ESEWA' ? 'text-green-600' : 'text-gray-600'}`}>eSewa</span>
                    {selectedProvider === "ESEWA" && (
                        <div className="absolute top-2 right-2 h-3 w-3 bg-green-500 rounded-full"></div>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => onSelect("KHALTI")}
                    disabled={disabled}
                    className={`
            relative flex items-center justify-center p-4 border rounded-lg transition-all
            ${selectedProvider === "KHALTI"
                            ? "border-purple-500 bg-purple-50 ring-2 ring-purple-500 ring-opacity-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
                >
                    <span className={`font-bold text-xl ${selectedProvider === 'KHALTI' ? 'text-purple-600' : 'text-gray-600'}`}>Khalti</span>
                    {selectedProvider === "KHALTI" && (
                        <div className="absolute top-2 right-2 h-3 w-3 bg-purple-500 rounded-full"></div>
                    )}
                </button>
            </div>
        </div>
    );
};

export default PaymentProviderSelector;
