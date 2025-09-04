import React, { useState, useCallback, useRef } from 'react';
import { analyzeImage } from '../services/geminiService';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { readFileAsDataURL } from '../utils/fileReader';

const SpeakerIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  </svg>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center gap-2">
        <div className="w-3 h-3 bg-teal-300 rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-teal-300 rounded-full animate-pulse [animation-delay:0.2s]"></div>
        <div className="w-3 h-3 bg-teal-300 rounded-full animate-pulse [animation-delay:0.4s]"></div>
    </div>
);

export const ImageAnalyzer: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { speak, isSpeaking, speakingMessageId } = useTextToSpeech();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            setError('');
            setAnalysis('');
            readFileAsDataURL(file)
                .then(setImagePreview)
                .catch(() => setError("Could not read the selected image."));
        } else {
            setError('Please select a valid image file (e.g., PNG, JPG).');
            setImageFile(null);
            setImagePreview(null);
        }
    };
    
    const handleAnalyzeClick = useCallback(async () => {
        if (!imageFile || !prompt.trim() || isLoading) return;

        setIsLoading(true);
setError('');
        setAnalysis('');

        try {
            const base64Image = await readFileAsDataURL(imageFile);
            const result = await analyzeImage(base64Image, imageFile.type, prompt);
            setAnalysis(result);
            speak(result, 'analysis-result');
        } catch (err) {
            const errorMessage = (err as Error).message;
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [imageFile, prompt, isLoading, speak]);

    const resultId = 'analysis-result';
    const isCurrentlySpeaking = isSpeaking && speakingMessageId === resultId;

    return (
        <div className="flex flex-col h-full bg-transparent text-white font-sans p-4 md:p-6 overflow-y-auto">
            <div className="max-w-4xl w-full mx-auto">
                <h2 className="text-3xl font-bold text-center text-gray-200 mb-6">Picture Analyzer</h2>
                <div className="bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-600 rounded-xl bg-gray-700/60 hover:border-teal-500 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                ref={fileInputRef}
                                aria-label="Upload an image"
                            />
                            {imagePreview ? (
                                <img src={imagePreview} alt="Selected preview" className="max-h-full max-w-full object-contain rounded-lg" />
                            ) : (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-gray-400 text-center p-4"
                                >
                                    <p className="font-semibold text-teal-400">Click to upload an image</p>
                                    <p className="text-sm mt-1">PNG, JPG, GIF, etc.</p>
                                </button>
                            )}
                        </div>
                        <div className="flex flex-col gap-4">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="What do you want to know about the image?"
                                rows={4}
                                className="w-full bg-gray-700 text-gray-200 placeholder-gray-400 text-lg rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Question about the image"
                            />
                            <button
                                onClick={handleAnalyzeClick}
                                disabled={!imageFile || !prompt.trim() || isLoading}
                                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                            >
                                {isLoading ? 'Analyzing...' : 'Analyze Picture'}
                            </button>
                        </div>
                    </div>
                </div>

                {error && <p className="text-red-400 text-center mt-6">{error}</p>}
                
                {isLoading && !analysis && (
                    <div className="mt-6 bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-lg flex justify-center">
                       <LoadingSpinner />
                    </div>
                )}
                
                {analysis && (
                     <div className={`relative mt-6 bg-gray-700/80 backdrop-blur-md text-gray-100 p-6 rounded-2xl shadow-lg transition-all duration-300 ${isCurrentlySpeaking ? 'ring-4 ring-teal-400 ring-opacity-75' : ''}`}>
                        <h3 className="text-xl font-semibold mb-3 text-teal-300">Analysis Result</h3>
                        <p className="text-lg whitespace-pre-wrap">{analysis}</p>
                        <button
                            onClick={() => speak(analysis, resultId)}
                            className="absolute -bottom-4 -right-4 p-3 bg-gray-600 rounded-full text-gray-200 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-400 transition-colors"
                            aria-label="Read analysis aloud"
                        >
                            <SpeakerIcon />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};