import { Database } from 'bun:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export type Campaign = {
	id: number;
	slug: string;
	name: string;
	kind: string;
	description: string;
	target_amount: number | null;
	is_default: number;
	is_active: number;
};

export type SiteSettings = {
	site_name: string;
	creator_name: string;
	headline: string;
	intro_text: string;
	receipt_quote: string;
	profile_image_url: string;
	favicon_url: string;
	social_links: string;
	minimum_amount: number;
	preset_amounts: string;
	default_show_supporter: number;
	default_show_amount: number;
	ranking_enabled: number;
};

const schema = `
CREATE TABLE IF NOT EXISTS site_settings (
 id INTEGER PRIMARY KEY CHECK (id = 1), site_name TEXT NOT NULL, creator_name TEXT NOT NULL DEFAULT 'Nama Creator', headline TEXT NOT NULL,
	intro_text TEXT NOT NULL DEFAULT 'Kirim dukungan tanpa membuat akun. Pilih nominal, tulis pesan, lalu selesaikan pembayaran dengan aman.',
	receipt_quote TEXT NOT NULL DEFAULT 'Yang kecil tetap berarti ketika datang bersama.',
 minimum_amount INTEGER NOT NULL CHECK (minimum_amount > 0), preset_amounts TEXT NOT NULL,
 default_show_supporter INTEGER NOT NULL DEFAULT 1 CHECK (default_show_supporter IN (0,1)),
	default_show_amount INTEGER NOT NULL DEFAULT 1 CHECK (default_show_amount IN (0,1)),
	ranking_enabled INTEGER NOT NULL DEFAULT 1 CHECK (ranking_enabled IN (0,1)),
	profile_image_url TEXT NOT NULL DEFAULT '', favicon_url TEXT NOT NULL DEFAULT '', social_links TEXT NOT NULL DEFAULT '[]',
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS campaigns (
 id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL COLLATE NOCASE UNIQUE,
 name TEXT NOT NULL, kind TEXT NOT NULL DEFAULT 'general', description TEXT NOT NULL DEFAULT '',
 target_amount INTEGER CHECK (target_amount IS NULL OR target_amount > 0),
 is_default INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0,1)),
 is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS campaigns_one_default ON campaigns(is_default) WHERE is_default = 1;
CREATE TABLE IF NOT EXISTS donors (
 id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL COLLATE NOCASE UNIQUE,
 email TEXT NOT NULL COLLATE NOCASE UNIQUE, verified_at TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS email_verifications (
 id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, username TEXT NOT NULL,
 token_hash TEXT NOT NULL, expires_at TEXT NOT NULL, used_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS email_verifications_lookup ON email_verifications(email, username, created_at);
CREATE TABLE IF NOT EXISTS donations (
 id INTEGER PRIMARY KEY AUTOINCREMENT, public_id TEXT NOT NULL UNIQUE, order_id TEXT NOT NULL UNIQUE,
 campaign_id INTEGER NOT NULL REFERENCES campaigns(id), donor_id INTEGER REFERENCES donors(id),
 amount INTEGER NOT NULL CHECK (amount > 0), message TEXT NOT NULL DEFAULT '',
 show_supporter INTEGER NOT NULL DEFAULT 1 CHECK (show_supporter IN (0,1)),
 show_amount INTEGER NOT NULL DEFAULT 1 CHECK (show_amount IN (0,1)),
 show_in_ranking INTEGER NOT NULL DEFAULT 1 CHECK (show_in_ranking IN (0,1)),
 status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created','pending','paid','failed','expired','refunded')),
 snap_token TEXT, payment_type TEXT, provider_transaction_id TEXT,
 paid_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS donations_provider_tx ON donations(provider_transaction_id) WHERE provider_transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS donations_status_ranking ON donations(status, show_in_ranking);
`;

let database: Database | undefined;

