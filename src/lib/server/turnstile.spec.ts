import { afterEach, describe, expect, test } from 'vitest';
import { turnstileSiteKey, verifyTurnstile } from './turnstile';

const originalNodeEnv = process.env.NODE_ENV;
const originalSiteKey = process.env.TURNSTILE_SITE_KEY;
const originalPublicSiteKey = process.env.PUBLIC_TURNSTILE_SITE_KEY;
const originalSecretKey = process.env.TURNSTILE_SECRET_KEY;
const originalEnabled = process.env.TURNSTILE_ENABLED;
const originalFetch = globalThis.fetch;

afterEach(() => {
	process.env.NODE_ENV = originalNodeEnv;
	if (originalSiteKey) process.env.TURNSTILE_SITE_KEY = originalSiteKey;
	else delete process.env.TURNSTILE_SITE_KEY;
	if (originalPublicSiteKey) process.env.PUBLIC_TURNSTILE_SITE_KEY = originalPublicSiteKey;
	else delete process.env.PUBLIC_TURNSTILE_SITE_KEY;
	if (originalSecretKey) process.env.TURNSTILE_SECRET_KEY = originalSecretKey;
	else delete process.env.TURNSTILE_SECRET_KEY;
	if (originalEnabled) process.env.TURNSTILE_ENABLED = originalEnabled;
	else delete process.env.TURNSTILE_ENABLED;
	globalThis.fetch = originalFetch;
});

describe('Turnstile login protection', () => {
	test('validates server-side when both keys are configured', async () => {
		process.env.PUBLIC_TURNSTILE_SITE_KEY = 'site-key';
		process.env.TURNSTILE_SECRET_KEY = 'secret-key';
		let requests = 0;
		globalThis.fetch = (async () => {
			requests += 1;
			return new Response('{"success":true}');
		}) as unknown as typeof fetch;
		expect(turnstileSiteKey()).toBe('site-key');
		expect(await verifyTurnstile('token', '127.0.0.1')).toBe(true);
		expect(requests).toBe(1);
	});

	test('is disabled when keys are not configured', async () => {
		delete process.env.TURNSTILE_SITE_KEY;
		delete process.env.PUBLIC_TURNSTILE_SITE_KEY;
		delete process.env.TURNSTILE_SECRET_KEY;
		expect(turnstileSiteKey()).toBe('');
		expect(await verifyTurnstile('')).toBe(true);
	});

	test('can be explicitly disabled with configured keys', () => {
		process.env.PUBLIC_TURNSTILE_SITE_KEY = 'site-key';
		process.env.TURNSTILE_SECRET_KEY = 'secret-key';
		process.env.TURNSTILE_ENABLED = 'false';
		expect(turnstileSiteKey()).toBe('');
	});
});
