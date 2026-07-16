<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Ketentuan Layanan — OpenSawer</title>
	<meta
		name="description"
		content="Ketentuan penggunaan OpenSawer untuk kreator dan pemberi dukungan."
	/>
</svelte:head>

<article class="mx-auto max-w-3xl px-5 py-14 lg:px-8 lg:py-20">
	<a href={resolve('/')} class="text-sm font-bold text-primary hover:underline">← Kembali</a>
	<p class="mt-10 text-sm font-bold tracking-[.16em] text-primary uppercase">Dokumen publik</p>
	<h1 class="mt-3 font-heading text-4xl font-semibold sm:text-5xl">Ketentuan layanan.</h1>
	<p class="mt-5 text-sm text-muted-foreground">Terakhir diperbarui 16 Juli 2026</p>

	<div class="mt-12 space-y-10 leading-7 text-muted-foreground">
		<section>
			<h2 class="font-heading text-2xl font-semibold text-foreground">1. Tentang layanan</h2>
			<p class="mt-3">
				OpenSawer membantu pengelola halaman menerima dukungan tanpa mewajibkan pemberi dukungan
				membuat akun. Setiap instalasi dikelola secara mandiri oleh pengelolanya.
			</p>
		</section>
		<section>
			<h2 class="font-heading text-2xl font-semibold text-foreground">2. Pembayaran</h2>
			<p class="mt-3">
				Pembayaran diproses oleh penyedia pembayaran yang dikonfigurasi pengelola. Dukungan dianggap
				berhasil setelah status pembayaran terverifikasi oleh sistem.
			</p>
		</section>
		<section>
			<h2 class="font-heading text-2xl font-semibold text-foreground">3. Informasi publik</h2>
			<p class="mt-3">
				Nama, pesan, nominal, dan posisi ranking dapat ditampilkan sesuai pilihan pemberi dukungan
				serta pengaturan halaman. Jangan mengirim pesan yang melanggar hukum, menipu, mengancam,
				atau melanggar hak orang lain.
			</p>
		</section>
		<section>
			<h2 class="font-heading text-2xl font-semibold text-foreground">4. Pengembalian dana</h2>
			<p class="mt-3">
				Permintaan pengembalian dana ditangani oleh pengelola halaman dan dapat bergantung pada
				kebijakan penyedia pembayaran. OpenSawer tidak menjanjikan bahwa setiap transaksi dapat
				dikembalikan.
			</p>
		</section>
		<section>
			<h2 class="font-heading text-2xl font-semibold text-foreground">5. Ketersediaan</h2>
			<p class="mt-3">
				Layanan dapat dihentikan sementara untuk pemeliharaan, keamanan, atau gangguan pihak ketiga.
				Pengelola bertanggung jawab atas konfigurasi, keamanan, pencadangan, dan kepatuhan
				instalasinya.
			</p>
		</section>
		<section>
			<h2 class="font-heading text-2xl font-semibold text-foreground">6. Perubahan</h2>
			<p class="mt-3">
				Ketentuan dapat diperbarui ketika layanan berubah. Versi terbaru ditampilkan di halaman ini.
			</p>
		</section>
	</div>
</article>
