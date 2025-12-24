import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import eventService from '../../services/eventService';

interface CalendarEvent {
    id: number;
    name: string;
    startDateTime: string;
    endDateTime: string;
    coverImage?: string;
    category: string;
}

export const EventCalendar: React.FC = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, [currentDate]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await eventService.getEvents();
            setEvents(response.data.data || response.data || []);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek, year, month };
    };

    const getEventsForDate = (date: Date) => {
        return events.filter(event => {
            const eventDate = new Date(event.startDateTime);
            return eventDate.toDateString() === date.toDateString();
        });
    };

    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <CalendarIcon size={24} />
                    Event Calendar
                </h2>
                <div className="flex items-center gap-4">
                    <button onClick={previousMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-semibold text-gray-900 dark:text-white min-w-[150px] text-center">
                        {monthNames[month]} {year}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400 py-2">
                        {day}
                    </div>
                ))}

                {/* Empty cells for days before month starts */}
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(year, month, day);
                    const dayEvents = getEventsForDate(date);
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                        <div
                            key={day}
                            className={`aspect-square border border-gray-200 dark:border-gray-700 rounded-lg p-2 ${isToday ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                } cursor-pointer transition-colors`}
                        >
                            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{day}</div>
                            {dayEvents.slice(0, 2).map(event => (
                                <div
                                    key={event.id}
                                    onClick={() => navigate(`/events/${event.id}`)}
                                    className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded px-1 py-0.5 mb-1 truncate hover:bg-indigo-200 dark:hover:bg-indigo-800"
                                    title={event.name}
                                >
                                    {event.name}
                                </div>
                            ))}
                            {dayEvents.length > 2 && (
                                <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EventCalendar;
