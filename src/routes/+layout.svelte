<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';

	let { data, children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={data.faviconUrl || favicon} />
	<meta name="theme-color" content="#0f513f" />
	<meta
		name="description"
		content="OpenSawer — halaman dukungan mandiri yang ringan dan terbuka."
	/>
</svelte:head>

<div class="min-h-screen">
	<a href="#main-content" class="skip-link">Lewati ke konten utama</a>
	<main id="main-content" tabindex="-1">{@render children()}</main>
	<footer
		class="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-5 gap-y-3 px-5 py-10 text-sm lg:px-8"
	>
		<a href={resolve('/faq')} class="text-muted-foreground transition hover:text-foreground">FAQ</a>
		<a href={resolve('/terms')} class="text-muted-foreground transition hover:text-foreground"
			>Ketentuan</a
		>
		<a href={resolve('/privacy')} class="text-muted-foreground transition hover:text-foreground"
			>Privasi</a
		>
		<a
			href="https://github.com/wauputr4/OpenSawer"
			target="_blank"
			rel="noreferrer"
			class="flex items-center gap-2 border-l pl-5 text-muted-foreground transition hover:text-foreground"
			aria-label="Build by OpenSawer — buka repositori GitHub"
			><svg class="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
				><path
					d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.29-1.69-1.29-1.69-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.38.97.1-.75.4-1.27.74-1.56-2.57-.29-5.27-1.29-5.27-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.71 5.4-5.29 5.69.42.36.79 1.06.79 2.14v3.18c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z"
				/></svg
			> Build by OpenSawer</a
		>
	</footer>
</div>
