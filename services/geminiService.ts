import { GoogleGenAI, Chat } from "@google/genai";

let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;

const getAiInstance = (): GoogleGenAI => {
  if (ai) {
    return ai;
  }
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai;
};


const initializeChat = (): Chat => {
  if (chat) {
    return chat;
  }
  
  const aiInstance = getAiInstance();
  const systemInstruction = `You are a friendly and patient AI study buddy named 'Alex'. Your goal is to help users learn and understand topics. You are specifically designed to assist users who may have visual or auditory impairments. Follow these rules strictly:
1. Keep your responses clear, concise, and easy to understand.
2. Break down complex topics into simple, digestible steps.
3. When you provide a response, imagine it's being read aloud. Structure your sentences for clarity in audio format.
4. Be encouraging and supportive.
5. Start your very first message with a warm welcome and introduce yourself.`;

  chat = aiInstance.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
  });

  return chat;
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const aiInstance = getAiInstance();
        const response = await aiInstance.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
           throw new Error("The model did not return an image. Please try a different prompt.");
        }

        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;

    } catch (error) {
        console.error("Error generating image from Gemini:", error);
        throw new Error("I'm sorry, I couldn't create that image. Please try a different description.");
    }
};

export const generateResponse = async (prompt: string): Promise<string> => {
  try {
    const chatInstance = initializeChat();
    const result = await chatInstance.sendMessage({ message: prompt });
    return result.text;
  } catch (error) {
    console.error("Error generating response from Gemini:", error);
    return "I'm sorry, I encountered an issue while trying to respond. Please check your connection or API key and try again.";
  }
};

export const getInitialGreeting = async (): Promise<string> => {
    try {
        const chatInstance = initializeChat();
        const result = await chatInstance.sendMessage({ message: "Hello, introduce yourself as per your instructions." });
        return result.text;
    } catch (error) {
        console.error("Error getting initial greeting from Gemini:", error);
        return "Hello! I'm Alex, your AI study buddy. I seem to be having a little trouble connecting right now, but I'm here to help you learn.";
    }
};

export const summarizeDocument = async (documentText: string): Promise<string> => {
    try {
        const aiInstance = getAiInstance();
        const prompt = `Please provide a concise summary of the following document:\n\n${documentText}`;
        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing document with Gemini:", error);
        throw new Error("I'm sorry, I couldn't summarize the document. Please try again.");
    }
};

export const analyzeImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const aiInstance = getAiInstance();
        
        const base64Data = base64Image.split(',')[1];
        if (!base64Data) {
            throw new Error("Invalid Base64 image data provided.");
        }

        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: base64Data,
            },
        };
        const textPart = { text: prompt };

        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Error analyzing image with Gemini:", error);
        throw new Error("I'm sorry, I couldn't analyze the image. Please check the image format or try a different question.");
    }
};
