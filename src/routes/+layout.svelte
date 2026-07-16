<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import LogoMark from '$lib/components/logo-mark.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#0f513f" />
	<meta
		name="description"
		content="OpenSawer — halaman dukungan mandiri yang ringan dan terbuka."
	/>
</svelte:head>

<div class="min-h-screen">
	<a href="#main-content" class="skip-link">Lewati ke konten utama</a>
	<header class="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-8">
		<a
			href={resolve('/')}
			class="group flex items-center gap-2.5 font-semibold tracking-tight"
			aria-label="OpenSawer beranda"
		>
			<span class="transition-transform group-hover:-rotate-6"><LogoMark /></span>
			OpenSawer
		</a>
		<a
			href={resolve('/sawer')}
			class="text-sm font-semibold text-primary underline-offset-4 hover:underline"
			>Kirim dukungan</a
		>
	</header>
	<main id="main-content" tabindex="-1">{@render children()}</main>
	<footer
		class="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:justify-between lg:px-8"
	>
		<p>Dibuat agar dukungan terasa dekat.</p>
		<a
			href={resolve('/admin/login')}
			class="underline-offset-4 hover:text-foreground hover:underline">Masuk admin</a
		>
	</footer>
</div>
