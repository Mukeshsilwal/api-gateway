import React, { useState, useEffect } from 'react';
import { Loader2, ImageOff } from 'lucide-react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    placeholder?: string;
    errorIcon?: React.ReactNode;
}

const LazyImage: React.FC<LazyImageProps> = ({
    src,
    alt,
    className = "",
    placeholder,
    errorIcon,
    ...props
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);

    useEffect(() => {
        const img = new Image();
        img.src = src;

        const handleLoad = () => {
            setImageSrc(src);
            setIsLoading(false);
        };

        const handleError = () => {
            setHasError(true);
            setIsLoading(false);
        };

        img.onload = handleLoad;
        img.onerror = handleError;

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src]);

    if (hasError) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`} aria-label={alt}>
                {errorIcon || <ImageOff size={24} />}
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse z-10">
                    <Loader2 size={24} className="text-gray-400 animate-spin" />
                </div>
            )}
            <img
                src={imageSrc || placeholder || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}
                alt={alt}
                className={`transition-opacity duration-300 w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                {...props}
            />
        </div>
    );
};

export default LazyImage;
