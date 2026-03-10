'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                // Redirect to homepage or dashboard after login
                router.push('/');
                router.refresh(); // Refresh layout to grab new session user
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to login');
            }
        } catch (err: any) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-black">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-left pb-8 border-b border-stone-800 border-dashed">
                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
                        登录玄学代理
                    </h2>
                    <p className="mt-3 text-sm text-stone-400 font-mono">
                        System Access / Bazi Protocol
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-900/40 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm text-center backdrop-blur-sm">
                            {error}
                        </div>
                    )}
                    <div>
                        <label htmlFor="email-address" className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
                            电子邮箱
                        </label>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="w-full pb-3 border-b border-stone-800 focus:border-white bg-transparent text-white placeholder-stone-700 transition-colors outline-none text-lg"
                            placeholder="输入邮箱地址"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="pt-4">
                        <label htmlFor="password" className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
                            密码
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="w-full pb-3 border-b border-stone-800 focus:border-white bg-transparent text-white placeholder-stone-700 transition-colors outline-none text-lg"
                            placeholder="请输入登录密码"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="pt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center bg-white px-4 py-4 text-xs tracking-widest font-bold text-black uppercase hover:bg-stone-300 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : 'Access System'}
                        </button>
                    </div>

                    <div className="text-center text-xs tracking-widest font-bold text-stone-400 mt-6 pt-6 uppercase">
                        没有账号？{' '}
                        <Link href="/register" className="text-white hover:text-stone-300 transition-colors border-b border-white pb-0.5">
                            创建档案
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
