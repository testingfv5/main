import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  TagIcon,
  EyeIcon,
  CogIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Contenido', href: '/content', icon: DocumentTextIcon },
  { name: 'Promociones', href: '/promotions', icon: MegaphoneIcon },
  { name: 'Marcas', href: '/brands', icon: TagIcon },
  { name: 'Preview', href: '/preview', icon: EyeIcon },
  { name: 'Configuración', href: '/settings', icon: CogIcon },
];

const Sidebar = ({ onClose }) => {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 flex-shrink-0 items-center justify-between px-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OV</span>
            </div>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
            <p className="text-xs text-gray-500">Óptica Villalba</p>
          </div>
        </div>
        
        {/* Close button for mobile */}
        <button
          type="button"
          className="lg:hidden rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          onClick={onClose}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <div className="text-xs text-gray-500 text-center">
          <div className="font-medium">Versión 1.0.0</div>
          <div className="mt-1">Panel Administrativo</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;