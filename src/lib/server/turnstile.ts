const testSiteKey = '1x00000000000000000000AA';
const testSecretKey = '1x0000000000000000000000000000000AA';

export function turnstileSiteKey(): string {
	return (
		process.env.TURNSTILE_SITE_KEY || (process.env.NODE_ENV === 'production' ? '' : testSiteKey)
	);
}

export async function verifyTurnstile(token: string, remoteIp?: string): Promise<boolean> {
	const secret =
		process.env.TURNSTILE_SECRET_KEY ||
		(process.env.NODE_ENV === 'production' ? '' : testSecretKey);
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
