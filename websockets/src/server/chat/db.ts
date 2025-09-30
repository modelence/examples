import { time } from 'modelence';
import { Store, schema } from 'modelence/server';

export const dbGuests = new Store('guests', {
  schema: {
    name: schema.string(),
    lastSeenAt: schema.date(),
    createdAt: schema.date(),
  },
  indexes: [{
    key: { lastSeenAt: 1 },
    expireAfterSeconds: time.hours(1),
  }],
});

export const dbMessages = new Store('messages', {
  schema: {
    guestId: schema.objectId(),
    content: schema.string(),
    createdAt: schema.date(),
  },
  indexes: [{
    key: { createdAt: 1 },
    expireAfterSeconds: time.hours(1),
  }],
});
