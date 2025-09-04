import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Message } from '../types';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { generateResponse, getInitialGreeting, generateImage } from '../services/geminiService';
import { ChatMessage } from './ChatMessage';
import { Controls } from './Controls';

const Welcome: React.FC = () => (
    <div className="text-center text-gray-400 my-auto flex flex-col items-center justify-center h-full">
        <div className="w-24 h-24 bg-teal-500 rounded-full flex items-center justify-center text-5xl font-bold mb-4">
            A
        </div>
        <h1 className="text-4xl font-bold text-gray-200">Hi! I'm Alex.</h1>
        <p className="text-xl mt-2">Your AI Study Buddy.</p>
        <p className="text-lg mt-8">Type a message below or tap the microphone to start our conversation.</p>
    </div>
);

export const StudyBuddyChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { speakingMessageId, speak } = useTextToSpeech();
  
  const { isListening, startListening, stopListening } = useSpeechToText(setInputText);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const fetchGreeting = async () => {
      const greetingText = await getInitialGreeting();
      const initialMessage: Message = {
        id: 'initial-greeting',
        role: 'model',
        text: greetingText,
      };
      setMessages([initialMessage]);
      speak(greetingText, initialMessage.id);
      setIsLoading(false);
    };

    fetchGreeting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const handleSendMessage = useCallback(async () => {
    const textToSend = inputText.trim();
    if (!textToSend || isLoading) {
      setInputText('');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    const imageKeywords = ['draw', 'create a picture', 'generate an image', 'show me a picture', 'picture of', 'image of', 'create an image'];
    const isImageRequest = imageKeywords.some(keyword => textToSend.toLowerCase().includes(keyword));

    if (isImageRequest) {
        try {
            const imageUrl = await generateImage(textToSend);
            const confirmationText = "Here is the image you requested.";
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: confirmationText,
                imageUrl: imageUrl,
            };
            setMessages(prev => [...prev, aiMessage]);
            speak(confirmationText, aiMessage.id);
        } catch (error) {
            const errorMessage = (error as Error).message || "An unknown error occurred while generating the image.";
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: errorMessage,
            };
            setMessages(prev => [...prev, aiMessage]);
            speak(errorMessage, aiMessage.id);
        }
    } else {
        const aiResponseText = await generateResponse(textToSend);
        const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: aiResponseText,
        };
        setMessages(prev => [...prev, aiMessage]);
        speak(aiResponseText, aiMessage.id);
    }

    setIsLoading(false);
  }, [inputText, isLoading, speak]);
  
  const handleMicClick = () => {
      if (isLoading) return;
      if (isListening) {
          stopListening();
      } else {
          setInputText(''); // Clear text before starting to listen
          startListening();
      }
  };

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-y-auto p-4 md:p-6" role="log" aria-live="polite">
        <div className="max-w-4xl mx-auto h-full">
          {messages.length === 0 && !isLoading ? <Welcome /> : messages.map((msg) => (
            <ChatMessage 
              key={msg.id} 
              message={msg} 
              onReplayAudio={speak} 
              isCurrentlySpeaking={speakingMessageId === msg.id}
            />
          ))}
          {isLoading && messages.length > 0 && (
             <div className="flex items-start gap-4 my-6 flex-row">
                <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold bg-teal-500 text-xl">A</div>
                <div className="max-w-xl p-5 rounded-2xl shadow-md bg-gray-700 text-gray-100">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 bg-teal-300 rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-teal-300 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-3 h-3 bg-teal-300 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <Controls 
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onSend={handleSendMessage}
        onMicClick={handleMicClick}
        isListening={isListening}
        isLoading={isLoading}
      />
    </div>
  );
};
