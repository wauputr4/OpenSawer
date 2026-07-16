import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { setAdminCookie, verifyAdmin } from '$lib/server/auth';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.admin) throw redirect(303, '/admin');
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		if (
			!(await verifyAdmin(String(data.get('username') || ''), String(data.get('password') || '')))
		)
			return fail(400, { error: 'Username atau password salah.' });
		await setAdminCookie(cookies);
		throw redirect(303, '/admin');
	}
};
