import type { Cookies } from '@sveltejs/kit';
import { timingSafeEqual } from 'node:crypto';

const cookieName = 'opensawer_admin';

function secret(): string {
	if (process.env.OPENSAWER_SESSION_SECRET) return process.env.OPENSAWER_SESSION_SECRET;
	if (process.env.NODE_ENV === 'production')
		throw new Error('OPENSAWER_SESSION_SECRET wajib diatur di production');
	return 'development-only-change-this-secret';
}

async function signature(value: string): Promise<string> {
	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(secret()),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const bytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
	return Buffer.from(bytes).toString('base64url');
}

export async function validAdminCookie(value: string | undefined): Promise<boolean> {
	if (!value) return false;
	const [expires, supplied] = value.split('.');
	if (!expires || !supplied || Number(expires) < Date.now()) return false;
	const expected = await signature(expires);
	return (
		supplied.length === expected.length &&
		timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
	);
}

export async function setAdminCookie(cookies: Cookies): Promise<void> {
	const expires = String(Date.now() + 12 * 60 * 60 * 1000);
	cookies.set(cookieName, `${expires}.${await signature(expires)}`, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 43200
	});
}

export function clearAdminCookie(cookies: Cookies): void {
	cookies.delete(cookieName, { path: '/' });
}

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
	if (username !== (process.env.OPENSAWER_ADMIN_USERNAME || 'admin')) return false;
	const hash = process.env.OPENSAWER_ADMIN_PASSWORD_HASH;
	if (hash) return Bun.password.verify(password, hash);
	if (process.env.NODE_ENV === 'production') return false;
	return password === (process.env.OPENSAWER_ADMIN_PASSWORD || 'change-me');
}

export { cookieName };
