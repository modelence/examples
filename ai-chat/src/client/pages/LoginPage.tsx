import { LoginForm } from '@modelence/auth-ui';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-1 flex items-center justify-center">
        <LoginForm
          renderSignupLink={({ className, children }) => (
            <Link to="/auth/signup" className={className}>{children}</Link>
          )}
          renderForgotPasswordLink={({ className, children }) => (
            <Link to="/auth/forgot-password" className={className}>
              {children}
            </Link>
          )}
        />
      </div>
    </div>
  );
}
