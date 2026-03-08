import { NextResponse } from 'next/server';
import { getUserStore } from '@/lib/services/user-store';
import { hashPassword, createSession } from '@/lib/auth';

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

        // Check if user exists
        const existingUser = userStore.getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        const hashedPassword = await hashPassword(password);
        const user = userStore.createUser(email, hashedPassword);

        // Initial session
        await createSession(user.id, user.email);

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to register' },
            { status: 500 }
        );
    }
}
