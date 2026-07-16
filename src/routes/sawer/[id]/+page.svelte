<script lang="ts">
	import { onMount } from 'svelte';
	import { CheckCircle2, Clock3, RefreshCw, XCircle } from '@lucide/svelte';
	import { rupiah, dateTime } from '$lib/format';
	import { Button } from '$lib/components/ui/button';
	let { data } = $props();
	let ready = $state(false);

	onMount(() => {
		if (
			!data.clientKey ||
			!data.donation.snap_token ||
			data.mock ||
			data.donation.status !== 'pending'
		)
			return;
		const script = document.createElement('script');
		script.src = data.snapUrl;
		script.dataset.clientKey = data.clientKey;
		script.onload = () => (ready = true);
		document.head.appendChild(script);
		return () => script.remove();
	});

	function pay() {
		(window as unknown as { snap: { pay: (token: string, options: object) => void } }).snap.pay(
			data.donation.snap_token!,
			{
				onSuccess: () => location.reload(),
				onPending: () => location.reload(),
				onError: () => location.reload(),
				onClose: () => {}
			}
		);
	}
</script>

<svelte:head><title>Status dukungan — OpenSawer</title></svelte:head>
<section class="mx-auto max-w-lg px-5 py-12 text-center lg:px-8">
	<div class="rounded-[1.75rem] border bg-card p-7 sm:p-10">
		{#if data.donation.status === 'paid'}<CheckCircle2 class="mx-auto size-14 text-primary" />
			<p class="mt-5 text-sm font-bold text-primary">PEMBAYARAN BERHASIL</p>
			<h1 class="mt-2 font-heading text-4xl font-semibold">Terima kasih.</h1>
			<p class="mt-3 text-muted-foreground">
				Dukunganmu sudah tercatat dan kini menjadi bagian dari langkah berikutnya.
			</p>
		{:else if data.donation.status === 'pending'}<Clock3 class="mx-auto size-14 text-amber-600" />
			<p class="mt-5 text-sm font-bold text-amber-700">MENUNGGU PEMBAYARAN</p>
			<h1 class="mt-2 font-heading text-4xl font-semibold">Sedikit lagi.</h1>
			<p class="mt-3 text-muted-foreground">
				Selesaikan pembayaran, lalu halaman ini akan membaca status terverifikasi dari Midtrans.
			</p>
		{:else}<XCircle class="mx-auto size-14 text-destructive" />
			<p class="mt-5 text-sm font-bold text-destructive">
				PEMBAYARAN {data.donation.status.toUpperCase()}
			</p>
			<h1 class="mt-2 font-heading text-4xl font-semibold">Belum berhasil.</h1>
			<p class="mt-3 text-muted-foreground">Kamu dapat kembali dan membuat dukungan baru.</p>{/if}
		<div class="my-7 border-t border-dashed"></div>
		<dl class="space-y-3 text-sm">
			<div class="flex justify-between gap-4">
				<dt class="text-muted-foreground">Campaign</dt>
				<dd class="font-semibold">{data.donation.campaign_name}</dd>
			</div>
			<div class="flex justify-between gap-4">
				<dt class="text-muted-foreground">Nominal</dt>
				<dd class="font-semibold">{rupiah(data.donation.amount)}</dd>
			</div>
			<div class="flex justify-between gap-4">
				<dt class="text-muted-foreground">Dibuat</dt>
				<dd>{dateTime(data.donation.created_at)}</dd>
			</div>
		</dl>
		<div class="mt-8 grid gap-3">
			{#if data.donation.status === 'pending' && data.mock}<form method="POST" action="?/mockPaid">
					<Button type="submit" class="w-full rounded-full" size="lg"
						>Simulasikan pembayaran berhasil</Button
					>
				</form>
			{:else if data.donation.status === 'pending' && ready}<Button
					type="button"
					onclick={pay}
					class="w-full rounded-full"
					size="lg">Buka pembayaran Midtrans</Button
				>{/if}
			{#if data.donation.status === 'pending'}<Button
					href={`/sawer/${data.donation.public_id}`}
					variant="outline"
					class="w-full rounded-full"><RefreshCw class="size-4" /> Periksa status</Button
				>{/if}
			<Button href="/" variant="ghost" class="w-full">Kembali ke beranda</Button>
		</div>
	</div>
</section>
