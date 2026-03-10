import { NextResponse } from 'next/server';
import { getUserStore } from '@/lib/services/user-store';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { token, newPassword } = await request.json();

        if (!token || !newPassword) {
            return NextResponse.json(
                { error: 'Token and new password are required' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) { // example constraint
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        const userStore = getUserStore();

        // Verify token
        const userId = userStore.verifyPasswordResetToken(token);
        if (!userId) {
            return NextResponse.json(
                { error: 'Invalid or expired password reset token' },
                { status: 400 }
            );
        }

        // Hash new password and update
        const hashedPassword = await hashPassword(newPassword);
        userStore.updatePassword(userId, hashedPassword);

        return NextResponse.json({
            success: true,
            message: 'Password successfully updated'
        });

    } catch (error: any) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'Failed to reset password' },
            { status: 500 }
        );
    }
}
