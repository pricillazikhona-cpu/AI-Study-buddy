import React, { useRef, useLayoutEffect } from 'react';

const MicIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm5 2a1 1 0 11-2 0V4a1 1 0 112 0v2zM4 8a1 1 0 011 1v1a4 4 0 008 0V9a1 1 0 112 0v1a6 6 0 01-5 5.91V18h2a1 1 0 110 2H7a1 1 0 110-2h2v-2.09A6 6 0 013 10V9a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const SendIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);


interface ControlsProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onMicClick: () => void;
  isListening: boolean;
  isLoading: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ value, onChange, onSend, onMicClick, isListening, isLoading }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasText = value.trim().length > 0;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height to allow shrinking
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (hasText && !isLoading) {
        onSend();
      }
    }
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-md border-t border-gray-700/80 pt-4 pb-4 sm:pb-6 px-4">
        <div className="max-w-4xl mx-auto flex items-end gap-2">
            <div className="flex-1 relative">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    placeholder={isListening ? "Listening..." : "Type or tap mic..."}
                    rows={1}
                    className="w-full bg-gray-700 text-gray-200 placeholder-gray-400 text-lg rounded-2xl py-3 px-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    aria-label="Chat input"
                />
            </div>
            <button
                onClick={hasText ? onSend : onMicClick}
                disabled={isLoading}
                className={`w-14 h-14 rounded-full text-white relative flex items-center justify-center flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 ${
                    isListening ? 'bg-red-600' : (hasText ? 'bg-green-600' : 'bg-blue-600')
                }`}
                aria-label={hasText ? 'Send message' : (isListening ? 'Stop listening' : 'Start listening')}
            >
                {isListening && <span className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></span>}
                {hasText ? <SendIcon /> : <MicIcon />}
            </button>
        </div>
    </div>
  );
};