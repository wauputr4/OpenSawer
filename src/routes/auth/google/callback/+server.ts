import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createGoogleIdentity, googleCookieName, googleConfigured } from '$lib/server/google';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const expectedState = cookies.get('opensawer_google_state');
	const verifier = cookies.get('opensawer_google_verifier');
	cookies.delete('opensawer_google_state', { path: '/auth/google' });
	cookies.delete('opensawer_google_verifier', { path: '/auth/google' });
	if (!googleConfigured() || !code || !state || state !== expectedState || !verifier)
		throw redirect(303, '/sawer?google=failed');

	const callback = new URL('/auth/google/callback', process.env.ORIGIN || url.origin).toString();
	try {
		const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				code,
				client_id: process.env.GOOGLE_CLIENT_ID!,
				client_secret: process.env.GOOGLE_CLIENT_SECRET!,
				redirect_uri: callback,
				grant_type: 'authorization_code',
				code_verifier: verifier
			}),
			signal: AbortSignal.timeout(10_000)
		});
		if (!tokenResponse.ok) throw new Error('Token Google ditolak');
		const { access_token } = (await tokenResponse.json()) as { access_token?: string };
		if (!access_token) throw new Error('Token Google kosong');
		const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: { Authorization: `Bearer ${access_token}` },
			signal: AbortSignal.timeout(10_000)
		});
		const profile = (await profileResponse.json()) as { email?: string; email_verified?: boolean };
		if (!profileResponse.ok || !profile.email || profile.email_verified !== true)
			throw new Error('Email Google belum terverifikasi');
		cookies.set(googleCookieName, await createGoogleIdentity(profile.email), {
			path: '/sawer',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 3600
		});
	} catch {
		throw redirect(303, '/sawer?google=failed');
	}
	throw redirect(303, '/sawer?identity=google');
};
