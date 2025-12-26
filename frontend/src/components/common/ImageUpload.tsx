import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudUpload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import imageService from '../../services/image.service';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string | null) => void;
    label?: string;
    description?: string;
    className?: string;
    onUploadStatusChange?: (isUploading: boolean) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    value,
    onChange,
    label = "Upload Image",
    description = "Drag & drop an image here, or click to select",
    className = "",
    onUploadStatusChange
}) => {
    const [preview, setPreview] = useState<string | null>(value || null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            try {
                setIsUploading(true);
                setUploadError(null);
                setUploadProgress(0);
                if (onUploadStatusChange) onUploadStatusChange(true);

                // Show local preview immediately
                const objectUrl = URL.createObjectURL(file);
                setPreview(objectUrl);

                // Upload to server and get URL
                const imageUrl = await imageService.uploadImage(file, (progress: number) => {
                    setUploadProgress(progress);
                });

                // Clean up object URL
                URL.revokeObjectURL(objectUrl);

                // Set the server URL as preview
                setPreview(imageUrl);
                onChange(imageUrl);
            } catch (error: any) {
                console.error('Image upload failed:', error);
                setUploadError(error.message || 'Failed to upload image');
                setPreview(null);
                onChange(null);
            } finally {
                setIsUploading(false);
                setUploadProgress(0);
                if (onUploadStatusChange) onUploadStatusChange(false);
            }
        }
    }, [onChange, onUploadStatusChange]);

    const removeImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        setUploadError(null);
        onChange(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        maxFiles: 1,
        multiple: false,
        disabled: isUploading
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
                    ${isUploading ? 'pointer-events-none opacity-75' : ''}
                `}
            >
                <input {...getInputProps()} />

                {preview ? (
                    <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden group">
                        <img
                            src={preview}
                            alt="Preview"
                            className={`w-full h-full object-cover ${isUploading ? 'opacity-50 blur-sm' : ''}`}
                        />

                        {isUploading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-2" />
                                <div className="text-blue-700 font-bold text-lg">{uploadProgress}%</div>
                                <div className="w-32 h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>
                ) : isUploading ? (
                    // Fallback if no preview implies we shouldn't be here given the logic, but handled for safety
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-900 font-medium mb-2">Uploading...</p>
                        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
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

            {uploadError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{uploadError}</p>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
