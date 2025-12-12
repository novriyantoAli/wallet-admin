<script>
	import { goto } from '$app/navigation';
	import { getUsers, deleteUser, updateUserStatus } from '$lib/api/UserApi';

	let { data } = $props();

	let users = $state([]);
	let loading = $state(true);
	let error = $state(null);
	let updatingStatusId = $state(null);

	// Load users from API
	async function loadUsers() {
		try {
			loading = true;
			error = null;

			const token = localStorage.getItem('token') || '';

			const response = await getUsers(token);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			users = result.data || result || [];
		} catch (err) {
			error = err.message || 'Failed to load users';
			console.error('Error loading users:', err);
			users = [];
		} finally {
			loading = false;
		}
	}

	async function handleDelete(id) {
		if (confirm('Are you sure you want to delete this user?')) {
			try {
				const token = localStorage.getItem('token') || '';
				const response = await deleteUser(id, token);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				await loadUsers();
			} catch (err) {
				alert(`Error deleting user: ${err.message}`);
				console.error('Error:', err);
			}
		}
	}

	async function handleStatusToggle(user) {
		const statusOptions = ['user', 'reseller', 'admin'];
		const currentIndex = statusOptions.indexOf(user.level?.toLowerCase());
		const nextStatus = statusOptions[(currentIndex + 1) % statusOptions.length];

		const token = localStorage.getItem('token') || '';
		updatingStatusId = user.id;

		try {
			const response = await updateUserStatus(user.id, nextStatus, token);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			// Update the user status in local state
			const index = users.findIndex(u => u.id === user.id);
			if (index !== -1) {
				users[index].level = nextStatus;
			}
		} catch (err) {
			alert(`Error updating user status: ${err.message}`);
			console.error('Error:', err);
		} finally {
			updatingStatusId = null;
		}
	}

	function getStatusColor(level) {
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

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	// Load users when component mounts
	$effect(() => {
		loadUsers();
	});
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-white">Users</h1>
			<p class="text-gray-400 text-sm mt-2">Manage all system users</p>
		</div>
		<button
			onclick={() => goto('/users/create')}
			class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
		>
			<i class="fas fa-plus"></i>
			Create User
		</button>
	</div>

	{#if loading}
		<!-- Loading state -->
		<div class="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
			<i class="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4 block"></i>
			<p class="text-gray-300">Loading users...</p>
		</div>
	{:else if error}
		<!-- Error state -->
		<div class="bg-red-900 border border-red-700 rounded-lg p-6 text-red-200">
			<i class="fas fa-exclamation-circle mr-3"></i>
			<span>{error}</span>
		</div>
	{:else if users.length === 0}
		<!-- Empty state -->
		<div class="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
			<i class="fas fa-users text-4xl text-gray-500 mb-4 block"></i>
			<p class="text-gray-300">
				No users found.
				<button onclick={() => goto('/users/create')} class="text-blue-400 hover:underline">Create one</button>
			</p>
		</div>
	{:else}
		<!-- Users Table -->
		<div class="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-700 border-b border-gray-600">
						<tr>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">User ID</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">Name</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">Email</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">Level</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">Created Date</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-700">
						{#each users as user (user.id)}
							<tr class="hover:bg-gray-750 transition-colors duration-150">
								<td class="px-6 py-4 text-sm text-white font-medium">{user.id}</td>
								<td class="px-6 py-4 text-sm text-gray-300">{user.name}</td>
								<td class="px-6 py-4 text-sm text-gray-300">{user.email}</td>
								<td class="px-6 py-4 text-sm">
									<button
										onclick={() => handleStatusToggle(user)}
										disabled={updatingStatusId === user.id}
										class="px-2 py-1 rounded text-xs font-medium transition-all duration-200 {getStatusColor(user.level)} {updatingStatusId === user.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}"
										title="Click to toggle level"
									>
										{#if updatingStatusId === user.id}
											<i class="fas fa-spinner fa-spin"></i>
										{:else}
											{user.level ? user.level.charAt(0).toUpperCase() + user.level.slice(1) : '-'}
										{/if}
									</button>
								</td>
								<td class="px-6 py-4 text-sm text-gray-400">{formatDate(user.created_at)}</td>
								<td class="px-6 py-4 text-sm">
									<div class="flex gap-2">
										<button
											onclick={() => goto(`/users/${user.id}`)}
											class="text-green-400 hover:text-green-300 transition-colors"
											title="View details"
										>
											<i class="fas fa-eye"></i>
										</button>
										<button
											onclick={() => goto(`/users/${user.id}/edit`)}
											class="text-blue-400 hover:text-blue-300 transition-colors"
											title="Edit user"
										>
											<i class="fas fa-edit"></i>
										</button>
										<button
											onclick={() => handleDelete(user.id)}
											class="text-red-400 hover:text-red-300 transition-colors"
											title="Delete user"
										>
											<i class="fas fa-trash"></i>
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<style>
	:global(.hover\:bg-gray-750:hover) {
		background-color: rgba(55, 65, 81, 0.5);
	}
</style>
