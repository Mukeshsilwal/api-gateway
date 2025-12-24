import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateEvent } from '../../hooks/useEvents';
import EventWizard from '../../components/events/EventWizard';
import BasicInfoForm from '../../components/events/BasicInfoForm';
import TicketingForm from '../../components/events/TicketingForm';
import type { EventCreationDto, EventBasicInfoDto, EventTicketingDto, EventDetailsDto, EventPaymentDto } from '../../types/event-dto';

/**
 * Event Creation Page
 * Complete wizard for creating new events
 */
const EventCreationPage: React.FC = () => {
    const navigate = useNavigate();
    const createEventMutation = useCreateEvent();

    const [currentStep, setCurrentStep] = useState(0);
    const [eventData, setEventData] = useState<Partial<EventCreationDto>>({
        status: 'DRAFT',
    });

    const steps = [
        {
            id: 'basic-info',
            title: 'Basic Information',
            description: 'Event name, date, location, and description',
        },
        {
            id: 'ticketing',
            title: 'Ticketing',
            description: 'Ticket types, pricing, and sales period',
        },
        {
            id: 'details',
            title: 'Additional Details',
            description: 'Age restrictions, policies, and FAQs',
        },
        {
            id: 'payment',
            title: 'Payment Settings',
            description: 'Payment gateways and fee structure',
        },
        {
            id: 'review',
            title: 'Review & Publish',
            description: 'Review your event and publish',
        },
    ];

    const handleBasicInfoChange = (data: Partial<EventBasicInfoDto>) => {
        setEventData(prev => ({
            ...prev,
            basicInfo: data as EventBasicInfoDto,
        }));
    };

    const handleTicketingChange = (data: Partial<EventTicketingDto>) => {
        setEventData(prev => ({
            ...prev,
            ticketing: data as EventTicketingDto,
        }));
    };

    const handleComplete = async () => {
        try {
            const event = await createEventMutation.mutateAsync(eventData as EventCreationDto);
            navigate(`/organizer/events/${event.id}`);
        } catch (error) {
            console.error('Failed to create event:', error);
            alert('Failed to create event. Please try again.');
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <BasicInfoForm
                        data={eventData.basicInfo || {}}
                        onChange={handleBasicInfoChange}
                    />
                );
            case 1:
                return (
                    <TicketingForm
                        data={eventData.ticketing || {}}
                        onChange={handleTicketingChange}
                    />
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">Additional details form coming soon...</p>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">Payment settings form coming soon...</p>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                            <h3 className="text-xl font-bold mb-4">Event Preview</h3>

                            {eventData.basicInfo && (
                                <div className="space-y-3">
                                    <div>
                                        <span className="font-semibold">Event Name:</span> {eventData.basicInfo.name}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Category:</span> {eventData.basicInfo.category}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Type:</span> {eventData.basicInfo.type}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Start:</span> {new Date(eventData.basicInfo.startDateTime).toLocaleString()}
                                    </div>
                                    <div>
                                        <span className="font-semibold">End:</span> {new Date(eventData.basicInfo.endDateTime).toLocaleString()}
                                    </div>
                                </div>
                            )}

                            {eventData.ticketing && eventData.ticketing.ticketTypes && (
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-3">Ticket Types</h4>
                                    <div className="space-y-2">
                                        {eventData.ticketing.ticketTypes.map((ticket, idx) => (
                                            <div key={idx} className="flex justify-between p-3 bg-gray-50 rounded">
                                                <span>{ticket.name}</span>
                                                <span className="font-semibold">NPR {ticket.price} × {ticket.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                ✓ Your event will be saved as a draft and submitted for review.
                                You'll be notified once it's approved.
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
                    <p className="text-gray-600">Fill in the details to create your event</p>
                </div>

                <EventWizard
                    steps={steps}
                    currentStep={currentStep}
                    onStepChange={setCurrentStep}
                    onComplete={handleComplete}
                >
                    {renderStepContent()}
                </EventWizard>
            </div>
        </div>
    );
};

export default EventCreationPage;
