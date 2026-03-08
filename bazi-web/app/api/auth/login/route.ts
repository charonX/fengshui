import { NextResponse } from 'next/server';
import { getUserStore } from '@/lib/services/user-store';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const userStore = getUserStore();
        const user = userStore.getUserByEmail(email);

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Set session cookie
        await createSession(user.id, user.email);

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to login' },
            { status: 500 }
        );
    }
}
