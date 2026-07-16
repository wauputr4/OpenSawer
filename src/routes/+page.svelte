<script lang="ts">
	import { ArrowRight, ExternalLink, EyeOff, Target, Trophy } from '@lucide/svelte';
	import { rupiah } from '$lib/format';
	import { Button } from '$lib/components/ui/button';
	import { Progress } from '$lib/components/ui/progress';
	import { resolve } from '$app/paths';
	import LogoMark from '$lib/components/logo-mark.svelte';
	let { data } = $props();
</script>

<svelte:head><title>{data.settings.site_name} — Kirim dukungan</title></svelte:head>

<section
	class="mx-auto grid max-w-6xl gap-12 px-5 pt-10 pb-16 lg:grid-cols-[1.15fr_.85fr] lg:px-8 lg:pt-20 lg:pb-24"
>
	<div class="max-w-2xl text-center lg:text-left">
		<div
			class="mx-auto mb-5 grid size-24 place-items-center overflow-hidden rounded-full border bg-card shadow-sm lg:mx-0"
		>
			{#if data.settings.profile_image_url}<img
					src={data.settings.profile_image_url}
					alt={`Foto profil ${data.settings.site_name}`}
					width="96"
					height="96"
					class="size-full object-cover"
					referrerpolicy="no-referrer"
				/>{:else}<LogoMark />{/if}
		</div>
		<p class="mb-3 text-sm font-bold tracking-[.18em] text-primary uppercase">
			{data.settings.site_name}
		</p>
		<h1 class="font-heading text-5xl leading-[1.03] font-semibold text-balance sm:text-6xl">
			{data.settings.headline}
		</h1>
		<p class="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
			Kirim dukungan tanpa membuat akun. Pilih nominal, tulis pesan, lalu selesaikan pembayaran
			dengan aman.
		</p>
		{#if data.socialLinks.length}<div
				class="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start"
			>
				{#each data.socialLinks as link (link.url)}<a
						href={link.url}
						target="_blank"
						rel="noreferrer"
						class="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-semibold transition hover:border-primary/50 hover:text-primary"
						>{link.label}<ExternalLink class="size-3.5" aria-hidden="true" /></a
					>{/each}
			</div>{/if}
		<div class="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
			<Button href="/sawer" size="lg" class="h-12 rounded-full px-7"
				>Kirim sawer <ArrowRight class="size-4" /></Button
			>
			<span class="text-sm text-muted-foreground"
				>Mulai dari {rupiah(data.settings.minimum_amount)}</span
			>
		</div>
	</div>

	<div class="relative mx-auto w-full max-w-md">
		<div
			class="receipt rounded-[2rem] border bg-card p-6 shadow-[0_24px_80px_-48px_rgba(15,81,63,.55)] sm:p-8"
		>
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="text-sm text-muted-foreground">Dukungan terkumpul</p>
					<p class="mt-1 text-3xl font-bold">{rupiah(data.summary.total)}</p>
				</div>
				<span class="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground"
					>{data.summary.supporters} sawer</span
				>
			</div>
			<div class="my-6 border-t border-dashed"></div>
			<p class="font-heading text-2xl">“Yang kecil tetap berarti ketika datang bersama.”</p>
			<div class="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
				<span class="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground"
					>♥</span
				> Pembayaran aman dan terverifikasi
			</div>
		</div>
	</div>
</section>

<section class="border-y bg-secondary/55">
	<div class="mx-auto max-w-6xl px-5 py-16 lg:px-8">
		<div class="mb-8 flex items-end justify-between gap-4">
			<div>
				<p class="text-sm font-bold text-primary">PILIH TUJUAN</p>
				<h2 class="mt-2 font-heading text-3xl font-semibold">Campaign aktif</h2>
			</div>
			<Target class="size-8 text-primary" aria-hidden="true" />
		</div>
		<div class="grid gap-4 md:grid-cols-2">
			{#each data.campaigns as campaign (campaign.id)}
				<a
					href={resolve('/sawer') + '?campaign=' + encodeURIComponent(campaign.slug)}
					class="rounded-2xl border bg-background p-6 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
				>
					<div class="flex items-start justify-between gap-4">
						<div>
							<h3 class="text-lg font-bold">{campaign.name}</h3>
							<p class="mt-2 text-sm leading-6 text-muted-foreground">{campaign.description}</p>
						</div>
						<ArrowRight class="mt-1 size-5 text-primary" />
					</div>
					{#if campaign.target_amount}
						<div class="mt-6">
							<Progress value={Math.min(100, (campaign.total / campaign.target_amount) * 100)} />
							<div class="mt-2 flex justify-between text-xs text-muted-foreground">
								<span>{rupiah(campaign.total)}</span><span
									>Target {rupiah(campaign.target_amount)}</span
								>
							</div>
						</div>
					{:else}<p class="mt-6 text-sm font-semibold text-primary">
							{rupiah(campaign.total)} terkumpul · tanpa target
						</p>{/if}
				</a>
			{/each}
		</div>
	</div>
</section>

{#if data.settings.ranking_enabled}
	<section class="mx-auto max-w-3xl px-5 py-16 lg:px-8">
		<div class="mb-7 text-center">
			<Trophy class="mx-auto size-7 text-primary" />
			<h2 class="mt-3 font-heading text-3xl font-semibold">Jejak kebaikan</h2>
			<p class="mt-2 text-muted-foreground">Peringkat dukungan yang sudah berhasil.</p>
		</div>
		<div class="overflow-hidden rounded-2xl border bg-card">
			{#if data.ranking.length}
				{#each data.ranking as item, index (`${item.username}-${index}`)}
					<div class="flex items-center gap-4 border-b px-5 py-4 last:border-0">
						<span class="grid size-8 place-items-center rounded-full bg-secondary text-sm font-bold"
							>{index + 1}</span
						><span class="min-w-0 flex-1 truncate font-semibold">{item.username}</span
						>{#if item.show_amount}<span class="font-bold">{rupiah(item.total)}</span>{:else}<span
								class="flex items-center gap-1.5 text-sm text-muted-foreground"
								><EyeOff class="size-4" /> Disembunyikan</span
							>{/if}
					</div>
				{/each}
			{:else}<p class="p-8 text-center text-muted-foreground">
					Belum ada dukungan. Jadilah yang pertama.
				</p>{/if}
		</div>
	</section>
{/if}
