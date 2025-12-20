import React, { useState } from 'react';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';

interface Step {
    id: string;
    title: string;
    description: string;
}

interface EventWizardProps {
    steps: Step[];
    currentStep: number;
    onStepChange: (step: number) => void;
    onComplete: () => void;
    children: React.ReactNode;
}

/**
 * Event Creation Wizard Component
 * Multi-step form with progress tracking
 */
const EventWizard: React.FC<EventWizardProps> = ({
    steps,
    currentStep,
    onStepChange,
    onComplete,
    children,
}) => {
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            if (!completedSteps.includes(currentStep)) {
                setCompletedSteps([...completedSteps, currentStep]);
            }
            onStepChange(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            onStepChange(currentStep - 1);
        }
    };

    const handleStepClick = (stepIndex: number) => {
        // Only allow clicking on completed steps or current step
        if (stepIndex <= currentStep || completedSteps.includes(stepIndex)) {
            onStepChange(stepIndex);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const isCompleted = completedSteps.includes(index);
                        const isCurrent = index === currentStep;
                        const isAccessible = index <= currentStep || isCompleted;

                        return (
                            <React.Fragment key={step.id}>
                                {/* Step */}
                                <div
                                    onClick={() => isAccessible && handleStepClick(index)}
                                    className={`flex-1 ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                >
                                    <div className="flex flex-col items-center">
                                        {/* Circle */}
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${isCompleted
                                                    ? 'bg-green-500 text-white'
                                                    : isCurrent
                                                        ? 'bg-blue-500 text-white ring-4 ring-blue-200'
                                                        : isAccessible
                                                            ? 'bg-gray-200 text-gray-600'
                                                            : 'bg-gray-100 text-gray-400'
                                                }`}
                                        >
                                            {isCompleted ? <Check size={24} /> : index + 1}
                                        </div>

                                        {/* Label */}
                                        <div className="mt-2 text-center">
                                            <div
                                                className={`text-sm font-semibold ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-600'
                                                    }`}
                                            >
                                                {step.title}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 hidden md:block">
                                                {step.description}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div className="flex-1 max-w-[100px] mx-4">
                                        <div
                                            className={`h-1 rounded transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                                }`}
                                        />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {steps[currentStep].title}
                    </h2>
                    <p className="text-gray-600">{steps[currentStep].description}</p>
                </div>

                {/* Children content for current step */}
                <div>{children}</div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
                <button
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${currentStep === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600'
                        }`}
                >
                    <ChevronLeft size={20} />
                    Previous
                </button>

                <div className="text-sm text-gray-600">
                    Step {currentStep + 1} of {steps.length}
                </div>

                <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                    {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Auto-save Indicator */}
            <div className="mt-4 text-center">
                <span className="text-xs text-gray-500 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Auto-saving draft...
                </span>
            </div>
        </div>
    );
};

export default EventWizard;
