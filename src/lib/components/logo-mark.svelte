<script lang="ts">
	let { class: className = 'size-9' }: { class?: string } = $props();
</script>

<span
	class={`${className} block bg-white bg-no-repeat`}
	style="background-image: url('/opensawer-logo.png'); background-position: center 36%; background-size: 285%;"
	aria-hidden="true"
></span>
