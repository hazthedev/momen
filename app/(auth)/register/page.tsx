/**
 * Momen Register Page
 * Create a new account and tenant
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera } from 'lucide-react';
import { useAuth } from '@/lib/auth/providers';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Simple password strength check
  const checkPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 20;
    if (pwd.length >= 12) strength += 20;
    if (/[a-z]/.test(pwd)) strength += 15;
    if (/[A-Z]/.test(pwd)) strength += 15;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 15;
    setPasswordStrength(Math.min(strength, 100));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register(email, password, name);
      // Redirect will happen automatically via AuthProvider
      router.push('/organizer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    checkPasswordStrength(value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-slate rounded-lg flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate">Momen</span>
          </Link>
        </div>

        {/* Register Card */}
        <div className="bg-card rounded-lg border border-default shadow-sm p-8">
          <h1 className="text-2xl font-bold text-slate mb-2">Create an account</h1>
          <p className="text-sky mb-6">
            Start capturing event memories today
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-md bg-error-light text-error text-sm">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="w-full h-10 px-3 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ice/50 focus:border-ice disabled:opacity-50"
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full h-10 px-3 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ice/50 focus:border-ice disabled:opacity-50"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                disabled={isLoading}
                className="w-full h-10 px-3 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ice/50 focus:border-ice disabled:opacity-50"
                placeholder="•••••••••"
                autoComplete="new-password"
              />

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="h-1 w-full bg-cream rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength < 40 ? 'bg-error' :
                        passwordStrength < 70 ? 'bg-warning' :
                        'bg-success'
                      }`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                  <p className="text-xs text-sky mt-1">
                    {passwordStrength < 40 ? 'Weak password' :
                     passwordStrength < 70 ? 'Medium strength' :
                     'Strong password'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full h-10 px-3 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ice/50 focus:border-ice disabled:opacity-50"
                placeholder="•••••••••"
                autoComplete="new-password"
              />
            </div>

            {/* Terms */}
            <p className="text-xs text-sky">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="underline hover:text-slate">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="underline hover:text-slate">
                Privacy Policy
              </Link>
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-slate text-white rounded-md font-medium hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-sky">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-sky hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-sky hover:text-slate">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
