import { afterEach, describe, expect, test } from 'vitest';
import { createGoogleIdentity, googleIdentity } from './google';

const originalSecret = process.env.OPENSAWER_SESSION_SECRET;

afterEach(() => {
	if (originalSecret) process.env.OPENSAWER_SESSION_SECRET = originalSecret;
	else delete process.env.OPENSAWER_SESSION_SECRET;
});

describe('Google donor identity', () => {
	test('accepts signed identities and rejects tampering', async () => {
		process.env.OPENSAWER_SESSION_SECRET = 'test-secret';
		const identity = await createGoogleIdentity('Donor@Example.com');
		expect(await googleIdentity(identity)).toBe('donor@example.com');
		expect(await googleIdentity(`${identity}x`)).toBeUndefined();
	});
});
