'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';

export default function LoginClient() {
  const { login } = useAuthStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignin = async () => {
    setLoading(true); setError('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EDEAE3] dark:bg-zinc-900">
      <Card className="w-full max-w-sm shadow-none border border-zinc-200 dark:border-zinc-800">
        <CardHeader className="text-center">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B55] flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-medium text-sm">N9</span>
          </div>
          <CardTitle className="text-lg font-medium">NynePulse</CardTitle>
          <p className="text-sm text-muted-foreground">Sign in to your dashboard</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3D6B55] bg-transparent"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSignin()}
            className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3D6B55] bg-transparent"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button
            onClick={handleSignin}
            disabled={loading}
            className="w-full bg-[#3D6B55] hover:bg-[#2d5040] text-white"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}