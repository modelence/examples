import { Module } from 'modelence/server';
import { dbTodos } from './db';

export default new Module('todos', {
  stores: [dbTodos],
});
