'use client';

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  isDisabled?: boolean;
}

export default function TodoItem({ todo, onToggle, isDisabled = false }: TodoItemProps) {
  return (
    <li className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors ${
      isDisabled 
        ? 'opacity-60 cursor-not-allowed' 
        : 'hover:bg-gray-100 dark:hover:bg-gray-600'
    }`}>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => !isDisabled && onToggle(todo)}
          disabled={isDisabled}
          className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <span className={`${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
          {todo.title}
        </span>
      </div>
      <span className={`px-2 py-1 text-xs rounded-full ${
        todo.completed 
          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
      }`}>
        {todo.completed ? 'Completed' : 'Pending'}
      </span>
    </li>
  );
}
