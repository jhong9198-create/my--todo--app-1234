import { getTodos } from "@/app/actions";
import TodoForm from "@/app/components/TodoForm";
import TodoItem from "@/app/components/TodoItem";

export default async function Home() {
  const todos = await getTodos();
  const completed = todos?.filter((t) => t.is_completed).length ?? 0;
  const total = todos?.length ?? 0;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            My Todo
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {total}개 중 {completed}개 완료
          </p>
        </div>

        <TodoForm />

        {total === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-600 py-12">
            할 일이 없습니다. 위에서 추가해보세요!
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {todos?.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
