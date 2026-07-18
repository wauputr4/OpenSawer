import nodemailer from 'nodemailer';

export function smtpConfig() {
	const host = process.env.SMTP_HOST;
	if (!host) return null;
	const port = Number(process.env.SMTP_PORT || 587);
	const username = process.env.SMTP_USERNAME || process.env.SMTP_USER;
	const password = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
	const encryption = process.env.SMTP_ENCRYPTION?.toLowerCase();
	const fromAddress = process.env.SMTP_FROM_ADDRESS;
	const from =
		process.env.SMTP_FROM ||
		(fromAddress
			? `${process.env.SMTP_FROM_NAME || 'OpenSawer'} <${fromAddress}>`
			: 'OpenSawer <no-reply@example.com>');
	return {
		from,
		transport: {
			host,
			port,
			secure: encryption === 'ssl' || (!encryption && port === 465),
			ignoreTLS: encryption === 'null' || encryption === 'none',
			auth: username ? { user: username, pass: password } : undefined,
			connectionTimeout: 10_000,
			greetingTimeout: 10_000,
			socketTimeout: 15_000
		}
	};
}

export async function sendCode(email: string, code: string): Promise<{ previewCode?: string }> {
	const config = smtpConfig();
	if (!config) {
		if (process.env.NODE_ENV === 'production') throw new Error('SMTP belum dikonfigurasi');
		return { previewCode: code };
	}
	const transport = nodemailer.createTransport(config.transport);
	await transport.sendMail({
		from: config.from,
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
