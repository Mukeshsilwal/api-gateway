import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    EventCreationDto,
    EventBasicInfoDto,
    EventTicketingDto,
    EventStatus,
    EventType,
    EventCategory
} from '../types/event-dto';
import eventService from '../services/eventService';
import EventWizard from '../components/events/EventWizard';
import BasicInfoForm from '../components/events/BasicInfoForm';
import VenueScheduleForm from '../components/events/VenueScheduleForm';
import TicketingForm from '../components/events/TicketingForm';
import ReviewEvent from '../components/events/ReviewEvent';

export function AddEventPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial state matching the EventCreationDto structure roughly
    // We flatten it a bit during editing for easier form handling if needed, 
    // but keeping it structured is better for the DTO.
    // However, BasicInfoForm and VenueScheduleForm both edit 'basicInfo'.

    const [basicInfo, setBasicInfo] = useState<Partial<EventBasicInfoDto>>({
        name: '',
        category: 'MUSIC' as EventCategory,
        type: 'OFFLINE' as EventType,
        description: '',
        shortDescription: '',
        coverImage: '',
        images: [],
        tags: [],
        language: 'English',
        timezone: 'Asia/Kathmandu',
        startDateTime: '',
        endDateTime: '',
    });

    const [ticketing, setTicketing] = useState<Partial<EventTicketingDto>>({
        ticketTypes: [],
        maxTicketsPerOrder: 10,
        minTicketsPerOrder: 1,
        salesStartDate: '',
        salesEndDate: '',
        allowWaitlist: false,
        requireApproval: false,
    });

    const steps = [
        { id: 'basic', title: 'Basic Details', description: 'Name, category, and description' },
        { id: 'venue', title: 'Time & Venue', description: 'When and where' },
        { id: 'ticketing', title: 'Ticketing', description: 'Ticket types and prices' },
        { id: 'review', title: 'Review', description: 'Review and publish' }
    ];

    const handleBasicInfoChange = (data: Partial<EventBasicInfoDto>) => {
        setBasicInfo(prev => ({ ...prev, ...data }));
    };

    const handleTicketingChange = (data: Partial<EventTicketingDto>) => {
        setTicketing(prev => ({ ...prev, ...data }));
    };

    const transformToDto = (status: EventStatus): EventCreationDto => {
        return {
            basicInfo: basicInfo as EventBasicInfoDto,
            ticketing: ticketing as EventTicketingDto,
            additionalDetails: {}, // Can be expanded later
            paymentSettings: {
                paymentGateways: ['ESEWA', 'KHALTI'],
                platformFeePercentage: 5,
                organizerPayoutSchedule: 'AFTER_EVENT',
                refundPolicy: 'PARTIAL_REFUND'
            },
            status
        };
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1: // Basic Info
                if (!basicInfo.name) {
                    toast.error('Event name is required');
                    return false;
                }
                if (!basicInfo.description) {
                    toast.error('Description is required');
                    return false;
                }
                return true;
            case 2: // Venue & Schedule
                if (!basicInfo.startDateTime || !basicInfo.endDateTime) {
                    toast.error('Start and End dates are required');
                    return false;
                }
                if (new Date(basicInfo.startDateTime) >= new Date(basicInfo.endDateTime)) {
                    toast.error('End date must be after start date');
                    return false;
                }
                return true;
            case 3: // Ticketing
                if (!ticketing.salesStartDate || !ticketing.salesEndDate) {
                    toast.error('Sales start and end dates are required');
                    return false;
                }
                if (new Date(ticketing.salesStartDate) >= new Date(ticketing.salesEndDate)) {
                    toast.error('Sales end date must be after start date');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const handleStepChange = (newStep: number) => {
        // Validate when moving forward
        if (newStep > currentStep) {
            if (!validateStep(currentStep)) return;
        }
        setCurrentStep(newStep);
    };

    const handleComplete = async () => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            const eventData = transformToDto('PUBLISHED');

            // Final validation (mostly redundant if steps valid, but good for safety)
            if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
                setIsSubmitting(false);
                return;
            }

            await eventService.createEvent(eventData);
            toast.success('Event created successfully!');
            navigate('/events');
        } catch (error: any) {
            console.error('Error creating event:', error);
            toast.error(error.response?.data?.message || 'Failed to create event');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveDraft = async () => {
        try {
            const eventData = transformToDto('DRAFT');
            await eventService.createEvent(eventData);
            toast.success('Event draft saved!');
            navigate('/events'); // Or stay on page?
        } catch (error: any) {
            console.error('Error saving draft:', error);
            toast.error('Failed to save draft');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
                    <p className="mt-2 text-gray-600">Fill in the details to publish your event</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <EventWizard
                        steps={steps}
                        currentStep={currentStep}
                        onStepChange={handleStepChange}
                        onComplete={handleComplete}
                    >
                        {currentStep === 1 && (
                            <div className="p-6">
                                <BasicInfoForm
                                    data={basicInfo}
                                    onChange={handleBasicInfoChange}
                                />
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="p-6">
                                <VenueScheduleForm
                                    data={basicInfo}
                                    onChange={handleBasicInfoChange}
                                />
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="p-6">
                                <TicketingForm
                                    data={ticketing}
                                    onChange={handleTicketingChange}
                                />
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="p-6">
                                <ReviewEvent
                                    data={{ ...basicInfo, ...ticketing } as any}
                                />
                            </div>
                        )}

                    </EventWizard>
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleSaveDraft}
                        className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2"
                    >
                        Save as Draft
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddEventPage;
