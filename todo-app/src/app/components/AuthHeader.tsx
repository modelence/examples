'use client';

import { useSession, logout } from 'modelence/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthHeader() {
  const { user } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm mb-6">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-foreground hover:opacity-80">
          Todo App
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user.firstName || user.handle}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
