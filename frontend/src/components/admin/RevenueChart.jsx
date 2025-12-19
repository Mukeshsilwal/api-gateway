import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Custom Tooltip Component - moved outside to avoid creating during render
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                <p className="text-gray-500 text-sm mb-1">{label}</p>
                <p className="text-indigo-600 font-bold text-lg">
                    Rs. {payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export function RevenueChart({ data, isLoading }) {

    if (isLoading) {
        return (
            <div className="w-full h-full min-h-[300px] bg-gray-50 rounded-xl animate-pulse flex items-end justify-between p-6 gap-2">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="w-full bg-gray-200 rounded-t-lg" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
                ))}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>No revenue data available</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickFormatter={(value) => `Rs.${value / 1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '5 5' }} />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
