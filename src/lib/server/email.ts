import nodemailer from 'nodemailer';

export async function sendCode(email: string, code: string): Promise<{ previewCode?: string }> {
	const host = process.env.SMTP_HOST;
	if (!host) {
		if (process.env.NODE_ENV === 'production') throw new Error('SMTP belum dikonfigurasi');
		return { previewCode: code };
	}
	const transport = nodemailer.createTransport({
		host,
		port: Number(process.env.SMTP_PORT || 587),
		secure: Number(process.env.SMTP_PORT || 587) === 465,
		auth: process.env.SMTP_USERNAME
			? { user: process.env.SMTP_USERNAME, pass: process.env.SMTP_PASSWORD }
			: undefined
	});
	await transport.sendMail({
		from: process.env.SMTP_FROM || 'OpenSawer <no-reply@example.com>',
		to: email,
		subject: 'Kode verifikasi OpenSawer',
		text: `Kode verifikasi kamu: ${code}. Kode berlaku 10 menit.`
	});
	return {};
}

export function codeHash(email: string, username: string, code: string): string {
	return new Bun.CryptoHasher('sha256')
		.update(`${email}|${username}|${code}|${process.env.OPENSAWER_SESSION_SECRET || 'dev'}`)
		.digest('hex');
}
