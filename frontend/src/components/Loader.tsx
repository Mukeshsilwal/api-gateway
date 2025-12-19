import React from "react";

interface LoaderProps {
    message?: string;
    fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ message = "Loading...", fullScreen = false }) => {
    const containerClasses = fullScreen
        ? "fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50"
        : "flex flex-col items-center justify-center p-4";

    return (
        <div className={containerClasses}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">{message}</p>
        </div>
    );
};

export default Loader;
