import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { fetchStatus, mapStatus } from '$lib/server/midtrans';

type Donation = {
	public_id: string;
	order_id: string;
	amount: number;
	status: string;
	snap_token: string | null;
	campaign_name: string;
	created_at: string;
};

export const load: PageServerLoad = async ({ params }) => {
	const db = getDb();
	let donation = db
		.query<Donation, [string]>(
			`SELECT d.public_id, d.order_id, d.amount, d.status, d.snap_token, c.name campaign_name, d.created_at FROM donations d JOIN campaigns c ON c.id = d.campaign_id WHERE d.public_id = ?`
		)
		.get(params.id);
	if (!donation) throw error(404, 'Donasi tidak ditemukan');
	if (
		donation.status === 'pending' &&
		process.env.MIDTRANS_MOCK !== 'true' &&
		process.env.MIDTRANS_SERVER_KEY
	) {
		try {
			const status = await fetchStatus(donation.order_id);
			const mapped = mapStatus(status.transaction_status, status.fraud_status);
			db.query(
				`UPDATE donations SET status = ?, payment_type = ?, provider_transaction_id = ?, paid_at = CASE WHEN ? = 'paid' THEN COALESCE(paid_at, CURRENT_TIMESTAMP) ELSE paid_at END, updated_at = CURRENT_TIMESTAMP WHERE order_id = ? AND status != 'paid'`
			).run(
				mapped,
				status.payment_type || null,
				status.transaction_id || null,
				mapped,
				donation.order_id
			);
			donation = { ...donation, status: mapped };
		} catch {
			/* webhook remains authoritative; keep pending */
		}
	}
	return {
		donation,
		mock: process.env.MIDTRANS_MOCK === 'true',
		clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
		snapUrl:
			(process.env.MIDTRANS_ENV || 'sandbox') === 'production'
				? 'https://app.midtrans.com/snap/snap.js'
				: 'https://app.sandbox.midtrans.com/snap/snap.js'
	};
};

export const actions: Actions = {
	mockPaid: async ({ params }) => {
		if (process.env.MIDTRANS_MOCK !== 'true') return fail(404);
		getDb()
			.query(
				"UPDATE donations SET status = 'paid', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE public_id = ?"
			)
			.run(params.id);
		return { success: true };
	}
};
