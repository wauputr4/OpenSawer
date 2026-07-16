import { afterEach, describe, expect, test, vi } from 'vitest';
import { turnstileSiteKey, verifyTurnstile } from './turnstile';

const originalNodeEnv = process.env.NODE_ENV;
const originalSiteKey = process.env.TURNSTILE_SITE_KEY;
const originalSecretKey = process.env.TURNSTILE_SECRET_KEY;

afterEach(() => {
	process.env.NODE_ENV = originalNodeEnv;
	if (originalSiteKey) process.env.TURNSTILE_SITE_KEY = originalSiteKey;
	else delete process.env.TURNSTILE_SITE_KEY;
	if (originalSecretKey) process.env.TURNSTILE_SECRET_KEY = originalSecretKey;
	else delete process.env.TURNSTILE_SECRET_KEY;
	vi.unstubAllGlobals();
});

describe('Turnstile login protection', () => {
	test('uses official development keys and validates server-side', async () => {
		process.env.NODE_ENV = 'development';
		delete process.env.TURNSTILE_SITE_KEY;
		delete process.env.TURNSTILE_SECRET_KEY;
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => new Response('{"success":true}'))
		);
		expect(turnstileSiteKey()).toBe('1x00000000000000000000AA');
		expect(await verifyTurnstile('XXXX.DUMMY.TOKEN.XXXX', '127.0.0.1')).toBe(true);
		expect(fetch).toHaveBeenCalledOnce();
	});

	test('fails closed without production keys', async () => {
		process.env.NODE_ENV = 'production';
		delete process.env.TURNSTILE_SITE_KEY;
		delete process.env.TURNSTILE_SECRET_KEY;
		expect(turnstileSiteKey()).toBe('');
		expect(await verifyTurnstile('token')).toBe(false);
	});
});
