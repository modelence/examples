import { PasswordResetForm } from '@modelence/auth-ui';
import { Link } from 'react-router-dom';
import { Page } from '../layout/Page';

export default function ForgotPasswordPage() {
  return (
    <Page>
      <div className="flex-1 justify-center flex flex-col w-[500px]">
        <div className="flex-1 flex items-center justify-center">
          <PasswordResetForm
            renderLoginLink={({ className, children }) => (
              <Link to="/login" className={className}>{children}</Link>
            )}
          />
        </div>
      </div>
    </Page>
  );
}
