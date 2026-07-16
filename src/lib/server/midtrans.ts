import { timingSafeEqual } from 'node:crypto';

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

const sandbox = () => (process.env.MIDTRANS_ENV || 'sandbox') !== 'production';
const auth = () =>
	`Basic ${Buffer.from(`${process.env.MIDTRANS_SERVER_KEY || ''}:`).toString('base64')}`;

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

export async function createSnap(input: {
	orderId: string;
	amount: number;
	name: string;
	email?: string;
}): Promise<string> {
	if (process.env.MIDTRANS_MOCK === 'true') return `mock-${input.orderId}`;
	if (!process.env.MIDTRANS_SERVER_KEY || !process.env.MIDTRANS_CLIENT_KEY)
		throw new Error('Midtrans belum dikonfigurasi');
	const url = sandbox()
		? 'https://app.sandbox.midtrans.com/snap/v1/transactions'
		: 'https://app.midtrans.com/snap/v1/transactions';
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: auth(),
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: JSON.stringify({
			transaction_details: { order_id: input.orderId, gross_amount: input.amount },
			customer_details: { first_name: input.name, email: input.email }
		})
	});
	if (!response.ok) throw new Error(`Midtrans Snap gagal (${response.status})`);
	const body = (await response.json()) as { token: string };
	return body.token;
}

export async function fetchStatus(orderId: string): Promise<MidtransStatus> {
	const base = sandbox() ? 'https://api.sandbox.midtrans.com' : 'https://api.midtrans.com';
	const response = await fetch(`${base}/v2/${encodeURIComponent(orderId)}/status`, {
		headers: { Authorization: auth(), Accept: 'application/json' }
	});
	if (!response.ok) throw new Error(`Verifikasi Midtrans gagal (${response.status})`);
	return response.json() as Promise<MidtransStatus>;
}

export function validSignature(body: MidtransStatus): boolean {
	if (!body.signature_key || !process.env.MIDTRANS_SERVER_KEY) return false;
	const expected = new Bun.CryptoHasher('sha512')
		.update(
			`${body.order_id}${body.status_code}${body.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`
		)
		.digest('hex');
	const supplied = body.signature_key.toLowerCase();
	return (
		supplied.length === expected.length &&
		timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
	);
}

export type { MidtransStatus };
