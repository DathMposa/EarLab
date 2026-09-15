'use client';

import React from 'react';
import { House, BookOpen, Activity, BarChart3, FolderOpen } from 'lucide-react';

export type ActiveTab = 'home' | 'curriculum' | 'feeling' | 'progress' | 'settings';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Today', icon: <House size={18} /> },
    { id: 'curriculum', label: 'Learn', icon: <BookOpen size={18} /> },
    { id: 'feeling', label: 'Train', icon: <Activity size={18} /> },
    { id: 'progress', label: 'Progress', icon: <BarChart3 size={18} /> },
    { id: 'settings', label: 'Library', icon: <FolderOpen size={18} /> },
  ];

  return (
    <nav className="mobile-nav-bottom">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            className={isActive ? 'active' : ''}
            onClick={() => onTabChange(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
