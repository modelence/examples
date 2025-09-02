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
    <div className="bg-gradient-to-r from-orange-50 to-blue-50 h-16 px-6 py-3 flex justify-between items-center border-b border-orange-100 shadow-sm">
      <Link to="/" className="flex items-center space-x-2 group">
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
          <span className="text-white font-bold text-sm">⚡</span>
        </div>
        <span className="font-bold text-lg bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
          Typesonic
        </span>
      </Link>
      {user ? (
        <div className="relative group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-200 to-blue-200 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 shadow-md">
            {user.handle[0].toUpperCase()}
          </div>
          
          <UserMenu />
        </div>
      ) : (
        <Link 
          to="/login" 
          className="px-4 py-2 border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 hover:text-orange-700 hover:border-orange-600 transition-all duration-200 font-medium"
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
      <Link to={to} className="block px-4 py-2 hover:bg-orange-50 hover:text-orange-700 transition-colors duration-200">{children}</Link>
    </li>
  );

  return (
    <div className="absolute right-0 mt-2 bg-white divide-y divide-gray-100 rounded-xl shadow-lg border border-orange-100 w-48 z-10 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200">
      <div className="px-4 py-3 text-sm text-gray-900 bg-gradient-to-r from-orange-50 to-blue-50 rounded-t-xl">
        <div className="font-medium text-orange-800">{user.handle.split('@')[0]}</div>
        <div className="truncate text-gray-600">{user.handle}</div>
      </div>

      <ul className="py-2 text-sm text-gray-700">
        <MenuItem to="/profile">📊 Profile</MenuItem>
        <MenuItem to="/account">⚙️ Account Settings</MenuItem>
        <MenuItem to="/typing-history">📈 Typing History</MenuItem>
      </ul>

      <div className="py-1">
        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors duration-200"
        >
          🚪 Sign out
        </button>
      </div>
    </div>
  );
}
