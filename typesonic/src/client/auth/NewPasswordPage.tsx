import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from 'modelence/client';

import { Page } from '@/client/layout/Page';
import { Card } from '@/client/ui/Card';

export default function NewPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  return (
    <Page>
      <NewPasswordForm token={token} />
    </Page>
  );
}

function NewPasswordForm({ token }: { token: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    
    const formData = new FormData(event.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    if (!token) {
      setError('Invalid or missing reset token.');
      setIsLoading(false);
      return;
    }
    
    try {
      await resetPassword({ token, password });
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError('Failed to reset password. The link may be expired or invalid.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <section>
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 mt-12">
          <Card className="bg-gradient-to-br from-white to-orange-50 w-full md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Password reset successful
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your password has been successfully reset. You will be redirected to the login page in a moment.
              </p>
              <div className="pt-4">
                <Link 
                  to="/login" 
                  className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Go to login now
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 mt-12">
        <Card className="bg-gradient-to-br from-white to-orange-50 w-full md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Set new password
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter your new password below.
            </p>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  New password
                </label>
                <input 
                  type="password" 
                  name="password" 
                  id="password" 
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  required
                  disabled={isLoading}
                  minLength={8}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Confirm new password
                </label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  id="confirmPassword" 
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  required
                  disabled={isLoading}
                  minLength={8}
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-1 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Setting password...' : 'Set new password'}
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Remember your password? <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign in</Link>
              </p>
            </form>
          </div>
        </Card>
      </div>
    </section>
  );
}
