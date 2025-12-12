<script>
	import { goto } from '$app/navigation';
	import { getUserById } from '$lib/api/UserApi';

	let { params } = $props();

	let user = $state(null);
	let loading = $state(true);
	let error = $state(null);

	async function loadUser() {
		try {
			loading = true;
			error = null;

			const token = localStorage.getItem('token') || '';
			const response = await getUserById(params.id, token);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			user = result.data || result;
		} catch (err) {
			error = err.message || 'Failed to load user';
			console.error('Error loading user:', err);
		} finally {
			loading = false;
		}
	}

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getLevelBadgeColor(level) {
		switch (level?.toLowerCase()) {
			case 'admin':
				return 'bg-purple-900 text-purple-200';
			case 'reseller':
				return 'bg-orange-900 text-orange-200';
			case 'user':
				return 'bg-blue-900 text-blue-200';
			case 'suspended':
				return 'bg-red-900 text-red-200';
			default:
				return 'bg-gray-700 text-gray-300';
		}
	}

	$effect(() => {
		loadUser();
	});
</script>

<div class="space-y-6">
	<!-- Header with Navigation -->
	<div class="flex items-center justify-between">
		<div>
			<button
				onclick={() => goto('/users')}
				class="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-3 transition-colors"
			>
				<i class="fas fa-arrow-left"></i>
				<span>Back to Users</span>
			</button>
			<h1 class="text-3xl font-bold text-white">User Details</h1>
			<p class="text-gray-400 text-sm mt-2">View user information</p>
		</div>
	</div>

	{#if loading}
		<!-- Loading state -->
		<div class="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
			<i class="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4 block"></i>
			<p class="text-gray-300">Loading user...</p>
		</div>
	{:else if error}
		<!-- Error state -->
		<div class="bg-red-900 border border-red-700 rounded-lg p-6 text-red-200">
			<i class="fas fa-exclamation-circle mr-3"></i>
			<span>{error}</span>
		</div>
	{:else if user}
		<!-- User Details -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Main Content (2/3) -->
			<div class="lg:col-span-2 space-y-6">
				<!-- User Overview Card -->
				<div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
					<div class="flex items-start justify-between mb-6">
						<div class="flex items-center gap-4">
							<div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl text-white font-bold">
								{user.name.charAt(0).toUpperCase()}
							</div>
							<div>
								<h2 class="text-2xl font-bold text-white">{user.name}</h2>
								<p class="text-gray-400">{user.email}</p>
							</div>
						</div>
						<span class="px-3 py-1 rounded-full text-sm font-medium {getLevelBadgeColor(user.level)}">
							{user.level ? user.level.charAt(0).toUpperCase() + user.level.slice(1) : '-'}
						</span>
					</div>
				</div>

				<!-- User Information Card -->
				<div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
					<h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
						<i class="fas fa-user text-blue-400"></i>
						Personal Information
					</h3>
					<div class="space-y-4">
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label class="block text-sm text-gray-400 mb-2">User ID</label>
								<p class="text-white font-medium">{user.id}</p>
							</div>
							<div>
								<label class="block text-sm text-gray-400 mb-2">Email Address</label>
								<p class="text-white font-medium">{user.email}</p>
							</div>
						</div>
						<div>
							<label class="block text-sm text-gray-400 mb-2">Full Name</label>
							<p class="text-white font-medium">{user.name}</p>
						</div>
						<div>
							<label class="block text-sm text-gray-400 mb-2">User Level</label>
							<p class="text-white font-medium">{user.level ? user.level.charAt(0).toUpperCase() + user.level.slice(1) : '-'}</p>
						</div>
					</div>
				</div>

				<!-- Timestamps Card -->
				<div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
					<h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
						<i class="fas fa-calendar text-green-400"></i>
						Timeline
					</h3>
					<div class="space-y-4">
						{#if user.created_at}
							<div>
								<label class="block text-sm text-gray-400 mb-2">
									<i class="fas fa-plus-circle mr-2 text-green-400"></i>
									Created Date
								</label>
								<p class="text-white font-medium">{formatDate(user.created_at)}</p>
							</div>
						{/if}
						{#if user.updated_at}
							<div>
								<label class="block text-sm text-gray-400 mb-2">
									<i class="fas fa-edit mr-2 text-yellow-400"></i>
									Last Updated
								</label>
								<p class="text-white font-medium">{formatDate(user.updated_at)}</p>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Sidebar (1/3) -->
			<div class="space-y-6">
				<!-- Quick Actions Card -->
				<div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
					<h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
						<i class="fas fa-bolt text-yellow-400"></i>
						Quick Actions
					</h3>
					<div class="space-y-3">
						<button
							onclick={() => goto(`/users/${user.id}/edit`)}
							class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
						>
							<i class="fas fa-edit"></i>
							<span>Edit User</span>
						</button>
						<a
							href={`mailto:${user.email}`}
							class="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
						>
							<i class="fas fa-envelope"></i>
							<span>Send Email</span>
						</a>
					</div>
				</div>

				<!-- Status Card -->
				<div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
					<h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
						<i class="fas fa-shield-alt text-purple-400"></i>
						Status
					</h3>
					<div class="space-y-3">
						<div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
							<span class="text-gray-300">Account Level</span>
							<span class={`px-3 py-1 rounded text-sm font-medium ${getLevelBadgeColor(user.level)}`}>
								{user.level ? user.level.charAt(0).toUpperCase() + user.level.slice(1) : '-'}
							</span>
						</div>
					</div>
				</div>

				<!-- System Info Card -->
				<div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
					<h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
						<i class="fas fa-info-circle text-cyan-400"></i>
						System Info
					</h3>
					<div class="space-y-3 text-sm">
						<div class="flex justify-between items-center">
							<span class="text-gray-400">User Type</span>
							<span class="text-white font-medium">System User</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-gray-400">Account</span>
							<span class="text-white font-medium">Active</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-gray-400">2FA Status</span>
							<span class="text-gray-400 text-xs">Not configured</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
