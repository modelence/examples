export type ChatMessage = {
    projectId: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
};
