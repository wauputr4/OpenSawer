import { afterEach, describe, expect, test } from 'vitest';
import {
	canTransitionPaymentStatus,
	mapStatus,
	mockEnabled,
	testMidtransCredentials,
	validSignature,
	type MidtransStatus
} from './midtrans';

const originalNodeEnv = process.env.NODE_ENV;
const originalFetch = globalThis.fetch;

afterEach(() => {
	delete process.env.MIDTRANS_SERVER_KEY;
	delete process.env.MIDTRANS_MOCK;
	process.env.NODE_ENV = originalNodeEnv;
	globalThis.fetch = originalFetch;
});

describe('Midtrans state', () => {
	test('maps terminal and pending states', () => {
		expect(mapStatus('settlement')).toBe('paid');
		expect(mapStatus('capture', 'accept')).toBe('paid');
		expect(mapStatus('expire')).toBe('expired');
		expect(mapStatus('deny')).toBe('failed');
		expect(mapStatus('pending')).toBe('pending');
	});

	test('does not regress refunded payments when webhooks arrive out of order', () => {
		expect(canTransitionPaymentStatus('refunded', 'paid')).toBe(false);
		expect(canTransitionPaymentStatus('paid', 'refunded')).toBe(true);
		expect(canTransitionPaymentStatus('expired', 'paid')).toBe(true);
	});

	test('never enables mock payments in production', () => {
		process.env.MIDTRANS_MOCK = 'true';
		process.env.NODE_ENV = 'development';
		expect(mockEnabled()).toBe(true);
		process.env.NODE_ENV = 'production';
		expect(mockEnabled()).toBe(false);
	});

	test('tests sandbox key format and server authentication', async () => {
		let requests = 0;
		globalThis.fetch = (async () => {
			requests += 1;
			return new Response('{}', { status: 404 });
		}) as unknown as typeof fetch;
		await expect(
			testMidtransCredentials({
				environment: 'sandbox',
				clientKey: 'SB-Mid-client-example',
				serverKey: 'SB-Mid-server-example'
			})
		).resolves.toBeUndefined();
		expect(requests).toBe(1);
		await expect(
			testMidtransCredentials({
				environment: 'sandbox',
				clientKey: 'Mid-client-production',
				serverKey: 'SB-Mid-server-example'
			})
		).rejects.toThrow('Client key');
	});

	test('checks the documented SHA-512 signature composition', () => {
		process.env.MIDTRANS_SERVER_KEY = 'server-key';
		const body: MidtransStatus = {
			order_id: 'OS-1',
			status_code: '200',
			gross_amount: '10000.00',
			transaction_status: 'settlement'
		};
		body.signature_key = new Bun.CryptoHasher('sha512')
			.update('OS-1' + '200' + '10000.00' + 'server-key')
			.digest('hex');
		expect(validSignature(body)).toBe(true);
		body.gross_amount = '20000.00';
		expect(validSignature(body)).toBe(false);
		body.signature_key = 'é'.repeat(128);
		expect(validSignature(body)).toBe(false);
	});
});
