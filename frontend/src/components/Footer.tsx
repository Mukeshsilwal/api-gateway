import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-stone-50 border-t border-stone-200 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <span className="font-display font-bold text-white text-xl">T</span>
                            </div>
                            <span className="text-2xl font-display font-bold text-gray-900">TicketKatum</span>
                        </div>
                        <p className="text-gray-600 max-w-sm leading-relaxed">
                            Your one-stop platform for all ticketing needs. Book buses, flights, movies, and hotels with ease and confidence.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-6 text-gray-900">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-gray-600 hover:text-orange-600 transition-colors hover:translate-x-1 inline-block">Home</Link></li>
                            <li><Link to="/buslist" className="text-gray-600 hover:text-orange-600 transition-colors hover:translate-x-1 inline-block">Book Tickets</Link></li>
                            <li><Link to="/hotels" className="text-gray-600 hover:text-orange-600 transition-colors hover:translate-x-1 inline-block">Hotels</Link></li>
                            <li><Link to="/admin/login" className="text-gray-600 hover:text-orange-600 transition-colors hover:translate-x-1 inline-block">Admin Login</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-6 text-gray-900">Contact</h3>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                support@ticketkatum.com
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                +977 1-4445555
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                Kathmandu, Nepal
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-stone-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <p className="text-gray-500 text-sm order-2 md:order-1">
                            © {new Date().getFullYear()} TicketKatum. All rights reserved.
                        </p>
                        <div className="flex gap-6 order-1 md:order-2">
                            <a href="#" className="text-gray-500 hover:text-orange-600 transition-colors text-sm">Privacy Policy</a>
                            <a href="#" className="text-gray-500 hover:text-orange-600 transition-colors text-sm">Terms of Service</a>
                            <a href="#" className="text-gray-500 hover:text-orange-600 transition-colors text-sm">Cookie Policy</a>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-3">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Secure Payments Partners</p>
                        <div className="flex items-center gap-4">
                            {/* Payment Partner Logos (Placeholders) */}
                            <div className="h-8 px-3 bg-white border border-gray-100 rounded-md flex items-center justify-center shadow-sm">
                                <span className="text-green-600 font-bold text-sm italic">eSewa</span>
                            </div>
                            <div className="h-8 px-3 bg-white border border-gray-100 rounded-md flex items-center justify-center shadow-sm">
                                <span className="text-purple-700 font-bold text-sm">Khalti</span>
                            </div>
                            <div className="h-8 px-3 bg-white border border-gray-100 rounded-md flex items-center justify-center shadow-sm">
                                <span className="text-blue-800 font-bold text-sm">IPS</span>
                            </div>
                            <div className="h-8 px-3 bg-white border border-gray-100 rounded-md flex items-center justify-center shadow-sm">
                                <span className="text-blue-600 font-bold text-sm italic">Visa</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
