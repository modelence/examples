import TodoApp from './components/TodoApp';
import AuthHeader from './components/AuthHeader';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <AuthHeader />
      <div className="py-8">
        <TodoApp />
      </div>
    </div>
  );
}
