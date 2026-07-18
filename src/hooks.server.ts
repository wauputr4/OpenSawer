import type { Handle } from '@sveltejs/kit';
import { cookieName, validAdminCookie } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.admin = await validAdminCookie(event.cookies.get(cookieName));
	return resolve(event);
};
