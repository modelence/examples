import dbTodos from '../stores/dbTodos';

export default async function getAll() {
  return await dbTodos.fetch({});
}
