'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
  MailCheck,
  Shield,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import {
  authSchema,
  registerSchema,
  type AuthFormData,
  type RegisterFormData,
} from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type Mode = 'login' | 'register';

export function AuthForm() {
  const [mode, setMode] = useState<Mode>('login');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const loginForm = useForm<AuthFormData>({ resolver: zodResolver(authSchema) });
  const registerForm = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const handleLogin = async (data: AuthFormData) => {
    setLoading(true);
    const { error } = await signIn(data.email, data.password);
    setLoading(false);

    if (error) {
      toast({ title: 'Sign in failed', description: error, variant: 'destructive' });
      return;
    }

    router.push('/dashboard');
  };

  const handleRegister = async (data: RegisterFormData) => {
    setLoading(true);
    const { error } = await signUp(data.email, data.password, data.full_name);
    setLoading(false);

    if (error) {
      toast({ title: 'Registration failed', description: error, variant: 'destructive' });
      return;
    }

    registerForm.reset();
    setMode('login');
    toast({
      title: 'Check your email',
      description: 'Your account has been created. Please verify your email address before signing in.',
    });
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <KeyRound className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold tracking-tight">The Key</span>
        </div>
        <h1 className="text-2xl font-semibold text-foreground">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {mode === 'login'
            ? 'Sign in to continue building your CV, tracking applications, and preparing for interviews.'
            : 'Create a secure account for this dissertation prototype and start exploring internships.'}
        </p>
      </div>

      <div className="rounded-3xl border border-border/80 bg-background/90 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur-sm">
        <div className="flex rounded-t-3xl border-b border-border/70 bg-muted/40 p-1">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all ${
              mode === 'login'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all ${
              mode === 'register'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Register
          </button>
        </div>

        <div className="p-6 sm:p-7">
          {mode === 'login' ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email">Email address</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@university.ac.uk"
                  autoComplete="email"
                  {...loginForm.register('email')}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="pr-10"
                    {...loginForm.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="h-11 w-full rounded-2xl" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reg-name">Full name</Label>
                <Input
                  id="reg-name"
                  placeholder="Alex Johnson"
                  autoComplete="name"
                  {...registerForm.register('full_name')}
                />
                {registerForm.formState.errors.full_name && (
                  <p className="text-xs text-destructive">{registerForm.formState.errors.full_name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-email">Email address</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@university.ac.uk"
                  autoComplete="email"
                  {...registerForm.register('email')}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{registerForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-password">Password</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showRegisterPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="pr-10"
                    {...registerForm.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{registerForm.formState.errors.password.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-confirm">Confirm password</Label>
                <Input
                  id="reg-confirm"
                  type="password"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  {...registerForm.register('confirmPassword')}
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <div className="rounded-2xl border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-left dark:border-amber-500/20 dark:bg-amber-500/10">
                <div className="flex gap-3">
                  <MailCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Email verification is required</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      After registration, Supabase will send you a confirmation email before you can sign in.
                    </p>
                  </div>
                </div>
              </div>
              <Button type="submit" className="h-11 w-full rounded-2xl" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Shield className="h-4 w-4 text-primary" />
                Ethics first
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                AI use, bias risks, and data handling are explained in plain language.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <FileText className="h-4 w-4 text-primary" />
                Research context
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                This platform is a university dissertation prototype rather than a commercial product.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <Link href="/ethics" className="transition-colors hover:text-foreground">
          Ethics & Transparency
        </Link>
        <span className="hidden text-border sm:inline">&bull;</span>
        <Link href="/survey-info" className="transition-colors hover:text-foreground">
          Research Survey
        </Link>
      </div>

      <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
        By continuing, you agree to the platform&apos;s privacy and research terms.
        This prototype was built for a university dissertation.
      </p>
    </div>
  );
}
