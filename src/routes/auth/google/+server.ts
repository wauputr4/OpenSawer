import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { googleConfigured, googleRedirectUri } from '$lib/server/google';

export const GET: RequestHandler = async ({ cookies, url }) => {
	if (!googleConfigured()) throw redirect(303, '/sawer?google=unavailable');
	const state = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');
	const verifier = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');
	const challenge = Buffer.from(
		await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
	).toString('base64url');
	const cookie = {
		path: '/',
		httpOnly: true,
		sameSite: 'lax' as const,
		secure: process.env.NODE_ENV === 'production',
		maxAge: 600
	};
	cookies.set('opensawer_google_state', state, cookie);
	cookies.set('opensawer_google_verifier', verifier, cookie);
	const callback = googleRedirectUri(process.env.ORIGIN || url.origin);
	const target = new URL('https://accounts.google.com/o/oauth2/v2/auth');
	target.search = new URLSearchParams({
		client_id: process.env.GOOGLE_CLIENT_ID!,
		redirect_uri: callback,
		response_type: 'code',
		scope: 'openid email',
		state,
		code_challenge: challenge,
		code_challenge_method: 'S256',
		prompt: 'select_account'
	}).toString();
	throw redirect(303, target.toString());
};
