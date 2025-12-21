import React from 'react';
import { useRouteError } from "react-router-dom";

interface RouteError {
    statusText?: string;
    message?: string;
}

export default function ErrorPage() {
    const error = useRouteError() as RouteError;
    console.error(error);

    return (
        <div id="error-page" className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Oops!</h1>
            <p className="text-lg text-gray-600 mb-2">Sorry, an unexpected error has occurred.</p>
            <p className="text-gray-500 italic">
                <i>{error?.statusText || error?.message}</i>
            </p>
        </div>
    );
}
