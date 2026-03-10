'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || 'Password reset link sent.');
            } else {
                setError(data.error || 'Failed to request password reset');
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
                        账户恢复
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
                    {message && (
                        <div className="bg-green-900/40 border border-green-500/50 text-green-200 px-4 py-3 rounded-xl text-sm text-center backdrop-blur-sm">
                            {message}
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
                            placeholder="输入注册时的邮箱"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="pt-8">
                        <button
                            type="submit"
                            disabled={loading || !!message}
                            className="flex w-full justify-center bg-white px-4 py-4 text-xs tracking-widest font-bold text-black uppercase hover:bg-stone-300 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Sending Request...' : '发送重置链接'}
                        </button>
                    </div>

                    <div className="text-center text-xs tracking-widest font-bold text-stone-400 mt-6 pt-6 uppercase border-t border-stone-800 border-dashed">
                        想起密码了？{' '}
                        <Link href="/login" className="text-white hover:text-stone-300 transition-colors border-b border-white pb-0.5">
                            返回登录
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
