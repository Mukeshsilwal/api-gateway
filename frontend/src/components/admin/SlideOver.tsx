import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface SlideOverProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

const SlideOver: React.FC<SlideOverProps> = ({ isOpen, onClose, title, children, footer }) => {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
            // Focus trap could be implemented here
            panelRef.current?.focus();
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            <div className="absolute inset-0 overflow-hidden">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm"
                    onClick={onClose}
                    aria-hidden="true"
                ></div>

                <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                    <div
                        ref={panelRef}
                        className="pointer-events-auto w-screen max-w-md transform transition ease-in-out duration-500 sm:duration-700 translate-x-0"
                        tabIndex={-1}
                    >
                        <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-2xl animate-slide-in-right">
                            <div className="px-4 py-6 sm:px-6 border-b border-gray-100 bg-gray-50/50">
                                <div className="flex items-start justify-between">
                                    <h2 className="text-lg font-semibold leading-6 text-gray-900" id="slide-over-title">
                                        {title}
                                    </h2>
                                    <div className="ml-3 flex h-7 items-center">
                                        <button
                                            type="button"
                                            className="rounded-md bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                            onClick={onClose}
                                        >
                                            <span className="sr-only">Close panel</span>
                                            <X className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="relative flex-1 px-4 py-6 sm:px-6">
                                {children}
                            </div>

                            {footer && (
                                <div className="flex-shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6 bg-gray-50">
                                    {footer}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SlideOver;
