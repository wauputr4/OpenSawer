import type { PageServerLoad } from './$types';
import { activeCampaigns, getDb, ranking, settings } from '$lib/server/db';

export const load: PageServerLoad = () => {
	const db = getDb();
	const campaigns = activeCampaigns().map((campaign) => ({
		...campaign,
		total:
			db
				.query<{ total: number }, [number]>(
					"SELECT COALESCE(SUM(amount), 0) total FROM donations WHERE campaign_id = ? AND status = 'paid'"
				)
				.get(campaign.id)?.total || 0
	}));
	const summary = db
		.query<{ total: number; supporters: number }, []>(
			"SELECT COALESCE(SUM(amount), 0) total, COUNT(*) supporters FROM donations WHERE status = 'paid'"
		)
		.get()!;
	return { settings: settings(), campaigns, ranking: ranking(5), summary };
};
