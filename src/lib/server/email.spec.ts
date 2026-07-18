import { afterEach, describe, expect, test } from 'vitest';

import { smtpConfig } from './email';

const keys = [
	'SMTP_HOST',
	'SMTP_PORT',
	'SMTP_USER',
	'SMTP_PASS',
	'SMTP_USERNAME',
	'SMTP_PASSWORD',
	'SMTP_FROM',
	'SMTP_ENCRYPTION'
];
const original = new Map(keys.map((key) => [key, process.env[key]]));

afterEach(() => {
	for (const [key, value] of original) {
		if (value === undefined) delete process.env[key];
		else process.env[key] = value;
	}
});

describe('SMTP configuration', () => {
	test('supports audited SMTP aliases without TLS', async () => {
		process.env.SMTP_HOST = '100.65.30.81';
		process.env.SMTP_PORT = '1025';
		process.env.SMTP_USER = 'any';
		process.env.SMTP_PASS = 'any';
		delete process.env.SMTP_USERNAME;
		delete process.env.SMTP_PASSWORD;
		process.env.SMTP_FROM = 'testing@indopensource.org';
		process.env.SMTP_ENCRYPTION = 'null';

		expect(smtpConfig()).toEqual({
			from: 'testing@indopensource.org',
			transport: {
				host: '100.65.30.81',
				port: 1025,
				secure: false,
				ignoreTLS: true,
				auth: { user: 'any', pass: 'any' },
				connectionTimeout: 10_000,
				greetingTimeout: 10_000,
				socketTimeout: 15_000
			}
		});
	});
});
