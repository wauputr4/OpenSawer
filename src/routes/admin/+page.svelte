<script lang="ts">
	import {
		CircleDollarSign,
		Clock3,
		ExternalLink,
		History,
		LayoutDashboard,
		Megaphone,
		Pencil,
		Plus,
		Settings2,
		Trash2,
		UsersRound,
		X
	} from '@lucide/svelte';
	import { rupiah, dateTime } from '$lib/format';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';

	let { data, form } = $props();
	type View = 'overview' | 'history' | 'campaigns' | 'settings';
	const initialView = () => (form?.view as View) || 'overview';
	let view = $state<View>(initialView());
	const navItems = [
		{ id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
		{ id: 'history' as const, label: 'History', icon: History },
		{ id: 'campaigns' as const, label: 'Campaign', icon: Megaphone },
		{ id: 'settings' as const, label: 'Setting', icon: Settings2 }
	];

	let campaignDialog: HTMLDialogElement;
	let campaignMode = $state<'create' | 'edit'>('create');
	let campaignForm = $state({
		id: 0,
		name: '',
		slug: '',
		kind: 'creator',
		description: '',
		target_amount: '' as string | number
	});
	const initialSocialLinks = () =>
		JSON.parse(data.settings.social_links) as Array<{ label: string; url: string }>;
	let socialLinks = $state(initialSocialLinks());
	const serializedSocialLinks = $derived(
		socialLinks.map((link) => `${link.label} | ${link.url}`).join('\n')
	);

	function openCreateCampaign() {
		campaignMode = 'create';
		campaignForm = {
			id: 0,
			name: '',
			slug: '',
			kind: 'creator',
			description: '',
			target_amount: ''
		};
		campaignDialog.showModal();
	}

	function openEditCampaign(campaign: (typeof data.campaigns)[number]) {
		campaignMode = 'edit';
		campaignForm = {
			id: campaign.id,
			name: campaign.name,
			slug: campaign.slug,
			kind: campaign.kind,
			description: campaign.description,
			target_amount: campaign.target_amount ?? ''
		};
		campaignDialog.showModal();
	}
</script>

<svelte:head><title>Dashboard — OpenSawer</title></svelte:head>

<section class="mx-auto max-w-6xl px-5 pt-6 pb-28 lg:px-8">
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

	<nav class="mt-8 hidden gap-1 rounded-2xl border bg-card p-1.5 sm:flex" aria-label="Menu admin">
		{#each navItems as item (item.id)}
			<button
				type="button"
				onclick={() => (view = item.id)}
				aria-current={view === item.id ? 'page' : undefined}
				class="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
			>
				<item.icon class="size-4" />
				{item.label}
			</button>
		{/each}
	</nav>

	{#if form?.error}<p
			role="alert"
			class="mt-6 rounded-xl bg-destructive/8 p-3 text-sm text-destructive"
		>
			{form.error}
		</p>{/if}
	{#if form?.success}<p role="status" class="mt-6 rounded-xl bg-primary/8 p-3 text-sm text-primary">
			{form.success}
		</p>{/if}

	{#if view === 'overview'}
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
	{:else if view === 'history'}
		<section class="mt-8">
			<h2 class="font-heading text-3xl font-semibold">Riwayat donasi</h2>
			<div class="mt-4 overflow-x-auto rounded-2xl border bg-card">
				<table class="w-full text-left text-sm">
					<thead class="border-b bg-secondary/60 text-xs">
						<tr
							><th class="px-4 py-3">Donatur</th><th class="px-4 py-3">Nominal</th><th
								class="px-4 py-3">Status</th
							><th class="px-4 py-3">Ranking</th></tr
						>
					</thead>
					<tbody>
						{#each data.donations as donation (donation.public_id)}
							<tr class="border-b last:border-0">
								<td class="px-4 py-3"
									><strong>{donation.username || 'Anonim'}</strong><span
										class="block max-w-44 truncate text-xs text-muted-foreground"
										>{donation.email || donation.campaign_name} · {dateTime(
											donation.created_at
										)}</span
									></td
								>
								<td class="px-4 py-3 font-semibold tabular-nums">{rupiah(donation.amount)}</td>
								<td class="px-4 py-3"
									><span class="rounded-full bg-secondary px-2 py-1 text-xs font-bold"
										>{donation.status}</span
									></td
								>
								<td class="px-4 py-3"
									><form method="POST" action="?/toggleRanking">
										<input type="hidden" name="id" value={donation.public_id} /><button
											class="text-xs font-bold text-primary hover:underline"
											>{donation.show_in_ranking ? 'Tampil' : 'Disembunyikan'}</button
										>
									</form></td
								>
							</tr>
						{/each}
						{#if !data.donations.length}<tr
								><td colspan="4" class="p-7 text-center text-muted-foreground">Belum ada donasi.</td
								></tr
							>{/if}
					</tbody>
				</table>
			</div>
		</section>
	{:else if view === 'campaigns'}
		<section class="mt-8">
			<div class="flex items-center justify-between gap-4">
				<div>
					<h2 class="font-heading text-3xl font-semibold">Campaign</h2>
					<p class="mt-1 text-sm text-muted-foreground">Atur tujuan dan target dukungan.</p>
				</div>
				<Button type="button" onclick={openCreateCampaign}
					><Plus class="size-4" /> Campaign baru</Button
				>
			</div>
			<div class="mt-5 space-y-3">
				{#each data.campaigns as campaign (campaign.id)}
					<div class="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-5">
						<div class="min-w-0 flex-1">
							<p class="truncate font-bold">{campaign.name}</p>
							<p class="text-xs text-muted-foreground">
								{rupiah(campaign.total)} · {campaign.is_active
									? 'aktif'
									: 'arsip'}{campaign.target_amount
									? ` · target ${rupiah(campaign.target_amount)}`
									: ''}
							</p>
						</div>
						<Button
							type="button"
							size="sm"
							variant="outline"
							onclick={() => openEditCampaign(campaign)}><Pencil class="size-3.5" /> Edit</Button
						>
						{#if !campaign.is_default}<form method="POST" action="?/toggleCampaign">
								<input type="hidden" name="id" value={campaign.id} /><Button
									type="submit"
									size="sm"
									variant="ghost">{campaign.is_active ? 'Arsipkan' : 'Aktifkan'}</Button
								>
							</form>{/if}
					</div>
				{/each}
			</div>
		</section>
	{:else}
		<section class="mt-8 rounded-2xl border bg-card p-5 sm:p-7">
			<h2 class="flex items-center gap-2 font-heading text-3xl font-semibold">
				<Settings2 class="size-5" /> Pengaturan
			</h2>
			<form method="POST" action="?/settings" class="mt-6 grid gap-5 sm:grid-cols-2">
				<div>
					<label for="site_name" class="mb-1 block text-xs font-bold">Nama aplikasi</label><Input
						id="site_name"
						name="site_name"
						value={data.settings.site_name}
						required
					/>
				</div>
				<div>
					<label for="creator_name" class="mb-1 block text-xs font-bold">Nama creator</label><Input
						id="creator_name"
						name="creator_name"
						value={data.settings.creator_name}
						required
					/>
				</div>
				<div class="sm:col-span-2">
					<label for="headline" class="mb-1 block text-xs font-bold">Headline</label><Input
						id="headline"
						name="headline"
						value={data.settings.headline}
						required
					/>
				</div>
				<div class="sm:col-span-2">
					<label for="intro_text" class="mb-1 block text-xs font-bold">Deskripsi profil</label
					><Textarea
						id="intro_text"
						name="intro_text"
						rows={3}
						value={data.settings.intro_text}
						maxlength={280}
						required
					/>
				</div>
				<div class="sm:col-span-2">
					<label for="profile_image_url" class="mb-1 block text-xs font-bold"
						>URL logo atau foto profil (opsional)</label
					><Input
						id="profile_image_url"
						name="profile_image_url"
						type="url"
						placeholder="https://example.com/foto.jpg"
						value={data.settings.profile_image_url}
					/>
				</div>
				<div class="sm:col-span-2">
					<label for="favicon_url" class="mb-1 block text-xs font-bold"
						>URL favicon / ikon browser (opsional)</label
					><Input
						id="favicon_url"
						name="favicon_url"
						type="url"
						placeholder="https://example.com/favicon.png"
						value={data.settings.favicon_url}
					/>
				</div>

				<fieldset class="space-y-3 sm:col-span-2">
					<legend class="text-xs font-bold">Tombol sosial</legend>
					<input type="hidden" name="social_links" value={serializedSocialLinks} />
					<datalist id="social-platforms"
						><option value="Instagram"></option><option value="TikTok"></option><option
							value="YouTube"
						></option><option value="X"></option><option value="Facebook"></option><option
							value="Website"
						></option></datalist
					>
					{#each socialLinks as link, index (index)}
						<div class="grid gap-2 sm:grid-cols-[10rem_1fr_auto]">
							<Input
								bind:value={link.label}
								list="social-platforms"
								aria-label={`Label tautan ${index + 1}`}
								placeholder="Instagram"
								maxlength={30}
								required
							/>
							<Input
								bind:value={link.url}
								type="url"
								aria-label={`URL tautan ${index + 1}`}
								placeholder="https://instagram.com/username"
								required
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onclick={() => socialLinks.splice(index, 1)}
								aria-label={`Hapus ${link.label || 'tautan'}`}><Trash2 class="size-4" /></Button
							>
						</div>
					{/each}
					{#if socialLinks.length < 6}<Button
							type="button"
							variant="outline"
							size="sm"
							onclick={() => socialLinks.push({ label: '', url: '' })}
							><Plus class="size-4" /> Tambah tombol</Button
						>{/if}
				</fieldset>

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
				>
				<label class="flex items-center gap-2 text-sm"
					><input
						type="checkbox"
						name="default_show_amount"
						checked={data.settings.default_show_amount === 1}
						class="rounded text-primary"
					/> Nominal terbuka secara default</label
				>
				<label class="flex items-center gap-2 text-sm"
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
	{/if}
</section>

<nav
	class="fixed right-3 bottom-3 left-3 z-40 grid grid-cols-4 rounded-2xl border bg-card/95 p-1.5 shadow-xl backdrop-blur sm:hidden"
	aria-label="Menu admin mobile"
>
	{#each navItems as item (item.id)}
		<button
			type="button"
			onclick={() => (view = item.id)}
			aria-current={view === item.id ? 'page' : undefined}
			class="flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[.65rem] font-semibold transition aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
			><item.icon class="size-4" /> {item.label}</button
		>
	{/each}
</nav>

<dialog
	bind:this={campaignDialog}
	class="w-[calc(100%-2rem)] max-w-lg rounded-3xl bg-card p-0 text-foreground shadow-2xl backdrop:bg-foreground/45"
>
	<div class="flex items-center justify-between border-b px-5 py-4">
		<h2 class="font-heading text-2xl font-semibold">
			{campaignMode === 'create' ? 'Campaign baru' : 'Edit campaign'}
		</h2>
		<Button
			type="button"
			variant="ghost"
			size="icon"
			onclick={() => campaignDialog.close()}
			aria-label="Tutup modal"><X class="size-5" /></Button
		>
	</div>
	<form
		method="POST"
		action={campaignMode === 'create' ? '?/campaign' : '?/updateCampaign'}
		class="space-y-4 p-5"
	>
		<input type="hidden" name="id" value={campaignForm.id} />
		<div>
			<label for="campaign_name" class="mb-1 block text-xs font-bold">Nama campaign</label><Input
				id="campaign_name"
				name="name"
				bind:value={campaignForm.name}
				required
			/>
		</div>
		<div>
			<label for="campaign_slug" class="mb-1 block text-xs font-bold">Slug</label><Input
				id="campaign_slug"
				name="slug"
				bind:value={campaignForm.slug}
				spellcheck="false"
				placeholder="dibuat otomatis dari nama"
			/>
		</div>
		<div>
			<label for="campaign_kind" class="mb-1 block text-xs font-bold">Jenis</label><select
				id="campaign_kind"
				name="kind"
				bind:value={campaignForm.kind}
				class="h-10 w-full rounded-lg border bg-background px-3 text-sm"
				><option value="general">Umum</option><option value="creator">Kreator</option><option
					value="social">Sosial</option
				><option value="event">Acara</option><option value="other">Lainnya</option></select
			>
		</div>
		<div>
			<label for="campaign_description" class="mb-1 block text-xs font-bold"
				>Deskripsi singkat</label
			><Textarea
				id="campaign_description"
				name="description"
				bind:value={campaignForm.description}
				rows={3}
				maxlength={280}
			/>
		</div>
		<div>
			<label for="campaign_target" class="mb-1 block text-xs font-bold"
				>Target opsional (rupiah)</label
			><Input
				id="campaign_target"
				name="target_amount"
				bind:value={campaignForm.target_amount}
				type="number"
				min="1"
			/>
		</div>
		<div class="flex justify-end gap-2 pt-2">
			<Button type="button" variant="ghost" onclick={() => campaignDialog.close()}>Batal</Button
			><Button type="submit"
				>{campaignMode === 'create' ? 'Buat campaign' : 'Simpan perubahan'}</Button
			>
		</div>
	</form>
</dialog>
