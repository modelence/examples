import { NewPasswordForm } from '@modelence/auth-ui';
import { Link, useSearchParams } from 'react-router-dom';

export default function NewPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-1 flex items-center justify-center">
        <NewPasswordForm
          token={token}
          renderLoginLink={({ className, children }) => (
            <Link to="/auth/login" className={className}>{children}</Link>
          )}
        />
      </div>
    </div>
  );
}
