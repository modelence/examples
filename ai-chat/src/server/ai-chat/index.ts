import { Module, ObjectId, UserInfo } from 'modelence/server';
import { generateText } from '@modelence/ai';
import { dbChats, dbMessages } from './db';
import { z } from 'zod';

export default new Module('aiChat', {
  stores: [dbChats, dbMessages],
  queries: {
    async getChats(args, { user: _user }) {
      const user = requireUser(_user);
      return dbChats.fetch({ userId: new ObjectId(user.id) }, {
        sort: { createdAt: -1 },
      });
    },
    async getMessages(args, { user: _user }) {
      const user = requireUser(_user);
      const { chatId } = z.object({
        chatId: z.string(),
      }).parse(args);

      const chat = await dbChats.findOne({
        _id: new ObjectId(chatId),
        userId: new ObjectId(user.id),
      });

      if (!chat) {
        throw new Error('Chat not found');
      }

      const messages = await dbMessages.fetch(
        { 
          userId: new ObjectId(user.id),
          chatId: new ObjectId(chatId),
        },
        {
          sort: { createdAt: 1 },
        }
      );

      return {
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        chatTitle: chat.title,
      };
    },
  },
  mutations: {
    async generateResponse(args, { user: _user }) {
      const user = requireUser(_user);

      const { chatId: existingChatId, messages } = z.object({
        chatId: z.string().optional(),
        messages: z.array(z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })),
      }).parse(args);

      const contextMessages = messages.slice(-10);

      const response = await generateText({
        provider: 'openai',
        model: 'gpt-4o',
        messages: contextMessages,
      });

      const lastMessage = messages[messages.length - 1];
      const chatId = existingChatId ?? await createNewChat(user, lastMessage.content);
      await dbMessages.insertMany([{
        userId: new ObjectId(user.id),
        chatId: new ObjectId(chatId),
        role: 'user',
        content: lastMessage.content,
        createdAt: new Date(Date.now() - 1),
      }, {
        userId: new ObjectId(user.id),
        chatId: new ObjectId(chatId),
        role: 'assistant',
        content: response.text,
        createdAt: new Date(),
      }]);

      return {
        role: 'assistant',
        content: response.text,
        chatId,
      };
    },
  },
});

async function createNewChat(user: UserInfo, firstMessage: string) {
  const { insertedId } = await dbChats.insertOne({
    userId: new ObjectId(user?.id),
    title: firstMessage.length > 20 ? firstMessage.slice(0, 20) + '...' : firstMessage,
    createdAt: new Date(),
  });
  return insertedId.toString();
}

function requireUser(user: UserInfo | null): UserInfo {
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}