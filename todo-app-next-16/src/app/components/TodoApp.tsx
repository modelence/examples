'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { getAllTodos, setCompleted as setCompletedAction } from '@/server/todos/actions';
import TodoList from './TodoList';

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
}

export default function TodoApp() {
  const { data: todos, refetch: refetchTodos, isFetching, error } = useQuery({
    queryKey: ['todos'],
    queryFn: getAllTodos,
  });
  const { mutateAsync: setCompleted } = useMutation({
    mutationFn: setCompletedAction,
  });

  if (error) return <div>Error: {error.message}</div>;
  if (!todos && !isFetching) return <div>No todos found</div>;

  const toggleTodo = async (todo: Todo) => {
    await setCompleted({ id: todo._id, completed: !todo.completed });
    refetchTodos();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-foreground">My Todo List</h1>
      {isFetching && !todos ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <div>Loading...</div>
        </div>
      ) : (
        <TodoList todos={todos || []} onToggleTodo={toggleTodo} isLoading={isFetching} />
      )}
    </div>
  );
}
