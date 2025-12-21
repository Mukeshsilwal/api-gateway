export interface Ticket {
    id: string;
    subject: string;
    domain: 'hotel' | 'cinema' | 'bus' | 'all';
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority: 'high' | 'medium' | 'low';
    assignee: string;
    timeLeft: string;
    createdAt?: string;
    [key: string]: any;
}
