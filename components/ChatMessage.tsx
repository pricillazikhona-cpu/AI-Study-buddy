
import React from 'react';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  onReplayAudio: (text: string, messageId: string) => void;
  isCurrentlySpeaking?: boolean;
}

const SpeakerIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onReplayAudio, isCurrentlySpeaking }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex items-start gap-4 my-6 ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xl ${isModel ? 'bg-teal-500' : 'bg-blue-500'}`}>
        {isModel ? 'A' : 'U'}
      </div>
      <div className={`relative max-w-2xl rounded-2xl shadow-md transition-all duration-300 ${isModel ? 'bg-gray-700 text-gray-100' : 'bg-blue-600 text-white'} ${message.imageUrl ? 'p-2' : 'p-5'} ${isCurrentlySpeaking ? 'shadow-lg ring-4 ring-teal-400 ring-opacity-75' : ''}`}>
        {message.imageUrl && (
            <img 
                src={message.imageUrl} 
                alt={message.text || 'Generated image from AI'} 
                className="rounded-xl w-full h-auto" 
            />
        )}
        {message.text && (
            <p className={`text-xl whitespace-pre-wrap ${message.imageUrl ? 'p-3' : ''}`}>
                {message.text}
            </p>
        )}
        {isModel && message.text && (
          <button 
            onClick={() => onReplayAudio(message.text!, message.id)}
            className="absolute -bottom-4 -right-4 p-3 bg-gray-600 rounded-full text-gray-200 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-400 transition-colors"
            aria-label="Replay audio for this message"
          >
            <SpeakerIcon />
          </button>
        )}
      </div>
    </div>
  );
};
