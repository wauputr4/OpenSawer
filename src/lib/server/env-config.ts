import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import {
	chmodSync,
	copyFileSync,
	existsSync,
	readFileSync,
	renameSync,
	unlinkSync,
	writeFileSync
} from 'node:fs';

const encryptedPrefix = 'enc:v1:';

function encryptionKey(): Buffer {
	const secret = process.env.OPENSAWER_SESSION_SECRET;
	if (!secret) throw new Error('OPENSAWER_SESSION_SECRET wajib diatur sebelum menyimpan key');
	return createHash('sha256').update(secret).digest();
}

export function encryptSecret(value: string): string {
	const iv = randomBytes(12);
	const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
	const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
	return `${encryptedPrefix}${iv.toString('base64url')}:${cipher.getAuthTag().toString('base64url')}:${encrypted.toString('base64url')}`;
}

export function decryptSecret(value: string): string {
	if (!value.startsWith(encryptedPrefix)) return value;
	const [iv, tag, encrypted] = value.slice(encryptedPrefix.length).split(':');
	if (!iv || !tag || !encrypted) throw new Error('Format secret terenkripsi tidak valid');
	const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64url'));
	decipher.setAuthTag(Buffer.from(tag, 'base64url'));
	return Buffer.concat([
		decipher.update(Buffer.from(encrypted, 'base64url')),
		decipher.final()
	]).toString('utf8');
}

export function secretEnv(name: string): string {
	return decryptSecret(process.env[name] || '');
}

export function updateEnvFile(values: Record<string, string>): void {
	const path = process.env.OPENSAWER_ENV_PATH || '.env';
	const lines = existsSync(path) ? readFileSync(path, 'utf8').split(/\r?\n/) : [];
	const remaining = new Map(Object.entries(values));
	const updated = lines.map((line) => {
		const match = line.match(/^([A-Z][A-Z0-9_]*)=/);
		if (!match || !remaining.has(match[1])) return line;
		const value = remaining.get(match[1])!;
		remaining.delete(match[1]);
		return `${match[1]}=${JSON.stringify(value)}`;
	});
	while (updated.at(-1) === '') updated.pop();
	if (updated.length && remaining.size) updated.push('');
	for (const [name, value] of remaining) updated.push(`${name}=${JSON.stringify(value)}`);
	updated.push('');
	const temporary = `${path}.tmp`;
	writeFileSync(temporary, updated.join('\n'), { mode: 0o600 });
	try {
		renameSync(temporary, path);
	} catch (error) {
		if (!(error instanceof Error) || !('code' in error) || error.code !== 'EBUSY') throw error;
		// ponytail: bind-mounted files cannot be atomically renamed; copy the completed temp file instead.
		copyFileSync(temporary, path);
		unlinkSync(temporary);
	}
	try {
		chmodSync(path, 0o600);
	} catch (error) {
		if (
			!(error instanceof Error) ||
			!('code' in error) ||
			!['EPERM', 'ENOTSUP'].includes(String(error.code))
		)
			throw error;
	}
	for (const [name, value] of Object.entries(values)) process.env[name] = value;
}
