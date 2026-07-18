import { afterEach, describe, expect, test } from 'vitest';
import { decryptSecret, encryptSecret } from './env-config';

const originalSecret = process.env.OPENSAWER_SESSION_SECRET;

afterEach(() => {
	if (originalSecret) process.env.OPENSAWER_SESSION_SECRET = originalSecret;
	else delete process.env.OPENSAWER_SESSION_SECRET;
});

describe('encrypted environment secrets', () => {
	test('round trips without storing plaintext', () => {
		process.env.OPENSAWER_SESSION_SECRET = 'test-master-key-at-least-32-characters';
		const encrypted = encryptSecret('SB-Mid-server-secret');
		expect(encrypted).toMatch(/^enc:v1:/);
		expect(encrypted).not.toContain('SB-Mid-server-secret');
		expect(decryptSecret(encrypted)).toBe('SB-Mid-server-secret');
	});
});
