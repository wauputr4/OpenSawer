import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { activeCampaigns, getDb, settings } from '$lib/server/db';
import { codeHash, sendCode } from '$lib/server/email';
import { googleConfigured, googleCookieName, googleIdentity } from '$lib/server/google';
import { createSnap } from '$lib/server/midtrans';

const text = (data: FormData, key: string) => String(data.get(key) || '').trim();
const emailValue = (data: FormData) => text(data, 'email').toLowerCase();
const usernameValue = (data: FormData) => text(data, 'username').toLowerCase();
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validUsername = (value: string) => /^[a-z0-9][a-z0-9_-]{2,29}$/.test(value);

export const load: PageServerLoad = async ({ url, cookies }) => ({
	settings: settings(),
	campaigns: activeCampaigns(),
	selected: url.searchParams.get('campaign') || '',
	googleConfigured: googleConfigured(),
	googleEmail: await googleIdentity(cookies.get(googleCookieName)),
	googleStatus: url.searchParams.get('google') || ''
});

export const actions: Actions = {
	requestCode: async ({ request }) => {
		const data = await request.formData();
		const email = emailValue(data);
		const username = usernameValue(data);
		if (!validUsername(username))
			return fail(400, {
				action: 'code',
				error: 'Username harus 3–30 karakter: huruf kecil, angka, _ atau -.',
				email,
				username
			});
		if (!validEmail(email))
			return fail(400, { action: 'code', error: 'Masukkan email yang valid.', email, username });
		const db = getDb();
		const conflict = db
			.query<{ username: string; email: string }, [string, string]>(
				'SELECT username, email FROM donors WHERE username = ? COLLATE NOCASE OR email = ? COLLATE NOCASE LIMIT 1'
			)
			.get(username, email);
		if (
			conflict &&
			(conflict.username.toLowerCase() !== username || conflict.email.toLowerCase() !== email)
		) {
			return fail(409, {
				action: 'code',
				error: 'Username atau email sudah terhubung dengan identitas lain.',
				email,
				username
			});
		}
		const recent =
			db
				.query<{ count: number }, [string]>(
					"SELECT COUNT(*) count FROM email_verifications WHERE email = ? AND created_at > datetime('now', '-15 minutes')"
				)
				.get(email)?.count || 0;
		if (recent >= 3)
			return fail(429, {
				action: 'code',
				error: 'Terlalu banyak permintaan kode. Coba lagi dalam 15 menit.',
				email,
				username
			});
		const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, '0');
		db.run('DELETE FROM email_verifications WHERE expires_at < CURRENT_TIMESTAMP');
		db.query(
			"INSERT INTO email_verifications (email, username, token_hash, expires_at) VALUES (?, ?, ?, datetime('now', '+10 minutes'))"
		).run(email, username, codeHash(email, username, code));
		try {
			const sent = await sendCode(email, code);
			return { action: 'code', success: true, email, username, previewCode: sent.previewCode };
		} catch (error) {
			return fail(500, {
				action: 'code',
				error: error instanceof Error ? error.message : 'Kode gagal dikirim.',
				email,
				username
			});
		}
	},

	donate: async ({ request, cookies }) => {
		const data = await request.formData();
		const anonymous = data.get('anonymous') === 'on';
		const amount = Number(text(data, 'amount'));
		const campaignId = Number(text(data, 'campaign_id'));
		const config = settings();
		if (!Number.isSafeInteger(amount) || amount < config.minimum_amount || amount > 100_000_000)
			return fail(400, {
				action: 'donate',
				error: `Nominal minimal Rp${config.minimum_amount.toLocaleString('id-ID')}.`
			});
		const db = getDb();
		const campaign = db
			.query<{ id: number }, [number]>('SELECT id FROM campaigns WHERE id = ? AND is_active = 1')
			.get(campaignId);
		if (!campaign) return fail(400, { action: 'donate', error: 'Campaign tidak tersedia.' });
		let donorId: number | null = null;
		let name = 'Anonim';
		let email: string | undefined;
		if (!anonymous) {
			const username = usernameValue(data);
			if (!validUsername(username))
				return fail(400, {
					action: 'donate',
					error: 'Username harus 3–30 karakter: huruf kecil, angka, _ atau -.'
				});
			let verificationId: number | undefined;
			if (text(data, 'identity_method') === 'google') {
				email = await googleIdentity(cookies.get(googleCookieName));
				if (!email)
					return fail(400, {
						action: 'donate',
						error: 'Hubungkan akun Google terlebih dahulu.'
					});
			} else {
				email = emailValue(data);
				const code = text(data, 'code');
				if (!validEmail(email) || !/^\d{6}$/.test(code))
					return fail(400, {
						action: 'donate',
						error: 'Lengkapi email dan kode 6 digit.'
					});
				verificationId = db
					.query<{ id: number }, [string, string, string]>(
						'SELECT id FROM email_verifications WHERE email = ? AND username = ? AND token_hash = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP ORDER BY id DESC LIMIT 1'
					)
					.get(email, username, codeHash(email, username, code))?.id;
				if (!verificationId)
					return fail(400, {
						action: 'donate',
						error: 'Kode verifikasi salah atau kedaluwarsa.'
					});
			}
			const conflict = db
				.query<{ id: number; username: string; email: string }, [string, string]>(
					'SELECT id, username, email FROM donors WHERE username = ? COLLATE NOCASE OR email = ? COLLATE NOCASE LIMIT 1'
				)
				.get(username, email);
			if (
				conflict &&
				(conflict.username.toLowerCase() !== username || conflict.email.toLowerCase() !== email)
			)
				return fail(409, { action: 'donate', error: 'Identitas tidak cocok.' });
			if (conflict) donorId = conflict.id;
			else
				donorId = Number(
					db
						.query<{ id: number }, [string, string]>(
							'INSERT INTO donors (username, email, verified_at) VALUES (?, ?, CURRENT_TIMESTAMP) RETURNING id'
						)
						.get(username, email)?.id
				);
			if (verificationId)
				db.query('UPDATE email_verifications SET used_at = CURRENT_TIMESTAMP WHERE id = ?').run(
					verificationId
				);
			name = username;
		}

		const publicId = crypto.randomUUID();
		const orderId = `OS-${Date.now()}-${publicId.slice(0, 8)}`;
		const showSupporter = anonymous ? 0 : data.get('show_supporter') === 'on' ? 1 : 0;
		const showAmount = data.get('show_amount') === 'on' ? 1 : 0;
		db.query(
			`INSERT INTO donations (public_id, order_id, campaign_id, donor_id, amount, message, show_supporter, show_amount, status)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'created')`
		).run(
			publicId,
			orderId,
			campaignId,
			donorId,
			amount,
			text(data, 'message').slice(0, 280),
			showSupporter,
			showAmount
		);
		try {
			const token = await createSnap({ orderId, amount, name, email });
			db.query(
				"UPDATE donations SET snap_token = ?, status = 'pending', updated_at = CURRENT_TIMESTAMP WHERE public_id = ?"
			).run(token, publicId);
		} catch (error) {
			console.error('Gagal membuat pembayaran', error);
			db.query(
				"UPDATE donations SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE public_id = ?"
			).run(publicId);
			return fail(502, {
				action: 'donate',
				error: 'Layanan pembayaran belum tersedia. Coba lagi nanti.'
			});
		}
		throw redirect(303, `/sawer/${publicId}`);
	}
};
