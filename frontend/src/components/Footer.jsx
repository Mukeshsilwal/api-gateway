import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow">
                                <span className="font-display font-bold text-white text-xl">T</span>
                            </div>
                            <span className="text-2xl font-display font-bold">TicketKatum</span>
                        </div>
                        <p className="text-gray-400 max-w-sm leading-relaxed">
                            Your one-stop platform for all ticketing needs. Book buses, flights, movies, and hotels with ease and confidence.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">Home</Link></li>
                            <li><Link to="/buslist" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">Book Tickets</Link></li>
                            <li><Link to="/hotels" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">Hotels</Link></li>
                            <li><Link to="/admin/login" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">Admin Login</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-6">Contact</h3>
                        <ul className="space-y-3 text-gray-400">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                support@ticketkatum.com
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                +977 1-4445555
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                Kathmandu, Nepal
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} TicketKatum. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">Privacy Policy</a>
                        <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
