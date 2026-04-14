import { Store, schema } from 'modelence/server';

export default new Store('todos', {
  schema: {
    title: schema.string(),
    completed: schema.boolean(),
    luckyNumber: schema.number(),
  },
  indexes: [
    { key: { luckyNumber: 1 }, sparse: true },
  ],
});
