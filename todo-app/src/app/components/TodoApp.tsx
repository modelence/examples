'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { todos as todosModule } from '@modelence/modules';
import AddTodoForm from './AddTodoForm';
import TodoList from './TodoList';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
}

export default function TodoApp() {
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);

  const { data: todos, refetch: refetchTodos, isFetching, error } = useQuery(todosModule.query('getAll'));
  const { mutateAsync: setCompleted } = useMutation(todosModule.mutation('setCompleted'));
  const { mutateAsync: createTodo } = useMutation(todosModule.mutation('create'));
  const { mutateAsync: updateTodo } = useMutation(todosModule.mutation('update'));
  const { mutateAsync: deleteTodo } = useMutation(todosModule.mutation('delete'));

  todosModule.getConfig('dbUrl'); // Example of accessing module config

  if (error) return <div>Error: {error.message}</div>;

  const handleAddTodo = async (title: string) => {
    await createTodo({ title });
    refetchTodos();
  };

  const handleToggleTodo = async (todo: Todo) => {
    await setCompleted({ id: todo._id, completed: !todo.completed });
    refetchTodos();
  };

  const handleEditTodo = async (todo: Todo, newTitle: string) => {
    await updateTodo({ id: todo._id, title: newTitle });
    refetchTodos();
  };

  const handleDeleteTodo = (todo: Todo) => {
    setTodoToDelete(todo);
  };

  const confirmDelete = async () => {
    if (todoToDelete) {
      await deleteTodo({ id: todoToDelete._id });
      setTodoToDelete(null);
      refetchTodos();
    }
  };

  const cancelDelete = () => {
    setTodoToDelete(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-foreground">My Todo List</h1>

      <AddTodoForm onAdd={handleAddTodo} isLoading={isFetching} />

      {isFetching && !todos ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <div>Loading...</div>
        </div>
      ) : (
        <TodoList
          todos={todos || []}
          onToggleTodo={handleToggleTodo}
          onEditTodo={handleEditTodo}
          onDeleteTodo={handleDeleteTodo}
          isLoading={isFetching}
        />
      )}

      <DeleteConfirmationModal
        isOpen={!!todoToDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        todoTitle={todoToDelete?.title || ''}
      />
    </div>
  );
}
