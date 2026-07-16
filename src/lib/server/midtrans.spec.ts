import { afterEach, describe, expect, test } from 'vitest';
import { mapStatus, validSignature, type MidtransStatus } from './midtrans';

afterEach(() => delete process.env.MIDTRANS_SERVER_KEY);

describe('Midtrans state', () => {
	test('maps terminal and pending states', () => {
		expect(mapStatus('settlement')).toBe('paid');
		expect(mapStatus('capture', 'accept')).toBe('paid');
		expect(mapStatus('expire')).toBe('expired');
		expect(mapStatus('deny')).toBe('failed');
		expect(mapStatus('pending')).toBe('pending');
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
	});
});
