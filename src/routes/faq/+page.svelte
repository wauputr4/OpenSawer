<script lang="ts">
	import { resolve } from '$app/paths';

	const questions = [
		{
			question: 'Apakah saya harus membuat akun untuk memberi dukungan?',
			answer: 'Tidak. Pilih campaign dan nominal, lalu selesaikan pembayaran tanpa akun.'
		},
		{
			question: 'Bisakah saya memberi dukungan secara anonim?',
			answer:
				'Bisa. Pilih opsi anonim agar nama dan email tidak diperlukan. Nominal serta nama juga dapat disembunyikan dari halaman publik.'
		},
		{
			question: 'Mengapa email diperlukan saat memakai username?',
			answer:
				'Email dipakai untuk memverifikasi kepemilikan username unik. Email tidak ditampilkan di halaman publik.'
		},
		{
			question: 'Kapan dukungan masuk ke total dan ranking?',
			answer:
				'Dukungan dihitung setelah pembayaran terverifikasi berhasil. Ranking juga mengikuti pilihan privasi dan pengaturan kreator.'
		},
		{
			question: 'Bagaimana jika pembayaran tertunda atau gagal?',
			answer:
				'Buka kembali halaman status pembayaran. Jika status tidak berubah setelah pembayaran selesai, hubungi pengelola halaman ini dengan menyertakan ID transaksi.'
		},
		{
			question: 'Bagaimana meminta pengembalian dana?',
			answer:
				'Hubungi pengelola halaman ini. Keputusan dan proses pengembalian dana mengikuti kebijakan pengelola serta penyedia pembayaran.'
		}
	];
</script>

<svelte:head>
	<title>FAQ — OpenSawer</title>
	<meta
		name="description"
		content="Jawaban singkat tentang dukungan, privasi, dan pembayaran di OpenSawer."
	/>
</svelte:head>

<article class="mx-auto max-w-3xl px-5 py-14 lg:px-8 lg:py-20">
	<a href={resolve('/')} class="text-sm font-bold text-primary hover:underline">← Kembali</a>
	<p class="mt-10 text-sm font-bold tracking-[.16em] text-primary uppercase">Pusat bantuan</p>
	<h1 class="mt-3 font-heading text-4xl font-semibold sm:text-5xl">
		Pertanyaan yang sering muncul.
	</h1>
	<p class="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
		Hal penting sebelum mengirim dukungan melalui OpenSawer.
	</p>
	<div class="mt-12 divide-y border-y">
		{#each questions as item (item.question)}
			<details class="group py-5">
				<summary class="flex cursor-pointer list-none items-center justify-between gap-6 font-bold">
					{item.question}<span class="text-xl text-primary group-open:rotate-45" aria-hidden="true"
						>+</span
					>
				</summary>
				<p class="max-w-2xl pt-3 leading-7 text-muted-foreground">{item.answer}</p>
			</details>
		{/each}
	</div>
</article>
