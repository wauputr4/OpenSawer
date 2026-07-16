import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';

export const GET: RequestHandler = () => {
	getDb().query('SELECT 1').get();
	return json({ status: 'ok' });
};
