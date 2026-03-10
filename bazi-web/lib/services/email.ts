import nodemailer from 'nodemailer';

interface SendEmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || user;

    const { to, subject, text, html } = options;

    if (!host || !user || !pass) {
        // Fallback or warning if no SMTP configured
        console.warn('⚠️ [EMAIL SERVICE] SMTP credentials not set in environment variables. Email will not be sent but logged below:');
        console.warn('--------------------------------------------------');
        console.warn(`To: ${to}`);
        console.warn(`Subject: ${subject}`);
        console.warn(`Body:`);
        console.warn(text);
        console.warn('--------------------------------------------------');
        return true; // Pretend it succeeded
    }

    try {
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465, // true for 465, false for other ports
            auth: {
                user,
                pass,
            },
        });

        await transporter.sendMail({
            from: `"Bazi Protocol" <${from}>`,
            to,
            subject,
            text,
            html: html || text.replace(/\n/g, '<br>'),
        });

        console.log(`Email successfully sent to ${to}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}
