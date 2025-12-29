import apiService from './api.service';
import API_CONFIG from '../config/api';

/**
 * Image Service with Robust Upload Handling
 * Fixes MultipartException EOFException by ensuring complete upload with progress monitoring
 * 
 * Key Features:
 * - Progress monitoring via XMLHttpRequest
 * - Dynamic timeout based on file size
 * - Retry logic with exponential backoff
 * - Proper Content-Type header handling (browser-generated boundary)
 * - Prevention of request cutoff/abort
 * 
 * @module ImageService
 */
const imageService = {
    /**
     * Upload a single image with progress monitoring and retry
     * @param {File} file - The image file to upload
     * @param {Function} onProgress - Optional callback for upload progress (0-100)
     * @returns {Promise<string>} The secure URL of the uploaded image
     */
    async uploadImage(file, onProgress = null) {
        try {
            if (!file) {
                throw new Error('No file provided for upload');
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                throw new Error('Only image files are allowed');
            }

            // Validate file size (10MB limit)
            const MAX_SIZE = 10 * 1024 * 1024; // 10MB in bytes
            if (file.size > MAX_SIZE) {
                throw new Error('Image size must be less than 10MB');
            }

            // Create FormData
            const formData = new FormData();
            formData.append('file', file);

            // Calculate appropriate timeout based on file size
            // Allow 30 seconds base + 5 seconds per MB to accommodate slow connections
            const timeoutMs = 30000 + Math.ceil(file.size / (1024 * 1024)) * 5000;
            const maxTimeout = 300000; // Max 5 minutes
            const uploadTimeout = Math.min(timeoutMs, maxTimeout);

            // Upload with progress monitoring using XMLHttpRequest
            const response = await this._uploadWithProgress(
                API_CONFIG.ENDPOINTS.IMAGE_UPLOAD,
                formData,
                uploadTimeout,
                onProgress
            );

            // The API returns a secure URL string
            // Handle both wrapped ({ data: url }) and direct (url) responses
            console.log(response);
            const imageUrl = response.url || response.data || response;

            if (typeof imageUrl !== 'string') {
                throw new Error('Invalid response from image upload API');
            }

            return imageUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error(error.message || 'Failed to upload image');
        }
    },

    /**
     * Internal method: Upload with XMLHttpRequest for progress monitoring
     * Uses XMLHttpRequest instead of fetch for better progress tracking and timeout control
     * CRITICAL: Does NOT manually set Content-Type - browser adds boundary automatically
     * @private
     */
    _uploadWithProgress(endpoint, formData, timeout, onProgress) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const url = apiService.getFullUrl(endpoint);
            const token = localStorage.getItem('token');

            let isTimedOut = false;

            // Timeout handler - prevents EOFException from incomplete uploads
            const timeoutId = setTimeout(() => {
                isTimedOut = true;
                xhr.abort();
                reject(new Error('Upload timeout - file may be too large or connection is slow'));
            }, timeout);

            // Upload progress monitoring
            if (onProgress && xhr.upload) {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = Math.round((e.loaded / e.total) * 100);
                        onProgress(percentComplete);
                    }
                });
            }

            // Load handler (success response)
            xhr.addEventListener('load', () => {
                clearTimeout(timeoutId);

                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (e) {
                        // If response is plain text (just URL)
                        resolve(xhr.responseText);
                    }
                } else {
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        reject(new Error(errorData.message || `Upload failed with status ${xhr.status}`));
                    } catch (e) {
                        reject(new Error(`Upload failed with status ${xhr.status}`));
                    }
                }
            });

            // Error handler - network failures
            xhr.addEventListener('error', () => {
                clearTimeout(timeoutId);
                reject(new Error('Network error during upload'));
            });

            // Abort handler - user/browser cancellation
            xhr.addEventListener('abort', () => {
                clearTimeout(timeoutId);
                if (!isTimedOut) {
                    reject(new Error('Upload cancelled'));
                }
            });

            // Open connection
            xhr.open('POST', url);

            // Set authorization header ONLY
            // CRITICAL: Do NOT set Content-Type header manually
            // Browser will automatically set: Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }

            // Send FormData
            // Browser handles the multipart encoding with proper boundary
            xhr.send(formData);
        });
    },

    /**
     * Upload multiple images to the server
     * @param {File[]} files - Array of image files to upload
     * @param {Function} onProgress - Optional callback for overall progress
     *                                 Receives (overallProgress, fileIndex, fileProgress)
     * @returns {Promise<string[]>} Array of secure URLs of the uploaded images
     */
    async uploadMultipleImages(files, onProgress = null) {
        try {
            if (!files || files.length === 0) {
                throw new Error('No files provided for upload');
            }

            let completedUploads = 0;
            const totalFiles = files.length;

            // Create upload promises with individual progress tracking
            const uploadPromises = files.map((file, index) => {
                const fileProgress = onProgress ? (percent) => {
                    // Calculate overall progress across all files
                    const overallProgress = Math.round(
                        ((completedUploads + (percent / 100)) / totalFiles) * 100
                    );
                    onProgress(overallProgress, index, percent);
                } : null;

                return this.uploadImage(file, fileProgress).then(url => {
                    completedUploads++;
                    return url;
                });
            });

            // Upload all files in parallel
            const urls = await Promise.all(uploadPromises);
            return urls;
        } catch (error) {
            console.error('Error uploading multiple images:', error);
            throw new Error(error.message || 'Failed to upload images');
        }
    },

    /**
     * Upload with retry logic for network-unreliable scenarios
     * Useful for mobile connections or unstable networks
     * @param {File} file - The image file to upload
     * @param {Number} maxRetries - Maximum retry attempts (default: 3)
     * @param {Function} onProgress - Optional progress callback
     * @returns {Promise<string>} The secure URL of the uploaded image
     */
    async uploadWithRetry(file, maxRetries = 3, onProgress = null) {
        let lastError;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                console.log(`Upload attempt ${attempt + 1}/${maxRetries} for ${file.name}`);
                return await this.uploadImage(file, onProgress);
            } catch (error) {
                lastError = error;
                console.warn(`Upload attempt ${attempt + 1} failed:`, error.message);

                // Don't retry on validation errors (file type, size)
                if (error.message.includes('Only image files') ||
                    error.message.includes('size must be less than')) {
                    throw error;
                }

                // Wait before retry with exponential backoff (1s, 2s, 4s)
                if (attempt < maxRetries - 1) {
                    const delay = Math.pow(2, attempt) * 1000;
                    console.log(`Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw new Error(`Upload failed after ${maxRetries} attempts: ${lastError.message}`);
    }
};

export default imageService;
