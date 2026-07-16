<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Kebijakan Privasi — OpenSawer</title>
	<meta
		name="description"
		content="Cara OpenSawer memproses data pemberi dukungan dan pengelola."
	/>
</svelte:head>

<article class="mx-auto max-w-3xl px-5 py-14 lg:px-8 lg:py-20">
	<a href={resolve('/')} class="text-sm font-bold text-primary hover:underline">← Kembali</a>
	<p class="mt-10 text-sm font-bold tracking-[.16em] text-primary uppercase">Dokumen publik</p>
	<h1 class="mt-3 font-heading text-4xl font-semibold sm:text-5xl">Kebijakan privasi.</h1>
	<p class="mt-5 text-sm text-muted-foreground">Terakhir diperbarui 16 Juli 2026</p>

	<div class="mt-12 space-y-10 leading-7 text-muted-foreground">
		<section>
			<h2 class="font-heading text-2xl font-semibold text-foreground">Data yang diproses</h2>
			<p class="mt-3">
				OpenSawer menyimpan data transaksi seperti campaign, nominal, pesan, status pembayaran,
				waktu, dan ID transaksi. Jika memilih identitas publik, sistem juga menyimpan username unik
				dan email yang telah diverifikasi.
			</p>
		</section>
		<section>
			<h2 class="font-heading text-2xl font-semibold text-foreground">Tujuan penggunaan</h2>
			<p class="mt-3">
				Data digunakan untuk memproses dan memverifikasi pembayaran, mencegah penyalahgunaan
				username, menampilkan dukungan sesuai pilihan privasi, serta membantu pengelola menangani
				transaksi.
			</p>
		</section>
		<section>
			<h2 class="font-heading text-2xl font-semibold text-foreground">Data yang ditampilkan</h2>
			<p class="mt-3">
				Username, pesan, dan nominal hanya ditampilkan sesuai pilihan pemberi dukungan serta
				pengaturan pengelola. Email tidak ditampilkan kepada publik. Dukungan anonim tidak
				memerlukan email atau username.
			</p>
		</section>
		<section>
			<h2 class="font-heading text-2xl font-semibold text-foreground">Pihak ketiga</h2>
			<p class="mt-3">
				Data pembayaran diteruskan kepada penyedia pembayaran yang digunakan pengelola. Jika
				dikonfigurasi, Google memverifikasi email pemberi dukungan dan Cloudflare Turnstile membantu
				melindungi login admin. Keduanya dapat memproses data teknis perangkat atau jaringan.
			</p>
		</section>
		<section>
			<h2 class="font-heading text-2xl font-semibold text-foreground">Penyimpanan dan keamanan</h2>
			<p class="mt-3">
				Data disimpan pada instalasi OpenSawer milik pengelola. Pengelola menentukan masa simpan,
				pencadangan, akses, dan penghapusan data. Kredensial pembayaran disimpan dalam bentuk
				terenkripsi.
			</p>
		</section>
		<section>
			<h2 class="font-heading text-2xl font-semibold text-foreground">Hak dan pertanyaan</h2>
			<p class="mt-3">
				Untuk meminta akses, koreksi, atau penghapusan data, hubungi pengelola halaman tempat
				dukungan dikirim. Permintaan tertentu mungkin perlu mempertahankan catatan transaksi untuk
				kewajiban hukum atau penyelesaian sengketa.
			</p>
		</section>
	</div>
</article>
