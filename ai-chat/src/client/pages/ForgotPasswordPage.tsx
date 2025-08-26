import { PasswordResetForm } from '@modelence/auth-ui';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-1 flex items-center justify-center">
        <PasswordResetForm
          renderLoginLink={({ className, children }) => (
            <Link to="/auth/login" className={className}>{children}</Link>
          )}
        />
      </div>
    </div>
  );
}
