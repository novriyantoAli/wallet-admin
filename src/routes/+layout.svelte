<script>
	import favicon from '$lib/assets/favicon.svg';
    import { onMount } from 'svelte';
	import '../app.css';
    import { authDetail } from '$lib/api/AuthApi';

	let { children } = $props();

	onMount( async () => {
		const token = localStorage.getItem('token');
		const userSession = localStorage.getItem('user');
		if (!token || !userSession) {
			return;
		}

		try {
			const response = await authDetail({ token });
			const responseBody = await response.json();
			if (response.status !== 200) {
				localStorage.removeItem('token');
				localStorage.removeItem('user');
			}
		} catch (error) {
			localStorage.removeItem('token');
			localStorage.removeItem('user');
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
