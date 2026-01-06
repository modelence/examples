'use client';

import TodoItem from './TodoItem';

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
}

interface TodoListProps {
  todos: Todo[];
  onToggleTodo: (todo: Todo) => void;
  onEditTodo: (todo: Todo, newTitle: string) => void;
  onDeleteTodo: (todo: Todo) => void;
  isLoading?: boolean;
}

export default function TodoList({ todos, onToggleTodo, onEditTodo, onDeleteTodo, isLoading = false }: TodoListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {todos.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No todos yet. Add one above to get started!
        </p>
      ) : (
        <ul className="space-y-3">
          {todos.map((todo, index) => (
            <TodoItem
              key={todo._id || index}
              todo={todo}
              onToggle={onToggleTodo}
              onEdit={onEditTodo}
              onDelete={onDeleteTodo}
              isDisabled={isLoading}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