export function getDb(path = process.env.OPENSAWER_DB_PATH || './data/opensawer.db'): Database {
	if (database) return database;
	if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
	database = new Database(path, { create: true, strict: true });
	database.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
	database.exec(schema);
	const settingColumns = new Set(
		database
			.query<{ name: string }, []>('PRAGMA table_info(site_settings)')
			.all()
			.map((column) => column.name)
	);
	if (!settingColumns.has('profile_image_url'))
		database.exec(
			"ALTER TABLE site_settings ADD COLUMN profile_image_url TEXT NOT NULL DEFAULT ''"
		);
	if (!settingColumns.has('favicon_url'))
		database.exec("ALTER TABLE site_settings ADD COLUMN favicon_url TEXT NOT NULL DEFAULT ''");
	if (!settingColumns.has('social_links'))
		database.exec("ALTER TABLE site_settings ADD COLUMN social_links TEXT NOT NULL DEFAULT '[]'");
	if (!settingColumns.has('creator_name'))
		database.exec(
			"ALTER TABLE site_settings ADD COLUMN creator_name TEXT NOT NULL DEFAULT 'Nama Creator'"
		);
	if (!settingColumns.has('intro_text'))
		database.exec(
			"ALTER TABLE site_settings ADD COLUMN intro_text TEXT NOT NULL DEFAULT 'Kirim dukungan tanpa membuat akun. Pilih nominal, tulis pesan, lalu selesaikan pembayaran dengan aman.'"
		);
	if (!settingColumns.has('receipt_quote'))
		database.exec(
			"ALTER TABLE site_settings ADD COLUMN receipt_quote TEXT NOT NULL DEFAULT 'Yang kecil tetap berarti ketika datang bersama.'"
		);
	database.run(`INSERT OR IGNORE INTO site_settings
		(id, site_name, headline, minimum_amount, preset_amounts)
		VALUES (1, 'OpenSawer', 'Dukungan kecil, langkah yang berarti.', 10000, '[10000,25000,50000,100000]')`);
	database.run(`INSERT OR IGNORE INTO campaigns
		(slug, name, kind, description, is_default, is_active)
		VALUES ('general-support', 'Sawer aku', 'general', 'Bantu karya ini terus berjalan.', 1, 1)`);
	database.run(
		"UPDATE campaigns SET name = 'Sawer aku' WHERE is_default = 1 AND name = 'Dukungan Umum'"
	);
	return database;
}

export function resetDbForTests(): void {
	database?.close();
	database = undefined;
}

export function settings(): SiteSettings {
	return getDb().query<SiteSettings, []>('SELECT * FROM site_settings WHERE id = 1').get()!;
}

export function activeCampaigns(): Campaign[] {
	return getDb()
		.query<Campaign, []>(
			'SELECT * FROM campaigns WHERE is_active = 1 ORDER BY is_default DESC, id DESC'
		)
		.all();
}

export function ranking(
	limit = 5
): Array<{ username: string; total: number; show_amount: number }> {
	return getDb()
		.query<{ username: string; total: number; show_amount: number }, [number]>(
			`
		SELECT CASE WHEN d.donor_id IS NULL OR MIN(d.show_supporter) = 0 THEN 'Anonim' ELSE MIN(o.username) END username,
		SUM(d.amount) total, MIN(d.show_amount) show_amount
		FROM donations d LEFT JOIN donors o ON o.id = d.donor_id
		WHERE d.status = 'paid' AND d.show_in_ranking = 1
		GROUP BY CASE WHEN d.donor_id IS NULL OR d.show_supporter = 0 THEN 'donation-' || d.id ELSE 'donor-' || d.donor_id END
		ORDER BY total DESC LIMIT ?`
		)
		.all(limit);
}

export function slugify(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')
		.slice(0, 60);
}

export type SocialLink = { label: string; url: string };

export function parseSocialLinks(value: string): SocialLink[] {
	return value
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
		.slice(0, 6)
		.map((line) => {
			const separator = line.indexOf('|');
			const label = line.slice(0, separator).trim();
			const rawUrl = line.slice(separator + 1).trim();
			if (separator < 1 || !label || label.length > 30)
				throw new Error('Format tautan tidak valid');
			const url = new URL(rawUrl);
			if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Format tautan tidak valid');
			return { label, url: url.toString() };
		});
}

export function storedSocialLinks(value: string): SocialLink[] {
	try {
		const links = JSON.parse(value) as unknown;
		if (!Array.isArray(links)) return [];
		return links.filter(
			(link): link is SocialLink =>
				typeof link === 'object' &&
				link !== null &&
				typeof (link as SocialLink).label === 'string' &&
				typeof (link as SocialLink).url === 'string'
		);
	} catch {
		return [];
	}
}
