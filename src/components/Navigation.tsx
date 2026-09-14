'use client';

import React from 'react';
import { Calendar, Map, Activity, BarChart2, Settings } from 'lucide-react';

export type ActiveTab = 'home' | 'curriculum' | 'feeling' | 'progress' | 'settings';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Today', icon: <Calendar size={18} /> },
    { id: 'curriculum', label: 'Curriculum', icon: <Map size={18} /> },
    { id: 'feeling', label: 'Feeling Lab', icon: <Activity size={18} /> },
    { id: 'progress', label: 'Analytics', icon: <BarChart2 size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
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
