import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

const KPIWidget = ({ label, value, trend, trendLabel, icon: Icon, color }) => {
    const isPositive = trend > 0;
    const isNeutral = trend === 0;

    const colorClasses = {
        indigo: 'bg-indigo-50 text-indigo-600',
        rose: 'bg-rose-50 text-rose-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        purple: 'bg-purple-50 text-purple-600',
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.indigo}`}>
                    <Icon size={24} />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${isPositive ? 'bg-green-50 text-green-700' :
                        isNeutral ? 'bg-gray-50 text-gray-600' :
                            'bg-red-50 text-red-700'
                        }`}>
                        {isPositive ? <ArrowUp size={12} /> : isNeutral ? <Minus size={12} /> : <ArrowDown size={12} />}
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
                {trendLabel && <p className="text-xs text-gray-400 mt-1">{trendLabel}</p>}
            </div>
        </div>
    );
};

export default KPIWidget;
