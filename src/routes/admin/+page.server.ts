import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { clearAdminCookie } from '$lib/server/auth';
import { getDb, parseSocialLinks, settings, slugify } from '$lib/server/db';
import { encryptSecret, updateEnvFile } from '$lib/server/env-config';
import {
	midtransConfig,
	testMidtransCredentials,
	type MidtransEnvironment
} from '$lib/server/midtrans';

type AdminCampaign = {
	id: number;
	slug: string;
	name: string;
	kind: string;
	description: string;
	target_amount: number | null;
	is_default: number;
	is_active: number;
	total: number;
};
type AdminDonation = {
	public_id: string;
	amount: number;
	message: string;
	show_supporter: number;
	show_amount: number;
	show_in_ranking: number;
	status: string;
	created_at: string;
	campaign_name: string;
	username: string | null;
	email: string | null;
};

function guard(admin: boolean): void {
	if (!admin) throw redirect(303, '/admin/login');
}
const value = (form: FormData, key: string) => String(form.get(key) || '').trim();

function campaignValues(form: FormData) {
	const name = value(form, 'name');
	const slug = slugify(value(form, 'slug') || name);
	const targetInput = value(form, 'target_amount');
	const target = targetInput ? Number(targetInput) : null;
	if (!name || !slug) return { error: 'Nama campaign wajib diisi.' };
	if (target !== null && (!Number.isSafeInteger(target) || target <= 0))
		return { error: 'Target campaign harus berupa bilangan bulat positif.' };
	return {
		name: name.slice(0, 100),
		slug,
		kind: value(form, 'kind') || 'other',
		description: value(form, 'description').slice(0, 280),
		target
	};
}

export const load: PageServerLoad = ({ locals }) => {
	guard(locals.admin);
	const db = getDb();
	const payment = midtransConfig();
	return {
		settings: settings(),
		payment: {
			environment: payment.environment,
			merchantId: payment.merchantId,
			hasClientKey: Boolean(payment.clientKey),
			hasServerKey: Boolean(payment.serverKey)
		},
		summary: db
			.query<{ total: number; paid: number; pending: number }, []>(
				"SELECT COALESCE(SUM(CASE WHEN status='paid' THEN amount END),0) total, SUM(status='paid') paid, SUM(status='pending') pending FROM donations"
			)
			.get()!,
		campaigns: db
			.query<AdminCampaign, []>(
				"SELECT c.*, COALESCE(SUM(CASE WHEN d.status='paid' THEN d.amount END),0) total FROM campaigns c LEFT JOIN donations d ON d.campaign_id=c.id GROUP BY c.id ORDER BY c.is_default DESC, c.id DESC"
			)
			.all(),
		donations: db
			.query<AdminDonation, []>(
				`SELECT d.public_id, d.amount, d.message, d.show_supporter, d.show_amount, d.show_in_ranking, d.status, d.created_at, c.name campaign_name, o.username, o.email FROM donations d JOIN campaigns c ON c.id=d.campaign_id LEFT JOIN donors o ON o.id=d.donor_id ORDER BY d.id DESC LIMIT 100`
			)
			.all()
	};
};

