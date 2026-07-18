<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import LogoMark from '$lib/components/logo-mark.svelte';

	const title = $derived(
		page.status === 404
			? 'Halaman tidak ditemukan.'
			: page.status >= 500
				? 'Terjadi gangguan.'
				: 'Permintaan tidak dapat diproses.'
	);
	const description = $derived(
		page.status === 404
			? 'Tautan mungkin sudah berubah atau halaman yang kamu cari tidak tersedia.'
			: page.status >= 500
				? 'Sistem sedang mengalami kendala. Coba muat ulang beberapa saat lagi.'
				: 'Periksa kembali tautan atau kembali ke halaman utama.'
	);
</script>

<svelte:head><title>{page.status} — OpenSawer</title></svelte:head>

<section class="mx-auto flex min-h-[calc(100vh-7rem)] max-w-3xl items-center px-5 py-16">
	<div class="w-full rounded-[2rem] border bg-card p-8 shadow-sm sm:p-12">
		<div class="mb-8 flex items-center justify-between gap-4">
			<div
				class="grid size-16 place-items-center overflow-hidden rounded-full border bg-background"
			>
				<LogoMark />
			</div>
			<span class="rounded-full bg-accent px-4 py-2 text-sm font-bold tabular-nums">
				Error {page.status}
			</span>
		</div>

		<p class="text-sm font-bold tracking-[.18em] text-primary uppercase">OpenSawer</p>
		<h1 class="mt-3 font-heading text-4xl leading-tight font-semibold sm:text-6xl">{title}</h1>
		<p class="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">{description}</p>

		<div class="mt-8 flex flex-wrap gap-3">
			<Button href="/" size="lg">Kembali ke beranda</Button>
			<Button href={page.url.pathname} variant="outline" size="lg">Muat ulang</Button>
		</div>
	</div>
</section>
