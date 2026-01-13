import { Store, schema } from 'modelence/server';

export const dbTodos = new Store('todos', {
  schema: {
    title: schema.string(),
    completed: schema.boolean(),
  },
  indexes: []
});