export const actions: Actions = {
	settings: async ({ request, locals }) => {
		guard(locals.admin);
		const form = await request.formData();
		const minimum = Number(value(form, 'minimum_amount'));
		const presets = value(form, 'preset_amounts')
			.split(',')
			.map((item) => Number(item.trim()))
			.filter((item) => Number.isSafeInteger(item) && item > 0);
		let socialLinks;
		try {
			socialLinks = parseSocialLinks(value(form, 'social_links'));
		} catch {
			return fail(400, {
				error: 'Gunakan format tautan: Label | https://alamat.tld',
				view: 'settings'
			});
		}
		const profileImageUrl = value(form, 'profile_image_url');
		const faviconUrl = value(form, 'favicon_url');
		for (const [label, imageUrl] of [
			['Logo', profileImageUrl],
			['Favicon', faviconUrl]
		]) {
			if (!imageUrl) continue;
			try {
				if (!['http:', 'https:'].includes(new URL(imageUrl).protocol)) throw new Error();
			} catch {
				return fail(400, {
					error: `URL ${label.toLowerCase()} harus berupa alamat http atau https.`,
					view: 'settings'
				});
			}
		}
		if (
			!value(form, 'site_name') ||
			!value(form, 'creator_name') ||
			!value(form, 'headline') ||
			!value(form, 'intro_text') ||
			!Number.isSafeInteger(minimum) ||
			minimum < 1000 ||
			presets.length < 2 ||
			presets.some((preset) => preset < minimum)
		)
			return fail(400, {
				error: 'Periksa nama, headline, nominal minimum, dan preset.',
				view: 'settings'
			});
		getDb()
			.query(
				`UPDATE site_settings SET site_name=?, creator_name=?, headline=?, intro_text=?, profile_image_url=?, favicon_url=?, social_links=?, minimum_amount=?, preset_amounts=?, default_show_supporter=?, default_show_amount=?, ranking_enabled=?, updated_at=CURRENT_TIMESTAMP WHERE id=1`
			)
			.run(
				value(form, 'site_name').slice(0, 80),
				value(form, 'creator_name').slice(0, 80),
				value(form, 'headline').slice(0, 180),
				value(form, 'intro_text').slice(0, 280),
				profileImageUrl,
				faviconUrl,
				JSON.stringify(socialLinks),
				minimum,
				JSON.stringify(presets),
				form.get('default_show_supporter') === 'on' ? 1 : 0,
				form.get('default_show_amount') === 'on' ? 1 : 0,
				form.get('ranking_enabled') === 'on' ? 1 : 0
			);
		return { success: 'Pengaturan disimpan.', view: 'settings' };
	},
	payment: async ({ request, locals }) => {
		guard(locals.admin);
		const form = await request.formData();
		const environment = value(form, 'midtrans_environment') as MidtransEnvironment;
		const merchantId = value(form, 'midtrans_merchant_id');
		const masterKey = process.env.OPENSAWER_SESSION_SECRET;
		const current = midtransConfig();
		const clientKey = value(form, 'midtrans_client_key') || current.clientKey;
		const serverKey = value(form, 'midtrans_server_key') || current.serverKey;
		if (!masterKey)
			return fail(400, {
				error: 'OPENSAWER_SESSION_SECRET wajib diatur sebelum menyimpan key.',
				view: 'settings'
			});
		if (!['sandbox', 'production'].includes(environment) || !merchantId || !clientKey || !serverKey)
			return fail(400, {
				error: 'Mode, merchant ID, client key, dan server key wajib lengkap.',
				view: 'settings'
			});
		try {
			await testMidtransCredentials({ environment, clientKey, serverKey });
			updateEnvFile({
				OPENSAWER_SESSION_SECRET: masterKey,
				MIDTRANS_ENV: environment,
				MIDTRANS_MERCHANT_ID: merchantId,
				MIDTRANS_CLIENT_KEY: encryptSecret(clientKey),
				MIDTRANS_SERVER_KEY: encryptSecret(serverKey),
				MIDTRANS_MOCK: 'false'
			});
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : 'Konfigurasi pembayaran gagal disimpan.',
				view: 'settings'
			});
		}
		return {
			success: 'Koneksi Midtrans berhasil dan konfigurasi terenkripsi disimpan.',
			view: 'settings'
		};
	},
	campaign: async ({ request, locals }) => {
		guard(locals.admin);
		const form = await request.formData();
		const campaign = campaignValues(form);
		if ('error' in campaign) return fail(400, { error: campaign.error, view: 'campaigns' });
		try {
			getDb()
				.query(
					'INSERT INTO campaigns (slug,name,kind,description,target_amount) VALUES (?,?,?,?,?)'
				)
				.run(campaign.slug, campaign.name, campaign.kind, campaign.description, campaign.target);
		} catch {
			return fail(409, { error: 'Slug campaign sudah dipakai.', view: 'campaigns' });
		}
		return { success: 'Campaign dibuat.', view: 'campaigns' };
	},
	updateCampaign: async ({ request, locals }) => {
		guard(locals.admin);
		const form = await request.formData();
		const id = Number(value(form, 'id'));
		const campaign = campaignValues(form);
		if (!Number.isSafeInteger(id) || 'error' in campaign)
			return fail(400, { error: 'Periksa kembali data campaign.', view: 'campaigns' });
		try {
			const result = getDb()
				.query(
					'UPDATE campaigns SET slug=?, name=?, kind=?, description=?, target_amount=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
				)
				.run(
					campaign.slug,
					campaign.name,
					campaign.kind,
					campaign.description,
					campaign.target,
					id
				);
			if (!result.changes)
				return fail(404, { error: 'Campaign tidak ditemukan.', view: 'campaigns' });
		} catch {
			return fail(409, { error: 'Slug campaign sudah dipakai.', view: 'campaigns' });
		}
		return { success: 'Campaign diperbarui.', view: 'campaigns' };
	},
	toggleCampaign: async ({ request, locals }) => {
		guard(locals.admin);
		const form = await request.formData();
		const id = Number(value(form, 'id'));
		getDb()
			.query(
				'UPDATE campaigns SET is_active = CASE is_active WHEN 1 THEN 0 ELSE 1 END, updated_at=CURRENT_TIMESTAMP WHERE id=? AND is_default=0'
			)
			.run(id);
		return { success: 'Status campaign diperbarui.', view: 'campaigns' };
	},
	toggleRanking: async ({ request, locals }) => {
		guard(locals.admin);
		const form = await request.formData();
		getDb()
			.query(
				'UPDATE donations SET show_in_ranking = CASE show_in_ranking WHEN 1 THEN 0 ELSE 1 END WHERE public_id=?'
			)
			.run(value(form, 'id'));
		return { success: 'Visibilitas ranking diperbarui.', view: 'history' };
	},
	logout: ({ cookies }) => {
		clearAdminCookie(cookies);
		throw redirect(303, '/admin/login');
	}
};
