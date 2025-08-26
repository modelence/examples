import { Store, schema } from 'modelence/server';

export const dataApiTokens = new Store('dataApiTokens', {
  schema: {
    token: schema.string(),
    type: schema.enum(['access', 'refresh']),
    expiresAt: schema.date(),
  },
  indexes: [
    { key: { token: 1 }, unique: true },
    { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
  ],
});
