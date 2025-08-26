import { NewPasswordForm } from '@modelence/auth-ui';
import { Link, useSearchParams } from 'react-router-dom';
import { Page } from '../layout/Page';

export default function NewPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  return (
    <Page>
      <div className="flex-1 justify-center flex flex-col w-[500px]">
        <NewPasswordForm
          token={token}
          renderLoginLink={({ className, children }) => (
            <Link to="/login" className={className}>{children}</Link>
          )}
        />
      </div>
    </Page>
  );
}
