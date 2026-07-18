import { afterEach, describe, expect, test } from 'vitest';
import { createGoogleIdentity, googleIdentity, googleRedirectUri } from './google';

const originalSecret = process.env.OPENSAWER_SESSION_SECRET;
const originalRedirect = process.env.GOOGLE_REDIRECT_URI;

afterEach(() => {
	if (originalSecret) process.env.OPENSAWER_SESSION_SECRET = originalSecret;
	else delete process.env.OPENSAWER_SESSION_SECRET;
	if (originalRedirect) process.env.GOOGLE_REDIRECT_URI = originalRedirect;
	else delete process.env.GOOGLE_REDIRECT_URI;
});

describe('Google donor identity', () => {
	test('accepts signed identities and rejects tampering', async () => {
		process.env.OPENSAWER_SESSION_SECRET = 'test-secret';
		const identity = await createGoogleIdentity('Donor@Example.com');
		expect(await googleIdentity(identity)).toBe('donor@example.com');
		expect(await googleIdentity(`${identity}x`)).toBeUndefined();
	});

	test('uses an explicit OAuth redirect URI', () => {
		process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3002/api/auth/google/callback';
		expect(googleRedirectUri('http://localhost:5173')).toBe(
			'http://localhost:3002/api/auth/google/callback'
		);
	});
});
