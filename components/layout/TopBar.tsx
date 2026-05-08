'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

export function TopBar({ onMenuClick, title }: TopBarProps) {
  const { user, signOut } = useAuth();
  const { isLowCognitiveLoad, isMinimalText, isStepByStep } = useAccessibility();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const modeBadge = isStepByStep
    ? 'Step-by-step mode'
    : isLowCognitiveLoad
      ? 'Focused mode'
      : isMinimalText
        ? 'Minimal text mode'
        : null;

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        {title && (
          <h1 className="text-lg font-semibold text-foreground hidden sm:block">{title}</h1>
        )}
        {modeBadge && (
          <span className="hidden rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary md:inline-flex">
            {modeBadge}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-9 px-2 hover:bg-muted"
              aria-label="User menu"
            >
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-semibold text-primary-foreground">{initials}</span>
              </div>
              <span className={`${isMinimalText ? 'hidden' : 'hidden sm:block'} text-sm font-medium max-w-32 truncate`}>
                {displayName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
              <User className="w-4 h-4 mr-2" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
