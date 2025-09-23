import { create } from 'zustand';
import { ChatMessage } from '@/shared/types/chatMessage';

interface ChatState {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  
  clearMessages: () =>
    set(() => ({
      messages: [],
    })),
}));