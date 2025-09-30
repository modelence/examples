import { Module, ObjectId } from 'modelence/server';
import z from "zod";
import { chatServerChannel } from './channels';
import { dbGuests, dbMessages } from './db';

export default new Module('chat', {
  stores: [
    dbGuests,
    dbMessages,
  ],
  channels: [
    chatServerChannel
  ],
  queries: {
    readGuests: async () => {
      return await dbGuests.fetch({}, {
        sort: {
          lastSeenAt: -1
        }
      });
    },
    readMessages: async () => {
      return await dbMessages.fetch({}, {
        sort: {
          createdAt: 1 
        }
      });
    },
  },
  mutations: {
    addGuest: async (args) => {
      const now = new Date();
      const { name } = z.object({
        name: z.string(),
      }).parse(args);
      const result = await dbGuests.insertOne({
        name,
        lastSeenAt: now,
        createdAt: now,
      });
      return result.insertedId;
    },
    sendMessage: async (args) => {
      const { guestId, content } = z.object({
        guestId: z.string(),
        content: z.string(),
      }).parse(args);
      
      const result = await dbMessages.insertOne({
        guestId: new ObjectId(guestId),
        content,
        createdAt: new Date(),
      });
      return result.insertedId;
    },
  },
});
