import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Ticket } from './types';

interface EscalationAlertsProps {
    tickets?: Ticket[];
}

const EscalationAlerts: React.FC<EscalationAlertsProps> = ({ tickets = [] }) => {
    // Filter for high priority or overdue tickets
    const alerts = tickets.filter(t =>
        t.priority === 'high' ||
        t.timeLeft === 'Overdue' ||
        (t.timeLeft && t.timeLeft.includes('h') && !t.timeLeft.includes('d')) // Less than 24h
    ).slice(0, 5); // Show top 5

    return (
        <div className="h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="text-amber-500" size={20} />
                    Escalation Alerts
                </h3>
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">
                    {alerts.length} Critical
                </span>
            </div>

            <div className="space-y-3">
                {alerts.length > 0 ? (
                    alerts.map((ticket, index) => (
                        <div key={ticket.id || index} className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-start gap-3">
                            <div className="mt-1 min-w-[4px] h-8 bg-amber-400 rounded-full"></div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-bold text-gray-900 truncate">{ticket.subject}</p>
                                    <span className="text-xs font-mono text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                        {ticket.timeLeft}
                                    </span>
                                </div>
                                <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                                    {ticket.id} • {ticket.domain}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <p>No critical alerts</p>
                    </div>
                )}

                {alerts.length > 0 && (
                    <button className="w-full py-2 text-sm text-amber-700 font-medium hover:bg-amber-50 rounded-lg transition-colors flex items-center justify-center gap-1">
                        View All Escalations <ArrowRight size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default EscalationAlerts;
