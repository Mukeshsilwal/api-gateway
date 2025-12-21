import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ApiService from "../../services/api.service";
import API_CONFIG from "../../config/api";

interface AdminRequest {
    id: string | number;
    fullName: string;
    email: string;
    phone: string;
    citizenshipNumber: string;
    frontImage?: string;
    backImage?: string;
    [key: string]: any;
}

export const AdminRequestManager: React.FC = () => {
    const [requests, setRequests] = useState<AdminRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | number | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await ApiService.get(API_CONFIG.ENDPOINTS.GET_ADMIN_REQUESTS);
            const normalizedData: AdminRequest[] = Array.isArray(data) ? data.map((req: any) => ({
                ...req,
                id: req.id || req._id || req.requestId
            })) : [];
            setRequests(normalizedData);
        } catch (error) {
            console.error("Error fetching requests:", error);
            toast.error("Failed to load registration requests");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: string | number) => {
        setProcessingId(id);
        try {
            const url = `${API_CONFIG.ENDPOINTS.APPROVE_ADMIN}/${id}`;
            await ApiService.post(url, {});

            toast.success("Admin approved and credentials emailed.");
            setRequests(requests.filter(req => req.id !== id));
        } catch (error: any) {
            console.error("Error approving admin:", error);
            const msg = error.message || "Failed to approve admin.";
            toast.error(msg);
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Admin Registration Requests
                    </h2>
                    <p className="text-gray-600 mt-1">Review and approve new admin registrations</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg">
                        {requests.length} Pending
                    </span>
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                    <p className="text-gray-500">No pending registration requests at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {requests.map((request) => (
                        <div key={request.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Left: Info Section */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                                    {request.fullName?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">{request.fullName}</h3>
                                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                        {request.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                                                Pending Review
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{request.phone}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500 font-medium">Citizenship No.</p>
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{request.citizenshipNumber}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Images Section */}
                                    <div className="flex flex-col gap-3">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Citizenship Documents</p>
                                        <div className="flex gap-3">
                                            {request.frontImage && (
                                                <div
                                                    onClick={() => setSelectedImage(request.frontImage || null)}
                                                    className="relative group w-40 h-28 rounded-xl overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-indigo-500 transition-all shadow-md hover:shadow-xl"
                                                >
                                                    <img
                                                        src={request.frontImage}
                                                        alt="Citizenship Front"
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                                        <p className="text-white text-xs font-semibold">Front Side</p>
                                                    </div>
                                                </div>
                                            )}
                                            {request.backImage && (
                                                <div
                                                    onClick={() => setSelectedImage(request.backImage || null)}
                                                    className="relative group w-40 h-28 rounded-xl overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-indigo-500 transition-all shadow-md hover:shadow-xl"
                                                >
                                                    <img
                                                        src={request.backImage}
                                                        alt="Citizenship Back"
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                                        <p className="text-white text-xs font-semibold">Back Side</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(request.id)}
                                        disabled={processingId === request.id}
                                        className={`px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2 ${processingId === request.id ? 'opacity-70 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {processingId === request.id ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Approving...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Approve Request
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Image Modal */}
            {selectedImage && (
                <div
                    onClick={() => setSelectedImage(null)}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img
                            src={selectedImage}
                            alt="Citizenship Document"
                            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
