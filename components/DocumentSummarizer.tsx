import React, { useState, useCallback, useRef } from 'react';
import { summarizeDocument } from '../services/geminiService';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { extractTextFromFile } from '../utils/fileReader';

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

export const DocumentSummarizer: React.FC = () => {
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { speak, isSpeaking, speakingMessageId } = useTextToSpeech();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        const allowedTypes = [
            'text/plain',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (file && allowedTypes.includes(file.type)) {
            setDocumentFile(file);
            setError('');
            setSummary('');
        } else if (file) {
            setError('Please select a valid document file (.txt, .pdf, or .docx).');
            setDocumentFile(null);
        }
    };

    const handleSummarizeClick = useCallback(async () => {
        if (!documentFile || isLoading) return;

        setIsLoading(true);
        setError('');
        setSummary('');

        try {
            const documentText = await extractTextFromFile(documentFile);
            const result = await summarizeDocument(documentText);
            setSummary(result);
            speak(result, 'summary-result');
        } catch (err) {
            const errorMessage = (err as Error).message;
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [documentFile, isLoading, speak]);

    const resultId = 'summary-result';
    const isCurrentlySpeaking = isSpeaking && speakingMessageId === resultId;

    return (
        <div className="flex flex-col h-full bg-transparent text-white font-sans p-4 md:p-6 overflow-y-auto">
            <div className="max-w-4xl w-full mx-auto">
                <h2 className="text-3xl font-bold text-center text-gray-200 mb-6">Document Summarizer</h2>
                <div className="bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center gap-4">
                    <input
                        type="file"
                        accept=".txt,.pdf,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                        aria-label="Upload a document"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 w-full sm:w-auto bg-gray-700 text-gray-200 font-semibold py-3 px-4 rounded-xl border-2 border-dashed border-gray-600 hover:border-teal-500 transition-colors truncate"
                    >
                        {documentFile ? documentFile.name : 'Click to upload a document (.txt, .pdf, .docx)'}
                    </button>
                    <button
                        onClick={handleSummarizeClick}
                        disabled={!documentFile || isLoading}
                        className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Summarizing...' : 'Summarize'}
                    </button>
                </div>
                
                {error && <p className="text-red-400 text-center mt-6">{error}</p>}
                
                {isLoading && !summary && (
                    <div className="mt-6 bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-lg flex justify-center">
                        <LoadingSpinner />
                    </div>
                )}
                
                {summary && (
                    <div className={`relative mt-6 bg-gray-700/80 backdrop-blur-md text-gray-100 p-6 rounded-2xl shadow-lg transition-all duration-300 ${isCurrentlySpeaking ? 'ring-4 ring-teal-400 ring-opacity-75' : ''}`}>
                        <h3 className="text-xl font-semibold mb-3 text-teal-300">Summary</h3>
                        <p className="text-lg whitespace-pre-wrap">{summary}</p>
                         <button
                            onClick={() => speak(summary, resultId)}
                            className="absolute -bottom-4 -right-4 p-3 bg-gray-600 rounded-full text-gray-200 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-400 transition-colors"
                            aria-label="Read summary aloud"
                        >
                            <SpeakerIcon />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};