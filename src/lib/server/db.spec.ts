import { afterEach, describe, expect, test } from 'vitest';
import {
	activeCampaigns,
	getDb,
	parseSocialLinks,
	ranking,
	resetDbForTests,
	settings,
	slugify
} from './db';

afterEach(() => resetDbForTests());

describe('database defaults', () => {
	test('creates an open default campaign without a target', () => {
		getDb(':memory:');
		expect(settings().default_show_supporter).toBe(1);
		expect(settings().default_show_amount).toBe(1);
		expect(settings().profile_image_url).toBe('');
		expect(settings().social_links).toBe('[]');
		expect(activeCampaigns()).toMatchObject([{ is_default: 1, target_amount: null }]);
	});

	test('ranking orders hidden amounts while respecting public identity', () => {
		const db = getDb(':memory:');
		const campaign = activeCampaigns()[0];
		db.query(
			"INSERT INTO donors (username,email,verified_at) VALUES ('nabila','nabila@example.com',CURRENT_TIMESTAMP)"
		).run();
		db.query(
			`INSERT INTO donations (public_id,order_id,campaign_id,donor_id,amount,show_supporter,show_amount,status) VALUES
			('one','one',?,1,75000,1,0,'paid'), ('two','two',?,NULL,50000,0,1,'paid')`
		).run(campaign.id, campaign.id);
		expect(ranking()).toEqual([
			{ username: 'nabila', total: 75000, show_amount: 0 },
			{ username: 'Anonim', total: 50000, show_amount: 1 }
		]);
	});

	test('normalizes campaign slugs', () => {
		expect(slugify('Bantu Karya #1')).toBe('bantu-karya-1');
	});

	test('parses customizable public links', () => {
		expect(parseSocialLinks('Instagram | https://instagram.com/opensawer')).toEqual([
			{ label: 'Instagram', url: 'https://instagram.com/opensawer' }
		]);
		expect(() => parseSocialLinks('Script | javascript:alert(1)')).toThrow();
	});
});
