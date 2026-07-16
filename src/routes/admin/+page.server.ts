import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { clearAdminCookie } from '$lib/server/auth';
import { getDb, settings, slugify } from '$lib/server/db';

type AdminCampaign = {
	id: number;
	name: string;
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

export const load: PageServerLoad = ({ locals }) => {
	guard(locals.admin);
	const db = getDb();
	return {
		settings: settings(),
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
		if (
			!value(form, 'site_name') ||
			!value(form, 'headline') ||
			!Number.isSafeInteger(minimum) ||
			minimum < 1000 ||
			presets.length < 2
		)
			return fail(400, { error: 'Periksa nama, headline, nominal minimum, dan preset.' });
		getDb()
			.query(
				`UPDATE site_settings SET site_name=?, headline=?, minimum_amount=?, preset_amounts=?, default_show_supporter=?, default_show_amount=?, ranking_enabled=?, updated_at=CURRENT_TIMESTAMP WHERE id=1`
			)
			.run(
				value(form, 'site_name').slice(0, 80),
				value(form, 'headline').slice(0, 180),
				minimum,
				JSON.stringify(presets),
				form.get('default_show_supporter') === 'on' ? 1 : 0,
				form.get('default_show_amount') === 'on' ? 1 : 0,
				form.get('ranking_enabled') === 'on' ? 1 : 0
			);
		return { success: 'Pengaturan disimpan.' };
	},
	campaign: async ({ request, locals }) => {
		guard(locals.admin);
		const form = await request.formData();
		const name = value(form, 'name');
		const slug = slugify(value(form, 'slug') || name);
		const target = Number(value(form, 'target_amount')) || null;
		if (!name || !slug) return fail(400, { error: 'Nama campaign wajib diisi.' });
		try {
			getDb()
				.query(
					'INSERT INTO campaigns (slug,name,kind,description,target_amount) VALUES (?,?,?,?,?)'
				)
				.run(
					slug,
					name.slice(0, 100),
					value(form, 'kind') || 'other',
					value(form, 'description').slice(0, 280),
					target
				);
		} catch {
			return fail(409, { error: 'Slug campaign sudah dipakai.' });
		}
		return { success: 'Campaign dibuat.' };
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
		return { success: 'Status campaign diperbarui.' };
	},
	toggleRanking: async ({ request, locals }) => {
		guard(locals.admin);
		const form = await request.formData();
		getDb()
			.query(
				'UPDATE donations SET show_in_ranking = CASE show_in_ranking WHEN 1 THEN 0 ELSE 1 END WHERE public_id=?'
			)
			.run(value(form, 'id'));
		return { success: 'Visibilitas ranking diperbarui.' };
	},
	logout: ({ cookies }) => {
		clearAdminCookie(cookies);
		throw redirect(303, '/admin/login');
	}
};
