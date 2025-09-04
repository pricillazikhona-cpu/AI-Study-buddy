
import { useState, useCallback, useEffect } from 'react';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const speak = useCallback((text: string, messageId: string) => {
    if (!window.speechSynthesis) {
      console.warn('Text-to-speech not supported in this browser.');
      return;
    }
    
    // Cancel any ongoing speech before starting a new one
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingMessageId(messageId);
    };
    utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
    };
    utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
    };
    
    window.speechSynthesis.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { isSpeaking, speakingMessageId, speak, cancel };
};
