import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../services/authService";
import { formatErrorForForm } from "../utils/errorUtils";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { User, Mail, Phone, Lock, ArrowRight } from "lucide-react";

export default function UserRegister() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string | null }>({});
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        organizationName: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        if (fieldErrors[e.target.id]) {
            setFieldErrors({ ...fieldErrors, [e.target.id]: null });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        if (formData.password !== formData.confirmPassword) {
            setFieldErrors({ confirmPassword: "Passwords do not match" });
            return toast.error("Passwords do not match");
        }

        setIsLoading(true);
        try {
            await authService.register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phone,
                role: "USER",
                organizationName: formData.organizationName || null,
            });

            toast.success("Registration successful! Please login.");
            navigate("/login");
        } catch (error: any) {
            console.error("Registration error:", error);
            const errorInfo = formatErrorForForm(error);

            if (errorInfo.fieldErrors && Object.keys(errorInfo.fieldErrors).length > 0) {
                setFieldErrors(errorInfo.fieldErrors);
                toast.error("Please fix the errors in the form");
            } else {
                toast.error(errorInfo.message || "Registration failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left Side - Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary-900">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 to-purple-900/80"></div>
                <div className="relative z-10 flex flex-col justify-center px-12 text-white h-full animate-fade-in">
                    <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Join Our Community</h2>
                    <p className="text-lg text-indigo-100 max-w-md leading-relaxed">
                        Create an account to enjoy seamless booking, exclusive offers, and a personalized travel experience.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 lg:w-1/2">
                <div className="w-full max-w-md space-y-8 bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100 animate-slide-up">
                    <div className="text-center">
                        <h1 className="text-3xl font-display font-bold text-gray-900">Create Account</h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Sign up for a new passenger account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                id="firstName"
                                label="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="John"
                                icon={User}
                                error={fieldErrors.firstName || undefined}
                                required
                                className="focus-glow"
                            />
                            <Input
                                id="lastName"
                                label="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Doe"
                                icon={User}
                                error={fieldErrors.lastName || undefined}
                                required
                                className="focus-glow"
                            />
                        </div>

                        <Input
                            id="organizationName"
                            label="Organization (Optional)"
                            value={formData.organizationName}
                            onChange={handleChange}
                            placeholder="Company Name"
                            icon={null} // Or a Building icon if imported
                            error={fieldErrors.organizationName || undefined}
                            className="focus-glow"
                        />

                        <Input
                            id="email"
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            icon={Mail}
                            error={(fieldErrors.email || fieldErrors.username) || undefined}
                            required
                            className="focus-glow"
                        />

                        <Input
                            id="phone"
                            label="Phone Number"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+977 9800000000"
                            icon={Phone}
                            error={fieldErrors.phone || undefined}
                            required
                            className="focus-glow"
                        />

                        <div className="grid grid-cols-1 gap-4">
                            <Input
                                id="password"
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                icon={Lock}
                                error={fieldErrors.password || undefined}
                                required
                                className="focus-glow"
                            />
                            <Input
                                id="confirmPassword"
                                label="Confirm Password"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                icon={Lock}
                                error={fieldErrors.confirmPassword || undefined}
                                required
                                className="focus-glow"
                            />
                        </div>

                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="w-full py-3 text-lg shadow-lg shadow-primary/20"
                        >
                            Sign Up <ArrowRight size={18} className="ml-2" />
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:text-primary-700 font-bold transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
