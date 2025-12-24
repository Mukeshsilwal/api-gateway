import { Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";

export default function UserLogin() {
    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Side - Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-indigo-900">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-indigo-900/80"></div>
                <div className="relative z-10 flex flex-col justify-center px-12 text-white animate-fade-in">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Your Gateway to Seamless Booking</h2>
                    <p className="text-lg text-indigo-100 max-w-md leading-relaxed">
                        Sign in to book tickets for buses, flights, movies, and hotels. Manage all your bookings in one place.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-12 lg:w-1/2">
                <div className="w-full max-w-md animate-slide-up">
                    <LoginForm />
                </div>

                {/* Back to Homepage Link */}
                <div className="mt-8 text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg border-2 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-md group"
                    >
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}
