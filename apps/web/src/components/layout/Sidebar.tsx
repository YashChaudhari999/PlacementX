import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export interface SidebarItemType {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
}

export interface SidebarGroupType {
  title?: string;
  items: SidebarItemType[];
}

export interface SidebarProps {
  groups: SidebarGroupType[];
  logo?: React.ReactNode;
  footer?: React.ReactNode;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  onItemClick?: () => void; // Used for mobile to close the sidebar on click
}

export const Sidebar = ({
  groups,
  logo,
  footer,
  isCollapsed = false,
  onToggleCollapse,
  className = '',
  onItemClick,
}: SidebarProps) => {
  const location = useLocation();

  return (
    <div
      className={`flex flex-col h-full bg-card border-r border-border shadow-sm transition-all duration-300 ${
        isCollapsed ? 'w-[80px]' : 'w-[280px]'
      } ${className}`}
    >
      {/* Header / Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
        <div
          className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}
        >
          {logo}
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-6 scrollbar-hide">
        {groups.map((group, gIdx) => (
          <div key={gIdx} className="flex flex-col gap-1">
            {/* Group Title */}
            {!isCollapsed && group.title && (
              <span className="px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {group.title}
              </span>
            )}

            {/* Group Items */}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onItemClick}
                  title={isCollapsed ? item.name : undefined}
                  className={`group flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 relative ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  } ${isCollapsed ? 'justify-center' : 'gap-3'}`}
                >
                  {/* Active Indicator Line (Left) */}
                  {isActive && (
                    <motion.div
                      layoutId={`active-nav-indicator-${isCollapsed ? 'collapsed' : 'expanded'}`}
                      className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-full"
                    />
                  )}

                  <Icon
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                      isActive ? 'text-primary' : 'group-hover:scale-110'
                    }`}
                  />

                  {!isCollapsed && <span className="flex-1 truncate">{item.name}</span>}

                  {!isCollapsed && item.badge !== undefined && item.badge !== 0 && (
                    <span
                      className={`ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-destructive text-destructive-foreground'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Simple Tooltip for Collapsed State */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 hidden group-hover:block z-50">
                      <div className="bg-popover text-popover-foreground text-xs font-medium px-2 py-1 rounded shadow-md whitespace-nowrap border border-border">
                        {item.name}
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Area */}
      {footer && <div className="p-4 border-t border-border shrink-0">{footer}</div>}
    </div>
  );
};
