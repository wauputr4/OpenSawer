export function turnstileSiteKey(): string {
	const siteKey = process.env.PUBLIC_TURNSTILE_SITE_KEY || process.env.TURNSTILE_SITE_KEY;
	return process.env.TURNSTILE_ENABLED !== 'false' && siteKey && process.env.TURNSTILE_SECRET_KEY
		? siteKey
		: '';
}

export async function verifyTurnstile(token: string, remoteIp?: string): Promise<boolean> {
	const secret = process.env.TURNSTILE_SECRET_KEY;
	if (!turnstileSiteKey()) return true;
	if (!secret || !token) return false;
	const body = new FormData();
	body.set('secret', secret);
	body.set('response', token);
	if (remoteIp) body.set('remoteip', remoteIp);
	try {
		const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			body,
			signal: AbortSignal.timeout(10_000)
		});
		if (!response.ok) return false;
		return ((await response.json()) as { success?: boolean }).success === true;
	} catch {
		return false;
	}
}
