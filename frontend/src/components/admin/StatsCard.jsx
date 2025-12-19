import React, { useEffect, useState } from 'react';

export function StatsCard({ label, value, icon, color = 'indigo', trend, isLoading }) {
    const [displayValue, setDisplayValue] = useState(0);

    // Animated counter effect
    useEffect(() => {
        if (isLoading || typeof value !== 'number') return;

        const duration = 1000; // 1 second
        const steps = 30;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setDisplayValue(value);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [value, isLoading]);

    const colorClasses = {
        indigo: {
            bg: 'from-indigo-500 to-purple-600',
            text: 'text-indigo-600',
            lightBg: 'bg-indigo-50',
            icon: 'text-indigo-600'
        },
        green: {
            bg: 'from-green-500 to-emerald-600',
            text: 'text-green-600',
            lightBg: 'bg-green-50',
            icon: 'text-green-600'
        },
        orange: {
            bg: 'from-orange-500 to-red-600',
            text: 'text-orange-600',
            lightBg: 'bg-orange-50',
            icon: 'text-orange-600'
        },
        purple: {
            bg: 'from-purple-500 to-pink-600',
            text: 'text-purple-600',
            lightBg: 'bg-purple-50',
            icon: 'text-purple-600'
        }
    };

    const colors = colorClasses[color] || colorClasses.indigo;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-gray-500 text-sm font-medium mb-2">{label}</p>
                    <div className="flex items-baseline gap-2">
                        <p className={`text-3xl font-bold ${colors.text} transition-all duration-300`}>
                            {isLoading ? (
                                <span className="inline-block w-20 h-8 bg-gray-200 rounded animate-pulse" />
                            ) : (
                                typeof value === 'number' ? displayValue.toLocaleString() : value
                            )}
                        </p>
                        {trend && (
                            <div className={`flex items-center gap-1 text-sm font-medium ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {trend.direction === 'up' ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                )}
                                <span>{trend.value}%</span>
                            </div>
                        )}
                    </div>
                    {trend && (
                        <p className="text-xs text-gray-500 mt-1">vs last month</p>
                    )}
                </div>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );
}
