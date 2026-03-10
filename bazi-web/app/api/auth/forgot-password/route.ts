import { NextResponse } from 'next/server';
import { getUserStore } from '@/lib/services/user-store';
import { sendEmail } from '@/lib/services/email';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const userStore = getUserStore();
        const token = userStore.createPasswordResetToken(email);

        if (token) {
            const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

            await sendEmail({
                to: email,
                subject: '[Bazi Protocol] 找回密码 (Reset Password)',
                text: `您申请了密码重置。\n请通过此链接来重置密码: ${resetLink}\n如果您未进行此操作，请忽略该邮件。\n该链接1小时内有效。`,
                html: `
                    <div style="font-family: sans-serif; background-color: #000; color: #f5f5f4; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #fff; margin-bottom: 24px; border-bottom: 1px dashed #444; padding-bottom: 12px;">账户安全 / 密码重置</h2>
                        <p style="color: #a8a29e; font-size: 14px; margin-bottom: 12px;">系统检测到您（或有人代表您）触发了找回密码申请。</p>
                        <p style="color: #a8a29e; font-size: 14px; margin-bottom: 32px;">您可以点击下方链接安全地设置您的新密码（链接在1小时内有效）：</p>
                        <a href="${resetLink}" style="background-color: #fff; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">重置密码</a>
                        <p style="color: #666; font-size: 12px; margin-top: 40px; border-top: 1px dashed #444; padding-top: 16px;">如果您并没有请求过密码找回，请直接忽略并删除本邮件。</p>
                    </div>
                `
            });
        }

        // We always return success even if the email doesn't exist, to prevent email enumeration
        return NextResponse.json({
            message: 'If an account exists with this email, a password reset link has been sent.'
        });

    } catch (error: any) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
