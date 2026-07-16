<script lang="ts">
	import { onMount } from 'svelte';
	import { LockKeyhole } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	let { data, form } = $props();

	onMount(() => {
		if (!data.turnstileSiteKey) return;
		const script = document.createElement('script');
		script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
		script.async = true;
		script.defer = true;
		script.onload = () => {
			const turnstile = (
				window as typeof window & {
					turnstile?: {
						render: (
							selector: string,
							options: { sitekey: string; theme: string; appearance: string }
						) => string;
					};
				}
			).turnstile;
			turnstile?.render('#turnstile-widget', {
				sitekey: data.turnstileSiteKey,
				theme: 'light',
				appearance: 'always'
			});
		};
		document.head.appendChild(script);
		return () => script.remove();
	});
</script>

<svelte:head><title>Masuk admin — OpenSawer</title></svelte:head>
<section class="mx-auto max-w-md px-5 py-14 lg:px-8">
	<div class="rounded-[1.75rem] border bg-card p-7 sm:p-9">
		<span class="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground"
			><LockKeyhole class="size-5" /></span
		>
		<h1 class="mt-6 font-heading text-3xl font-semibold">Ruang pengelola</h1>
		<p class="mt-2 text-sm text-muted-foreground">
			Satu akun pemilik untuk mengelola seluruh instance.
		</p>
		{#if form?.error}<p
				role="alert"
				class="mt-5 rounded-lg bg-destructive/8 p-3 text-sm text-destructive"
			>
				{form.error}
			</p>{/if}
		<form method="POST" class="mt-7 space-y-4">
			<div>
				<label for="username" class="mb-1.5 block text-sm font-bold">Username</label><Input
					id="username"
					name="username"
					autocomplete="username"
					required
				/>
			</div>
			<div>
				<label for="password" class="mb-1.5 block text-sm font-bold">Password</label><Input
					id="password"
					name="password"
					type="password"
					autocomplete="current-password"
					required
				/>
			</div>
			{#if data.turnstileSiteKey}<div class="rounded-xl border bg-background p-3">
					<p class="mb-2 text-xs font-bold text-muted-foreground">Cloudflare Turnstile</p>
					<div id="turnstile-widget" class="min-h-16"></div>
				</div>{/if}
			<Button type="submit" class="mt-2 w-full rounded-full" size="lg">Masuk</Button>
		</form>
	</div>
</section>
