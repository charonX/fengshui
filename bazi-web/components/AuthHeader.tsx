'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthHeader({ user }: { user: { email: string } | null }) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    // Placeholder for logoutAction, assuming it's a server action or similar.
    // This would need to be defined elsewhere or imported.
    // For the purpose of this edit, we'll assume it's available in scope.
    const logoutAction = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <header className="fixed top-0 inset-x-0 z-50 flex h-24 items-center justify-between bg-black px-6 sm:px-12">
            <div className="flex items-center gap-x-8">
                <Link href="/" className="text-xl font-bold tracking-wider text-zinc-200 hover:text-white transition-colors">
                    玄学智能代理
                </Link>
                {user && (
                    <Link href="/profiles" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                        命理档案
                    </Link>
                )}
            </div>
            <div className="flex items-center gap-x-6">
                {user ? (
                    <>
                        <Link
                            href="/profiles"
                            className="text-sm font-bold tracking-widest uppercase text-zinc-400 hover:text-white transition-colors"
                        >
                            档案中心
                        </Link>
                        <form action={logoutAction}>
                            <button
                                type="submit"
                                className="text-sm font-bold tracking-widest uppercase text-zinc-400 hover:text-white transition-colors"
                            >
                                退出登录
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="text-sm font-bold tracking-widest uppercase text-zinc-400 hover:text-white transition-colors">
                            登录
                        </Link>
                        <Link
                            href="/register"
                            className="text-sm font-bold tracking-widest uppercase px-6 py-2.5 bg-white text-black hover:bg-zinc-200 transition-colors"
                        >
                            创建账号
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}
