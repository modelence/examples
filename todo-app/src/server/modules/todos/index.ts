import { Module } from "modelence/server";

const todosModule = new Module('todos', {
  configSchema: {
    dbUrl: {
      type: 'string',
      default: 'mongodb://localhost:27017/todos',
      isPublic: true,
    },
  }
});

export default todosModule;
