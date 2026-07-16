import { signSessionValue, validSessionSignature } from './auth';

export const googleCookieName = 'opensawer_google';

export function googleConfigured(): boolean {
	return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function googleRedirectUri(origin: string): string {
	return process.env.GOOGLE_REDIRECT_URI || new URL('/auth/google/callback', origin).toString();
}

export async function createGoogleIdentity(email: string): Promise<string> {
	const payload = Buffer.from(
		JSON.stringify({ email: email.toLowerCase(), expires: Date.now() + 60 * 60 * 1000 })
	).toString('base64url');
	return `${payload}.${await signSessionValue(payload)}`;
}

export async function googleIdentity(value: string | undefined): Promise<string | undefined> {
	if (!value) return;
	const [payload, signature] = value.split('.');
	if (!payload || !signature || !(await validSessionSignature(payload, signature))) return;
	try {
		const identity = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
			email?: unknown;
			expires?: unknown;
		};
		if (
			typeof identity.email !== 'string' ||
			typeof identity.expires !== 'number' ||
			identity.expires < Date.now()
		)
			return;
		return identity.email;
	} catch {
		return;
	}
}
