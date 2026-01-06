'use client';

import { useState, useRef, useEffect } from 'react';

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onEdit: (todo: Todo, newTitle: string) => void;
  onDelete: (todo: Todo) => void;
  isDisabled?: boolean;
}

export default function TodoItem({ todo, onToggle, onEdit, onDelete, isDisabled = false }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEditSubmit = () => {
    if (editValue.trim() && editValue !== todo.title) {
      onEdit(todo, editValue.trim());
    }
    setIsEditing(false);
    setEditValue(todo.title);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditValue(todo.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  return (
    <li className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors ${
      isDisabled
        ? 'opacity-60 cursor-not-allowed'
        : 'hover:bg-gray-100 dark:hover:bg-gray-600'
    }`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => !isDisabled && onToggle(todo)}
          disabled={isDisabled || isEditing}
          className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        />
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleEditCancel}
              className="flex-1 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                handleEditSubmit();
              }}
              className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 flex-shrink-0"
              title="Submit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        ) : (
          <span
            className={`flex-1 cursor-pointer ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}
            onClick={() => !isDisabled && setIsEditing(true)}
          >
            {todo.title}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        <span className={`px-2 py-1 text-xs rounded-full ${
          todo.completed
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
        }`}>
          {todo.completed ? 'Completed' : 'Pending'}
        </span>
        <button
          onClick={() => !isDisabled && onDelete(todo)}
          disabled={isDisabled || isEditing}
          className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </li>
  );
}
