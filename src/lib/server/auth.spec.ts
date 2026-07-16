import { afterEach, describe, expect, test } from 'vitest';
import { validAdminCookie } from './auth';

const originalNodeEnv = process.env.NODE_ENV;
const originalSecret = process.env.OPENSAWER_SESSION_SECRET;

afterEach(() => {
	process.env.NODE_ENV = originalNodeEnv;
	if (originalSecret) process.env.OPENSAWER_SESSION_SECRET = originalSecret;
	else delete process.env.OPENSAWER_SESSION_SECRET;
});

describe('admin session', () => {
	test('rejects malformed Unicode signatures without throwing', async () => {
		process.env.NODE_ENV = 'development';
		process.env.OPENSAWER_SESSION_SECRET = 'test-secret';
		await expect(validAdminCookie(`${Date.now() + 60_000}.${'é'.repeat(43)}`)).resolves.toBe(false);
	});

	test('rejects malformed expiration values', async () => {
		process.env.NODE_ENV = 'development';
		await expect(validAdminCookie('not-a-date.signature')).resolves.toBe(false);
	});

	test('requires an explicit secret in production', async () => {
		process.env.NODE_ENV = 'production';
		delete process.env.OPENSAWER_SESSION_SECRET;
		await expect(validAdminCookie(`${Date.now() + 60_000}.invalid`)).rejects.toThrow(
			'OPENSAWER_SESSION_SECRET'
		);
	});
});
