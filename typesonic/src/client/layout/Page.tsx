import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { useSession, logout } from 'modelence/client';
import { cn } from '../utils/cn';

export function Page({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className={cn("max-w-[1040px] px-5 py-3 mx-auto flex-1 flex flex-col", className)}>
        {children}
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

function Header() {
  const { user } = useSession();
  
  return (
    <div className="bg-orange-50 h-14 px-4 py-2 flex justify-between items-center">
      <Link to="/">Home</Link>
      {user ? (
        <div className="relative group">
          <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center cursor-pointer">
            {user.handle[0].toUpperCase()}
          </div>
          
          <UserMenu />
        </div>
      ) : (
        <Link 
          to="/login" 
          className="px-4 py-2 border border-orange-500 text-orange-500 rounded-md hover:bg-orange-100 hover:text-orange-600 hover:border-orange-600 transition-colors duration-200"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}

function UserMenu() {
  const { user } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const MenuItem = ({ children, to }: { children: React.ReactNode, to: string }) => (
    <li>
      <Link to={to} className="block px-4 py-2 hover:bg-gray-100">{children}</Link>
    </li>
  );

  return (
    <div className="absolute right-0 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 z-10 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200">
      <div className="px-4 py-3 text-sm text-gray-900">
        <div className="font-medium">{user.handle.split('@')[0]}</div>
        <div className="truncate text-gray-500">{user.handle}</div>
      </div>

      <ul className="py-2 text-sm text-gray-700">
        <MenuItem to="/profile">Profile</MenuItem>
        <MenuItem to="/account">Account Settings</MenuItem>
        <MenuItem to="/typing-history">Typing History</MenuItem>
      </ul>

      <div className="py-1">
        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
