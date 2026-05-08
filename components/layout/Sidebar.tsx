'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import {
  LayoutDashboard,
  User,
  FileText,
  Sparkles,
  Briefcase,
  Settings,
  ClipboardList,
  KeyRound,
  X,
  ListChecks,
  Mic,
  Shield,
  Scale,
  BarChart2,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/profile', icon: User, label: 'My Profile' },
  { href: '/dashboard/cv', icon: FileText, label: 'CV Builder' },
  { href: '/dashboard/cv/generate', icon: Sparkles, label: 'AI CV Generator' },
  { href: '/dashboard/internships', icon: Briefcase, label: 'Internships' },
  { href: '/dashboard/applications', icon: ListChecks, label: 'Applications' },
  { href: '/dashboard/interview', icon: Mic, label: 'Interview Practice' },
  { href: '/dashboard/accessibility', icon: Settings, label: 'Accessibility' },
  { href: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/dashboard/data', icon: Shield, label: 'Data & Privacy' },
  { href: '/ethics', icon: Scale, label: 'Ethics Statement' },
  { href: '/survey-info', icon: ClipboardList, label: 'Research Survey' },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { isLowCognitiveLoad, isMinimalText, isStepByStep } = useAccessibility();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const primaryItems = navItems.slice(0, 7);
  const secondaryItems = navItems.slice(7);
  const visiblePrimaryItems = isLowCognitiveLoad
    ? primaryItems.filter(({ href }) => [
        '/dashboard',
        '/dashboard/profile',
        '/dashboard/cv/generate',
        '/dashboard/internships',
        '/dashboard/applications',
        '/dashboard/interview',
      ].includes(href))
    : primaryItems;
  const visibleSecondaryItems = isLowCognitiveLoad
    ? secondaryItems.filter(({ href }) => href === '/dashboard/accessibility')
    : secondaryItems;

  const compactLabels: Record<string, string> = {
    Dashboard: 'Home',
    'My Profile': 'Profile',
    'CV Builder': 'Manual CV',
    'AI CV Generator': 'AI CV',
    Internships: 'Roles',
    Applications: 'Tracker',
    'Interview Practice': 'Interview',
    Accessibility: 'Access',
    Analytics: 'Stats',
    'Data & Privacy': 'Privacy',
    'Ethics Statement': 'Ethics',
    'Research Survey': 'Survey',
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-50 w-64 sidebar-bg flex flex-col
          transition-transform duration-200
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-sidebar-fg">The Key</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-sidebar-fg/60 hover:text-sidebar-fg p-1 rounded"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" role="navigation">
          <p className="px-3 py-2 text-[10px] uppercase tracking-widest text-sidebar-fg/40 font-semibold">
            {isMinimalText ? 'Core' : 'Platform'}
          </p>
          {visiblePrimaryItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors duration-150
                ${isActive(href)
                  ? 'bg-primary text-white'
                  : 'text-sidebar-fg/70 hover:text-sidebar-fg hover:bg-white/8'
                }
              `}
              aria-current={isActive(href) ? 'page' : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{isMinimalText ? compactLabels[label] || label : label}</span>
              {isStepByStep && href === '/dashboard/profile' && (
                <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-sidebar-fg/70">
                  Step 1
                </span>
              )}
            </Link>
          ))}

          <p className="px-3 pt-4 pb-2 text-[10px] uppercase tracking-widest text-sidebar-fg/40 font-semibold">
            {isMinimalText ? 'More' : 'Settings & Research'}
          </p>
          {visibleSecondaryItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors duration-150
                ${isActive(href)
                  ? 'bg-primary text-white'
                  : 'text-sidebar-fg/70 hover:text-sidebar-fg hover:bg-white/8'
                }
              `}
              aria-current={isActive(href) ? 'page' : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{isMinimalText ? compactLabels[label] || label : label}</span>
            </Link>
          ))}

          {isLowCognitiveLoad && (
            <p className="px-3 pt-3 text-[11px] leading-relaxed text-sidebar-fg/55">
              Low Cognitive Load mode is showing only the most relevant actions.
            </p>
          )}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="px-3 py-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs font-medium text-sidebar-fg/90 mb-1">Prototype Build</p>
            <p className="text-[11px] text-sidebar-fg/50 leading-relaxed">
              This is a research prototype built for a university dissertation.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
