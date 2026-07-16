<script lang="ts">
	import { ChevronDown, Eye, EyeOff, LockKeyhole, Mail, UserRound } from '@lucide/svelte';
	import { rupiah } from '$lib/format';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	let { data, form } = $props();
	const initialAmount = () => String(JSON.parse(data.settings.preset_amounts)[1]);
	const initialUsername = () => form?.username || '';
	const initialEmail = () => form?.email || '';
	const initialCampaign = () =>
		data.campaigns.find((item: { slug: string }) => item.slug === data.selected)?.id ||
		data.campaigns[0]?.id;
	let anonymous = $state(false);
	let amount = $state(initialAmount());
	let customAmount = $state(false);
	let username = $state(initialUsername());
	let email = $state(initialEmail());
	let selected = $state(initialCampaign());
	const VisibilityIcon = $derived(anonymous ? EyeOff : Eye);
</script>

<svelte:head><title>Kirim sawer — {data.settings.site_name}</title></svelte:head>

<section class="mx-auto max-w-2xl px-5 pt-8 pb-16 lg:px-8">
	<div class="mb-8 text-center">
		<p class="text-sm font-bold tracking-[.16em] text-primary uppercase">Kirim dukungan</p>
		<h1 class="mt-3 font-heading text-4xl font-semibold">Satu formulir, selesai.</h1>
		<p class="mt-3 text-muted-foreground">
			Identitas dan nominal terbuka secara default, tapi pilihan tetap di tanganmu.
		</p>
	</div>

	{#if form?.error}<div
			role="alert"
			class="mb-5 rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive"
		>
			{form.error}
		</div>{/if}
	{#if form?.previewCode}<div
			role="status"
			class="mb-5 rounded-xl border border-primary/20 bg-primary/8 px-4 py-3 text-sm"
		>
			Mode lokal: kode verifikasimu <strong class="font-mono text-lg">{form.previewCode}</strong>
		</div>{/if}

	<form
		method="POST"
		action="?/donate"
		class="space-y-7 rounded-[1.75rem] border bg-card p-5 shadow-[0_24px_70px_-52px_rgba(15,81,63,.6)] sm:p-8"
	>
		<div>
			<label for="campaign" class="mb-2 block text-sm font-bold">Campaign</label><select
				id="campaign"
				name="campaign_id"
				bind:value={selected}
				class="h-11 w-full rounded-xl border bg-background px-3 text-sm focus:border-primary focus:ring-primary"
				>{#each data.campaigns as campaign (campaign.id)}<option value={campaign.id}
						>{campaign.name}</option
					>{/each}</select
			>
		</div>
		<fieldset>
			<legend class="mb-3 text-sm font-bold">Nominal sawer</legend>
			<input type="hidden" name="amount" value={amount} />
			<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
				{#each JSON.parse(data.settings.preset_amounts) as preset (preset)}<button
						type="button"
						onclick={() => {
							amount = String(preset);
							customAmount = false;
						}}
						class:active-amount={!customAmount && amount === String(preset)}
						class="rounded-xl border px-3 py-3 text-sm font-bold transition hover:border-primary"
						>{rupiah(preset)}</button
					>{/each}
				<button
					type="button"
					onclick={() => {
						amount = '';
						customAmount = true;
					}}
					class:active-amount={customAmount}
					class="rounded-xl border px-3 py-3 text-sm font-bold transition hover:border-primary"
					>Nominal lain</button
				>
			</div>
			{#if customAmount}<div class="mt-3">
					<label for="custom_amount" class="mb-1.5 block text-xs font-bold">Masukkan nominal</label>
					<Input
						id="custom_amount"
						class="h-12 text-lg font-bold"
						type="number"
						bind:value={amount}
						min={data.settings.minimum_amount}
						max="100000000"
						placeholder={String(data.settings.minimum_amount)}
						required
					/>
				</div>{/if}
		</fieldset>
		<div>
			<label for="message" class="mb-2 block text-sm font-bold"
				>Pesan <span class="font-normal text-muted-foreground">(opsional)</span></label
			><Textarea
				id="message"
				name="message"
				maxlength={280}
				rows={3}
				placeholder="Tulis sesuatu yang menguatkan…"
			/>
		</div>

		<div class="rounded-2xl bg-secondary/70 p-4 sm:p-5">
			<label class="flex cursor-pointer items-start gap-3"
				><input
					type="checkbox"
					name="anonymous"
					bind:checked={anonymous}
					class="mt-1 rounded border-input text-primary focus:ring-primary"
				/><span
					><strong class="flex items-center gap-2"
						><UserRound class="size-4" /> Sawer sebagai anonim</strong
					><span class="mt-1 block text-sm text-muted-foreground"
						>Tidak perlu email atau verifikasi.</span
					></span
				></label
			>
			{#if !anonymous}
				<div class="mt-5 grid gap-3 sm:grid-cols-2">
					<div>
						<label for="username" class="mb-1.5 block text-xs font-bold">Username unik</label><Input
							id="username"
							name="username"
							bind:value={username}
							spellcheck="false"
							minlength={3}
							maxlength={30}
							autocomplete="username"
							required
						/>
					</div>
					<div>
						<label for="email" class="mb-1.5 block text-xs font-bold">Email privat</label><Input
							id="email"
							name="email"
							type="email"
							bind:value={email}
							spellcheck="false"
							autocomplete="email"
							required
						/>
					</div>
				</div>
				<div class="mt-3 flex gap-2">
					<Input
						name="code"
						inputmode="numeric"
						pattern={'[0-9]{6}'}
						spellcheck="false"
						maxlength={6}
						placeholder="Kode 6 digit"
						aria-label="Kode verifikasi"
						required
					/><Button
						type="submit"
						formnovalidate
						formaction="?/requestCode"
						variant="outline"
						class="shrink-0"><Mail class="size-4" /> Kirim kode</Button
					>
				</div>
			{/if}
		</div>

		<details class="group rounded-2xl border">
			<summary
				class="flex cursor-pointer list-none items-center justify-between gap-4 p-4 font-bold"
			>
				<span>Privasi tampilan</span>
				<ChevronDown class="size-4 transition group-open:rotate-180" aria-hidden="true" />
			</summary>
			<fieldset class="border-t p-4">
				<legend class="sr-only">Tampil di halaman publik</legend>
				<div class="grid gap-3 sm:grid-cols-2">
					<label class="flex cursor-pointer items-center gap-3 rounded-xl border p-3"
						><input
							type="checkbox"
							name="show_supporter"
							checked={data.settings.default_show_supporter === 1}
							disabled={anonymous}
							class="rounded border-input text-primary focus:ring-primary"
						/><span class="text-sm"
							><strong class="flex items-center gap-1.5"
								><VisibilityIcon class="size-4" /> Nama</strong
							></span
						></label
					><label class="flex cursor-pointer items-center gap-3 rounded-xl border p-3"
						><input
							type="checkbox"
							name="show_amount"
							checked={data.settings.default_show_amount === 1}
							class="rounded border-input text-primary focus:ring-primary"
						/><span class="text-sm font-bold">Tampilkan nominal</span></label
					>
				</div>
			</fieldset>
		</details>

		<div class="flex items-center justify-between border-t pt-5">
			<div>
				<p class="text-xs text-muted-foreground">Total pembayaran</p>
				<p class="text-xl font-bold">{rupiah(Number(amount) || 0)}</p>
			</div>
			<Button type="submit" formaction="?/donate" size="lg" class="rounded-full px-6"
				><LockKeyhole class="size-4" /> Lanjut bayar</Button
			>
		</div>
	</form>
</section>
