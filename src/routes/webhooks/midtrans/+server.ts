import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { fetchStatus, mapStatus, validSignature, type MidtransStatus } from '$lib/server/midtrans';

export const POST: RequestHandler = async ({ request }) => {
	let notification: MidtransStatus;
	try {
		notification = await request.json();
	} catch {
		return json({ error: 'invalid json' }, { status: 400 });
	}
	if (!validSignature(notification)) return json({ error: 'invalid signature' }, { status: 401 });
	let canonical: MidtransStatus;
	try {
		canonical = await fetchStatus(notification.order_id);
	} catch {
		return json({ error: 'verification failed' }, { status: 502 });
	}
	if (canonical.order_id !== notification.order_id)
		return json({ error: 'order mismatch' }, { status: 400 });
	const db = getDb();
	const donation = db
		.query<{ amount: number; status: string }, [string]>(
			'SELECT amount, status FROM donations WHERE order_id = ?'
		)
		.get(canonical.order_id);
	if (!donation) return json({ error: 'unknown order' }, { status: 404 });
	if (Number(canonical.gross_amount) !== donation.amount)
		return json({ error: 'amount mismatch' }, { status: 400 });
	const mapped = mapStatus(canonical.transaction_status, canonical.fraud_status);
	if (donation.status !== 'paid' || mapped === 'refunded') {
		db.query(
			`UPDATE donations SET status = ?, payment_type = ?, provider_transaction_id = ?, paid_at = CASE WHEN ? = 'paid' THEN COALESCE(paid_at, CURRENT_TIMESTAMP) ELSE paid_at END, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?`
		).run(
			mapped,
			canonical.payment_type || null,
			canonical.transaction_id || null,
			mapped,
			canonical.order_id
		);
	}
	return json({ ok: true });
};
