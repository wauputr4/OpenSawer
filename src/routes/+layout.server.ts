import type { LayoutServerLoad } from './$types';
import { settings } from '$lib/server/db';

export const load: LayoutServerLoad = () => ({ faviconUrl: settings().favicon_url });
