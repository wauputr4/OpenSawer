import { timingSafeEqual } from 'node:crypto';
import { secretEnv } from './env-config';

type MidtransStatus = {
	order_id: string;
	transaction_status: string;
	status_code: string;
	gross_amount: string;
	transaction_id?: string;
	payment_type?: string;
	fraud_status?: string;
	signature_key?: string;
};

export type MidtransEnvironment = 'sandbox' | 'production';
export type PaymentStatus = 'created' | 'pending' | 'paid' | 'failed' | 'expired' | 'refunded';

export function midtransConfig() {
	const environment: MidtransEnvironment =
		process.env.MIDTRANS_ENV === 'production' ? 'production' : 'sandbox';
	return {
		environment,
		merchantId: process.env.MIDTRANS_MERCHANT_ID || '',
		clientKey: secretEnv('MIDTRANS_CLIENT_KEY'),
		serverKey: secretEnv('MIDTRANS_SERVER_KEY')
	};
}

const sandbox = () => midtransConfig().environment === 'sandbox';
const auth = (serverKey = midtransConfig().serverKey) =>
	`Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`;

export const mockEnabled = () =>
	process.env.NODE_ENV !== 'production' && process.env.MIDTRANS_MOCK === 'true';

export async function testMidtransCredentials(input: {
	environment: MidtransEnvironment;
	clientKey: string;
	serverKey: string;
}): Promise<void> {
	const prefix = input.environment === 'sandbox' ? 'SB-Mid-' : 'Mid-';
	if (!input.clientKey.startsWith(`${prefix}client-`))
		throw new Error(`Client key tidak cocok untuk mode ${input.environment}.`);
	if (!input.serverKey.startsWith(`${prefix}server-`))
		throw new Error(`Server key tidak cocok untuk mode ${input.environment}.`);
	const base =
		input.environment === 'sandbox'
			? 'https://api.sandbox.midtrans.com'
			: 'https://api.midtrans.com';
	const response = await fetch(`${base}/v2/opensawer-auth-test/status`, {
		headers: { Authorization: auth(input.serverKey), Accept: 'application/json' },
		signal: AbortSignal.timeout(10_000)
	});
	if (response.status === 401 || response.status === 403)
		throw new Error('Autentikasi Midtrans ditolak. Periksa kembali server key.');
	if (!response.ok && response.status !== 404)
		throw new Error(`Test koneksi Midtrans gagal (${response.status}).`);
}

export function mapStatus(
	status: string,
	fraud?: string
): 'pending' | 'paid' | 'failed' | 'expired' | 'refunded' {
	if ((status === 'capture' && fraud === 'accept') || status === 'settlement') return 'paid';
	if (status === 'expire') return 'expired';
	if (status === 'refund' || status === 'partial_refund') return 'refunded';
	if (['deny', 'cancel', 'failure'].includes(status)) return 'failed';
	return 'pending';
}

export function canTransitionPaymentStatus(current: PaymentStatus, next: PaymentStatus): boolean {
	return (
		['created', 'pending'].includes(current) ||
		(current === 'paid' && next === 'refunded') ||
		(['failed', 'expired'].includes(current) && next === 'paid')
	);
}

export async function createSnap(input: {
	orderId: string;
	amount: number;
	name: string;
	email?: string;
}): Promise<string> {
	if (mockEnabled()) return `mock-${input.orderId}`;
	const config = midtransConfig();
	if (!config.serverKey || !config.clientKey) throw new Error('Midtrans belum dikonfigurasi');
	const url = sandbox()
		? 'https://app.sandbox.midtrans.com/snap/v1/transactions'
		: 'https://app.midtrans.com/snap/v1/transactions';
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: auth(config.serverKey),
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: JSON.stringify({
			transaction_details: { order_id: input.orderId, gross_amount: input.amount },
			customer_details: { first_name: input.name, email: input.email }
		}),
		signal: AbortSignal.timeout(10_000)
	});
	if (!response.ok) throw new Error(`Midtrans Snap gagal (${response.status})`);
	const body = (await response.json()) as { token: string };
	return body.token;
}

export async function fetchStatus(orderId: string): Promise<MidtransStatus> {
	const config = midtransConfig();
	const base = sandbox() ? 'https://api.sandbox.midtrans.com' : 'https://api.midtrans.com';
	const response = await fetch(`${base}/v2/${encodeURIComponent(orderId)}/status`, {
		headers: { Authorization: auth(config.serverKey), Accept: 'application/json' },
		signal: AbortSignal.timeout(10_000)
	});
	if (!response.ok) throw new Error(`Verifikasi Midtrans gagal (${response.status})`);
	return response.json() as Promise<MidtransStatus>;
}

export function validSignature(body: MidtransStatus): boolean {
	const serverKey = midtransConfig().serverKey;
	if (!body.signature_key || !serverKey) return false;
	const expected = new Bun.CryptoHasher('sha512')
		.update(`${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`)
		.digest('hex');
	const supplied = Buffer.from(body.signature_key.toLowerCase(), 'hex');
	const expectedBuffer = Buffer.from(expected, 'hex');
	return supplied.length === expectedBuffer.length && timingSafeEqual(supplied, expectedBuffer);
}

export type { MidtransStatus };
