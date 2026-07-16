<script lang="ts">
	import {
		CircleDollarSign,
		Clock3,
		ExternalLink,
		Plus,
		Settings2,
		UsersRound
	} from '@lucide/svelte';
	import { rupiah, dateTime } from '$lib/format';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	let { data, form } = $props();
	const socialLinks = $derived(
		JSON.parse(data.settings.social_links) as Array<{
			label: string;
			url: string;
		}>
	);
	const socialLinksPlaceholder =
		'Instagram | https://instagram.com/username\nWebsite | https://example.com';
</script>

<svelte:head><title>Dashboard — OpenSawer</title></svelte:head>
<section class="mx-auto max-w-6xl px-5 pt-6 pb-20 lg:px-8">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-sm font-bold tracking-[.15em] text-primary uppercase">Dashboard admin</p>
			<h1 class="mt-2 font-heading text-4xl font-semibold">Ringkas, lalu bertindak.</h1>
		</div>
		<div class="flex gap-2">
			<Button href="/" variant="outline"><ExternalLink class="size-4" /> Lihat situs</Button>
			<form method="POST" action="?/logout">
				<Button type="submit" variant="ghost">Keluar</Button>
			</form>
		</div>
	</div>
	{#if form?.error}<p
			role="alert"
			class="mt-6 rounded-xl bg-destructive/8 p-3 text-sm text-destructive"
		>
			{form.error}
		</p>{/if}{#if form?.success}<p
			role="status"
			class="mt-6 rounded-xl bg-primary/8 p-3 text-sm text-primary"
		>
			{form.success}
		</p>{/if}
	<div class="mt-8 grid gap-4 sm:grid-cols-3">
		<div class="rounded-2xl border bg-card p-5">
			<CircleDollarSign class="size-5 text-primary" />
			<p class="mt-5 text-sm text-muted-foreground">Total berhasil</p>
			<p class="mt-1 text-2xl font-bold">{rupiah(data.summary.total)}</p>
		</div>
		<div class="rounded-2xl border bg-card p-5">
			<UsersRound class="size-5 text-primary" />
			<p class="mt-5 text-sm text-muted-foreground">Transaksi berhasil</p>
			<p class="mt-1 text-2xl font-bold">{data.summary.paid || 0}</p>
		</div>
		<div class="rounded-2xl border bg-card p-5">
			<Clock3 class="size-5 text-primary" />
			<p class="mt-5 text-sm text-muted-foreground">Menunggu</p>
			<p class="mt-1 text-2xl font-bold">{data.summary.pending || 0}</p>
		</div>
	</div>

	<div class="mt-10 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
		<section>
			<h2 class="font-heading text-2xl font-semibold">Donasi terbaru</h2>
			<div class="mt-4 overflow-x-auto rounded-2xl border bg-card">
				<table class="w-full text-left text-sm">
					<thead class="border-b bg-secondary/60 text-xs"
						><tr
							><th class="px-4 py-3">Donatur</th><th class="px-4 py-3">Nominal</th><th
								class="px-4 py-3">Status</th
							><th class="px-4 py-3">Ranking</th></tr
						></thead
					><tbody
						>{#each data.donations as donation (donation.public_id)}<tr
								class="border-b last:border-0"
								><td class="px-4 py-3"
									><strong>{donation.username || 'Anonim'}</strong><span
										class="block max-w-44 truncate text-xs text-muted-foreground"
										>{donation.email || donation.campaign_name} · {dateTime(
											donation.created_at
										)}</span
									></td
								><td class="px-4 py-3 font-semibold tabular-nums">{rupiah(donation.amount)}</td><td
									class="px-4 py-3"
									><span class="rounded-full bg-secondary px-2 py-1 text-xs font-bold"
										>{donation.status}</span
									></td
								><td class="px-4 py-3"
									><form method="POST" action="?/toggleRanking">
										<input type="hidden" name="id" value={donation.public_id} /><button
											class="text-xs font-bold text-primary hover:underline"
											>{donation.show_in_ranking ? 'Tampil' : 'Disembunyikan'}</button
										>
									</form></td
								></tr
							>{/each}{#if !data.donations.length}<tr
								><td colspan="4" class="p-7 text-center text-muted-foreground">Belum ada donasi.</td
								></tr
							>{/if}</tbody
					>
				</table>
			</div>
		</section>

		<div class="space-y-8">
			<section>
				<h2 class="font-heading text-2xl font-semibold">Campaign</h2>
				<div class="mt-4 space-y-3">
					{#each data.campaigns as campaign (campaign.id)}<div
							class="flex items-center gap-3 rounded-xl border bg-card p-4"
						>
							<div class="min-w-0 flex-1">
								<p class="truncate font-bold">{campaign.name}</p>
								<p class="text-xs text-muted-foreground">
									{rupiah(campaign.total)} · {campaign.is_active ? 'aktif' : 'arsip'}
								</p>
							</div>
							{#if !campaign.is_default}<form method="POST" action="?/toggleCampaign">
									<input type="hidden" name="id" value={campaign.id} /><Button
										type="submit"
										size="sm"
										variant="outline">{campaign.is_active ? 'Arsipkan' : 'Aktifkan'}</Button
									>
								</form>{/if}
						</div>{/each}
				</div>
				<form
					method="POST"
					action="?/campaign"
					class="mt-4 space-y-3 rounded-2xl border border-dashed p-4"
				>
					<h3 class="flex items-center gap-2 font-bold"><Plus class="size-4" /> Campaign baru</h3>
					<Input name="name" autocomplete="off" placeholder="Nama campaign" required /><Input
						name="slug"
						autocomplete="off"
						spellcheck="false"
						placeholder="slug-opsional"
					/><select name="kind" class="h-10 w-full rounded-lg border bg-background px-3 text-sm"
						><option value="creator">Kreator</option><option value="social">Sosial</option><option
							value="event">Acara</option
						><option value="other">Lainnya</option></select
					><Textarea name="description" placeholder="Deskripsi singkat" rows={2} /><Input
						name="target_amount"
						type="number"
						min="1"
						placeholder="Target opsional (rupiah)"
					/><Button type="submit" variant="outline" class="w-full">Buat campaign</Button>
				</form>
			</section>
		</div>
	</div>

	<section class="mt-10 rounded-2xl border bg-card p-5 sm:p-7">
		<h2 class="flex items-center gap-2 font-heading text-2xl font-semibold">
			<Settings2 class="size-5" /> Pengaturan
		</h2>
		<form method="POST" action="?/settings" class="mt-5 grid gap-4 sm:grid-cols-2">
			<div>
				<label for="site_name" class="mb-1 block text-xs font-bold">Nama situs</label><Input
					id="site_name"
					name="site_name"
					value={data.settings.site_name}
					required
				/>
			</div>
			<div>
				<label for="headline" class="mb-1 block text-xs font-bold">Headline</label><Input
					id="headline"
					name="headline"
					value={data.settings.headline}
					required
				/>
			</div>
			<div class="sm:col-span-2">
				<label for="profile_image_url" class="mb-1 block text-xs font-bold"
					>URL foto profil (opsional)</label
				><Input
					id="profile_image_url"
					name="profile_image_url"
					type="url"
					placeholder="https://example.com/foto.jpg"
					value={data.settings.profile_image_url}
				/>
			</div>
			<div class="sm:col-span-2">
				<label for="social_links" class="mb-1 block text-xs font-bold"
					>Tautan profil, satu per baris</label
				><Textarea
					id="social_links"
					name="social_links"
					rows={4}
					placeholder={socialLinksPlaceholder}
					value={socialLinks.map((link) => `${link.label} | ${link.url}`).join('\n')}
				/>
				<p class="mt-1 text-xs text-muted-foreground">Maksimal 6 tautan. Format: Label | URL</p>
			</div>
			<div>
				<label for="minimum" class="mb-1 block text-xs font-bold">Minimum</label><Input
					id="minimum"
					name="minimum_amount"
					type="number"
					value={data.settings.minimum_amount}
					required
				/>
			</div>
			<div>
				<label for="presets" class="mb-1 block text-xs font-bold">Preset, pisahkan koma</label
				><Input
					id="presets"
					name="preset_amounts"
					value={JSON.parse(data.settings.preset_amounts).join(', ')}
					required
				/>
			</div>
			<label class="flex items-center gap-2 text-sm"
				><input
					type="checkbox"
					name="default_show_supporter"
					checked={data.settings.default_show_supporter === 1}
					class="rounded text-primary"
				/> Nama terbuka secara default</label
			><label class="flex items-center gap-2 text-sm"
				><input
					type="checkbox"
					name="default_show_amount"
					checked={data.settings.default_show_amount === 1}
					class="rounded text-primary"
				/> Nominal terbuka secara default</label
			><label class="flex items-center gap-2 text-sm"
				><input
					type="checkbox"
					name="ranking_enabled"
					checked={data.settings.ranking_enabled === 1}
					class="rounded text-primary"
				/> Aktifkan ranking</label
			>
			<div class="sm:text-right"><Button type="submit">Simpan pengaturan</Button></div>
		</form>
	</section>
</section>
