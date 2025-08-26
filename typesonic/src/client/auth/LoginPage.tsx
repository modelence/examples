import { LoginForm } from '@modelence/auth-ui';
import { Link, Navigate } from 'react-router-dom';
import { Page } from '../layout/Page';
import { useSession } from 'modelence/client';

export default function LoginPage() {
  const { user } = useSession();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Page>
      <div className="flex-1 justify-center flex flex-col w-[500px]">
        <div className="flex-1 flex items-center justify-center">
          <LoginForm
            renderSignupLink={({ className, children }) => (
              <Link to="/signup" className={className}>{children}</Link>
            )}
            renderForgotPasswordLink={({ className, children }) => (
              <Link to="/forgot-password" className={className}>
                {children}
              </Link>
            )}
          />
        </div>
      </div>
    </Page>
  );
}
