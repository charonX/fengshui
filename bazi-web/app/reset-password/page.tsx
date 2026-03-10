'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || 'Password successfully updated.');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setError(data.error || 'Failed to reset password');
            }
        } catch (err: any) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center w-full">
                <div className="bg-red-900/40 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm mb-6">
                    无效的重置链接或缺少重置令牌 (Invalid or missing token)
                </div>
                <Link href="/forgot-password" className="text-white hover:text-stone-300 transition-colors border-b border-white pb-0.5 text-sm">
                    重新获取重置链接
                </Link>
            </div>
        );
    }

    return (
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
                <label htmlFor="new-password" className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
                    新密码
                </label>
                <input
                    id="new-password"
                    name="newPassword"
                    type="password"
                    required
                    minLength={6}
                    className="w-full pb-3 border-b border-stone-800 focus:border-white bg-transparent text-white placeholder-stone-700 transition-colors outline-none text-lg mb-6"
                    placeholder="请输入新密码"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="confirm-password" className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
                    确认密码
                </label>
                <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    className="w-full pb-3 border-b border-stone-800 focus:border-white bg-transparent text-white placeholder-stone-700 transition-colors outline-none text-lg"
                    placeholder="请再次输入新密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>

            <div className="pt-8">
                <button
                    type="submit"
                    disabled={loading || !!message}
                    className="flex w-full justify-center bg-white px-4 py-4 text-xs tracking-widest font-bold text-black uppercase hover:bg-stone-300 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Reseting...' : '更新密码'}
                </button>
            </div>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-black">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-left pb-8 border-b border-stone-800 border-dashed">
                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
                        重置密码
                    </h2>
                    <p className="mt-3 text-sm text-stone-400 font-mono">
                        System Access / Protocol Override
                    </p>
                </div>

                <Suspense fallback={<div className="text-stone-400 text-sm font-mono mt-8">Loading verification data...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
