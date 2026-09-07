import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 pt-16 pb-8 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <span className="font-display font-bold text-white text-xl">T</span>
                            </div>
                            <span className="text-2xl font-display font-bold text-slate-900 dark:text-white">TicketKatum</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
                            Your one-stop platform for all ticketing needs. Book buses, flights, movies, and hotels with ease and confidence.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors hover:translate-x-1 inline-block">Home</Link></li>
                            <li><Link to="/buslist" className="text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors hover:translate-x-1 inline-block">Book Tickets</Link></li>
                            <li><Link to="/hotels" className="text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors hover:translate-x-1 inline-block">Hotels</Link></li>
                            <li><Link to="/admin/login" className="text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors hover:translate-x-1 inline-block">Admin Login</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white">Contact</h3>
                        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                support@ticketkatum.com
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                +977 1-4445555
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                Kathmandu, Nepal
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <p className="text-slate-500 dark:text-slate-400 text-sm order-2 md:order-1 font-medium">
                            © {new Date().getFullYear()} TicketKatum. All rights reserved.
                        </p>
                        <div className="flex gap-6 order-1 md:order-2">
                            <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm font-medium">Privacy Policy</a>
                            <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm font-medium">Terms of Service</a>
                            <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm font-medium">Cookie Policy</a>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Secure Payments Partners</p>
                        <div className="flex items-center gap-4">
                            <div className="h-8 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-green-600 font-bold text-sm italic">eSewa</span>
                            </div>
                            <div className="h-8 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">Khalti</span>
                            </div>
                            <div className="h-8 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">IPS</span>
                            </div>
                            <div className="h-8 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-blue-600 dark:text-blue-400 font-bold text-sm italic">Visa</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
