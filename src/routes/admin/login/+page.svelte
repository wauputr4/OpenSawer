<script lang="ts">
	import { LockKeyhole } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	let { form } = $props();
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
			<Button type="submit" class="mt-2 w-full rounded-full" size="lg">Masuk</Button>
		</form>
	</div>
</section>
