import nodemailer, { SentMessageInfo, Transporter } from 'nodemailer';
import SMTPTransport, { Options } from 'nodemailer/lib/smtp-transport';

let transporter: undefined | Transporter<SentMessageInfo, Options>;

export function getSmtpTransporter() {
    if (transporter) {
        return transporter;
    }
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASSWORD || '',
        },
    } as SMTPTransport.Options);
    return transporter
}
const from = '<team@example.com>'


export async function sendActivateAccountEmail(to: string, cbEndpoint: string) {
    try {
        await getSmtpTransporter().sendMail({
            from,
            to,
            subject: "Konto aktivieren",
            text: `Klick auf den Link um dein Account zu aktivieren: ${cbEndpoint}`,
            html: `<span>Klick auf den Link um dein Account zu aktivieren: ${cbEndpoint}</span>`,
        });
        // console.log(cbEndpoint)

        return true;
    } catch (err) {
        console.error("Error while sending mail", err);
        return false;
    }
}

export async function sendResetPasswordEmail(to: string, link: string) {
    try {
        await getSmtpTransporter().sendMail({
            from,
            to,
            subject: "Passwort zurücksetzen",
            text: `Klick auf den Link um dein Passwort zurückzusetzen: ${link}`,
            html: `<span>Klick auf den Link um dein Passwort zurückzusetzen: ${link}</span>`,
        });
        // console.log(link)

        return true;
    } catch (err) {
        console.error("Error while sending mail", err);
        return false;
    }
}

