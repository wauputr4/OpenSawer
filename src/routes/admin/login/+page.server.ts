import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { setAdminCookie, verifyAdmin } from '$lib/server/auth';
import { turnstileSiteKey, verifyTurnstile } from '$lib/server/turnstile';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.admin) throw redirect(303, '/admin');
	return { turnstileSiteKey: turnstileSiteKey() };
};

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		const data = await request.formData();
		let clientAddress: string | undefined;
		try {
			clientAddress = getClientAddress();
		} catch {
			// Turnstile accepts an omitted remote address.
		}
		if (!(await verifyTurnstile(String(data.get('cf-turnstile-response') || ''), clientAddress))) {
			await new Promise((resolve) => setTimeout(resolve, 1_000));
			return fail(400, { error: 'Verifikasi keamanan gagal. Muat ulang lalu coba lagi.' });
		}
		if (
			!(await verifyAdmin(String(data.get('username') || ''), String(data.get('password') || '')))
		) {
			await new Promise((resolve) => setTimeout(resolve, 1_000));
			return fail(400, { error: 'Username atau password salah.' });
		}
		await setAdminCookie(cookies);
		throw redirect(303, '/admin');
	}
};
