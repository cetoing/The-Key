'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const { isLowCognitiveLoad, isStepByStep } = useAccessibility();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        {isStepByStep && (
          <div className="border-b border-primary/15 bg-primary/5 px-4 py-2 text-sm text-muted-foreground lg:px-6">
            Focus on one task before moving on. Guidance prompts and progressive checklists are active.
          </div>
        )}
        <main
          className={`flex-1 overflow-y-auto p-4 lg:p-6 ${isLowCognitiveLoad ? 'bg-muted/20' : ''}`}
          id="main-content"
          tabIndex={-1}
        >
          <div className={isLowCognitiveLoad ? 'mx-auto max-w-4xl space-y-6' : 'space-y-6'}>
          {children}
          </div>
        </main>
      </div>
    </div>
  );
}
