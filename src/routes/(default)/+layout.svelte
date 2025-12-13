<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    /** @type {import('./$types').LayoutProps} */
    let { children } = $props();

    onMount( async () => {
        const token = localStorage.getItem('token');
        const userSession = localStorage.getItem('user');
        if (token && userSession) {
            await goto('/dashboard');
        }
    });
</script>
<div class="bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen flex items-center justify-center p-4">
    {@render children()}
</div>