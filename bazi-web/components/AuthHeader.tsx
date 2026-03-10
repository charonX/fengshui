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
        <header className="fixed top-0 inset-x-0 z-50 flex h-24 items-center justify-between bg-background/80 backdrop-blur-md px-6 sm:px-12 border-b border-foreground/5">
            <div className="flex items-center gap-x-8">
                <Link href="/" className="text-xl font-serif font-bold tracking-widest text-foreground hover:text-cta transition-colors">
                    玄学智能<span className="text-cta">代理</span>
                </Link>
                {user && (
                    <Link href="/profiles" className="text-sm font-medium text-muted hover:text-foreground transition-colors hidden md:block">
                        命理档案
                    </Link>
                )}
            </div>
            <div className="flex items-center gap-x-6">
                {user ? (
                    <>
                        <Link
                            href="/profiles"
                            className="text-sm font-bold tracking-widest uppercase text-muted hover:text-foreground transition-colors"
                        >
                            档案中心
                        </Link>
                        <form action={logoutAction}>
                            <button
                                type="submit"
                                className="text-sm font-bold tracking-widest uppercase text-muted hover:text-cta transition-colors cursor-pointer"
                            >
                                退出登录
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="text-sm font-bold tracking-widest uppercase text-muted hover:text-foreground transition-colors cursor-pointer">
                            登录
                        </Link>
                        <Link
                            href="/register"
                            className="text-sm font-bold tracking-widest uppercase px-6 py-2.5 btn-primary"
                        >
                            创建账号
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}
