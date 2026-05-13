"use client";

import { Todo } from "@/types/todo";
import { toggleTodo, deleteTodo } from "@/app/actions";

export default function TodoItem({ todo }: { todo: Todo }) {
  return (
    <li className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 group">
      <input
        type="checkbox"
        checked={todo.is_completed}
        onChange={() => toggleTodo(todo.id, todo.is_completed)}
        className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
      />
      <span
        className={`flex-1 text-gray-800 dark:text-gray-200 ${
          todo.is_completed ? "line-through text-gray-400 dark:text-gray-500" : ""
        }`}
      >
        {todo.title}
      </span>
      <button
        onClick={() => deleteTodo(todo.id)}
        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all text-sm px-2 py-1 rounded"
      >
        삭제
      </button>
    </li>
  );
}
