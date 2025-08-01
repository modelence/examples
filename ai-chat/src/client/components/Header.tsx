import { UserMenu } from '@modelence/auth-ui';
import { Link } from 'react-router-dom';
import logo from '@/client/assets/icon.svg';

export default function Header() {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <img src={logo} alt="Modelence Logo" className="w-8 h-8" />
        <span className="text-lg font-semibold text-gray-800">Agent Chat</span>
      </Link>
      <UserMenu
        menuItems={[
          {
            href: '/profile',
            label: 'Profile',
          },
        ]}
        renderLink={({ href, className, children }) => (
          <Link to={href} className={className}>{children}</Link>
        )}
      />
    </div>
  );
}
