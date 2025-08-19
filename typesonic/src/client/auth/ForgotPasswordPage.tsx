import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendResetPasswordToken } from 'modelence/client';

import { Page } from '@/client/layout/Page';
import { Card } from '@/client/ui/Card';

export default function ForgotPasswordPage() {
  return (
    <Page>
      <ForgotPasswordForm />
    </Page>
  );
}

function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    
    try {
      await sendResetPasswordToken({ email });
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <section>
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 mt-12">
          <Card className="bg-gradient-to-br from-white to-orange-50 w-full md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Check your email
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
              </p>
              <div className="pt-4">
                <Link 
                  to="/login" 
                  className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Back to login
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
              Reset your password
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Your email
                </label>
                <input 
                  type="email" 
                  name="email" 
                  id="email" 
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  required
                  disabled={isLoading}
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
                {isLoading ? 'Sending...' : 'Send reset link'}
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
