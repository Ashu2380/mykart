import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';

function VisualSearch({ onResults, onSearchStart }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setPreviewImage(e.target.result);
        reader.readAsDataURL(file);

        // Process image for visual search
        await processVisualSearch(file);
    };

    const processVisualSearch = async (file) => {
        setIsProcessing(true);
        if (onSearchStart) {
            onSearchStart();
        }
        try {
            const formData = new FormData();
            formData.append('image', file);

            // For now, we'll simulate visual search with AI
            // In production, this would call a computer vision API
            const response = await fetch('http://localhost:8000/api/product/visual-search', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.similarProducts && data.similarProducts.length > 0) {
                onResults(data.similarProducts);
                toast.success(`Found ${data.similarProducts.length} similar products!`);

                // Redirect to collections page with search query
                setTimeout(() => {
                    window.location.href = `/collection?search=${encodeURIComponent(data.searchQuery || 'visual search')}`;
                }, 2000);
            } else {
                // No similar products found
                toast.info('No similar products found. Try uploading a different image.');
                onResults([]);
            }
        } catch (error) {
            console.error('Visual search error:', error);
           toast.error('Visual search failed. Please try again.');
           onResults([]);
        } finally {
            setIsProcessing(false);
        }
    };

    const clearImage = () => {
        setPreviewImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="visual-search-container">
            <div className="upload-area">
                {!previewImage ? (
                    <div
                        className="upload-zone"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="upload-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="upload-text">Click to upload an image</p>
                        <p className="upload-subtext">Find similar products by uploading a photo</p>
                    </div>
                ) : (
                    <div className="preview-container">
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="preview-image"
                        />
                        <div className="preview-actions">
                            <button
                                onClick={clearImage}
                                className="clear-btn"
                            >
                                ✕
                            </button>
                        </div>
                        {isProcessing && (
                            <div className="processing-overlay">
                                <div className="spinner"></div>
                                <p>Analyzing image...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            <style jsx>{`
                .visual-search-container {
                    max-width: 400px;
                    margin: 0 auto;
                }

                .upload-area {
                    border: 2px dashed #4a5568;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .upload-area:hover {
                    border-color: #63b3ed;
                    background-color: #f7fafc;
                }

                .upload-icon {
                    color: #a0aec0;
                    margin-bottom: 10px;
                }

                .upload-text {
                    font-size: 18px;
                    font-weight: 600;
                    color: #2d3748;
                    margin-bottom: 5px;
                }

                .upload-subtext {
                    font-size: 14px;
                    color: #718096;
                }

                .preview-container {
                    position: relative;
                    display: inline-block;
                }

                .preview-image {
                    max-width: 100%;
                    max-height: 300px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }

                .preview-actions {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                }

                .clear-btn {
                    background: rgba(239, 68, 68, 0.8);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                }

                .processing-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    color: white;
                }

                .spinner {
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin-bottom: 10px;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default VisualSearch;