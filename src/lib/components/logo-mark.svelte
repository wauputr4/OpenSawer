<script lang="ts">
	let { class: className = 'size-9' }: { class?: string } = $props();
</script>

<svg class={className} viewBox="0 0 40 40" aria-hidden="true">
	<circle cx="20" cy="20" r="20" fill="var(--primary)" />
	<circle cx="20" cy="11.5" r="3.2" fill="var(--accent)" />
	<path
		d="M10.5 19.5c1.4 7.2 5 10.8 9.5 10.8s8.1-3.6 9.5-10.8"
		fill="none"
		stroke="var(--primary-foreground)"
		stroke-width="3.2"
		stroke-linecap="round"
	/>
	<path
		d="M12 19.5h16"
		stroke="var(--primary-foreground)"
		stroke-width="3.2"
		stroke-linecap="round"
	/>
</svg>
