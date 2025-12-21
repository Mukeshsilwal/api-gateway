import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudUpload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
    value?: string | File;
    onChange: (file: File | null) => void;
    label?: string;
    description?: string;
    className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    value,
    onChange,
    label = "Upload Image",
    description = "Drag & drop an image here, or click to select",
    className = ""
}) => {
    const [preview, setPreview] = useState<string | null>(
        typeof value === 'string' ? value : (value ? URL.createObjectURL(value) : null)
    );

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            onChange(file);
        }
    }, [onChange]);

    const removeImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        onChange(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        maxFiles: 1,
        multiple: false
    });

    return (
        <div className={`w-full ${className}`}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}

            <div
                {...getRootProps()}
                className={`
                    relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer text-center
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}
                    ${preview ? 'border-none p-0 overflow-hidden bg-transparent' : ''}
                `}
            >
                <input {...getInputProps()} />

                {preview ? (
                    <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden group">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white font-medium flex items-center gap-2">
                                <CloudUpload size={20} />
                                Change Image
                            </p>
                        </div>
                        <button
                            onClick={removeImage}
                            className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-gray-700 hover:text-red-600 shadow-md transition-colors z-10"
                            title="Remove image"
                        >
                            <X size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className={`p-4 rounded-full mb-4 ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            {isDragActive ? (
                                <CloudUpload size={32} className="text-blue-600" />
                            ) : (
                                <ImageIcon size={32} className="text-gray-400" />
                            )}
                        </div>
                        <p className="text-gray-900 font-medium mb-1">
                            {isDragActive ? "Drop the file here" : "Click or drag image here"}
                        </p>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                            {description}
                        </p>
                        <p className="text-xs text-gray-400 mt-4">
                            Supports JPG, PNG, WEBP up to 5MB
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUpload;
