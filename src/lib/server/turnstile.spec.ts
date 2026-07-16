import { afterEach, describe, expect, test } from 'vitest';
import { turnstileSiteKey, verifyTurnstile } from './turnstile';

const originalNodeEnv = process.env.NODE_ENV;
const originalSiteKey = process.env.TURNSTILE_SITE_KEY;
const originalSecretKey = process.env.TURNSTILE_SECRET_KEY;
const originalFetch = globalThis.fetch;

afterEach(() => {
	process.env.NODE_ENV = originalNodeEnv;
	if (originalSiteKey) process.env.TURNSTILE_SITE_KEY = originalSiteKey;
	else delete process.env.TURNSTILE_SITE_KEY;
	if (originalSecretKey) process.env.TURNSTILE_SECRET_KEY = originalSecretKey;
	else delete process.env.TURNSTILE_SECRET_KEY;
	globalThis.fetch = originalFetch;
});

describe('Turnstile login protection', () => {
	test('uses official development keys and validates server-side', async () => {
		process.env.NODE_ENV = 'development';
		delete process.env.TURNSTILE_SITE_KEY;
		delete process.env.TURNSTILE_SECRET_KEY;
		let requests = 0;
		globalThis.fetch = (async () => {
			requests += 1;
			return new Response('{"success":true}');
		}) as unknown as typeof fetch;
		expect(turnstileSiteKey()).toBe('1x00000000000000000000AA');
		expect(await verifyTurnstile('XXXX.DUMMY.TOKEN.XXXX', '127.0.0.1')).toBe(true);
		expect(requests).toBe(1);
	});

	test('fails closed without production keys', async () => {
		process.env.NODE_ENV = 'production';
		delete process.env.TURNSTILE_SITE_KEY;
		delete process.env.TURNSTILE_SECRET_KEY;
		expect(turnstileSiteKey()).toBe('');
		expect(await verifyTurnstile('token')).toBe(false);
	});
});
