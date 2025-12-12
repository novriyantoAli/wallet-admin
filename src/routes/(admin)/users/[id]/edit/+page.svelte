<script>
	import { goto } from '$app/navigation';
	import { getUserById, updateUser } from '$lib/api/UserApi';

	let { params } = $props();

	let user = $state(null);
	let formData = $state({
		name: '',
		email: '',
		level: 'user'
	});

	let errors = $state({});
	let loading = $state(true);
	let submitLoading = $state(false);
	let error = $state(null);
	let submitError = $state(null);

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

			// Populate form data
			formData = {
				name: user.name || '',
				email: user.email || '',
				level: user.level || 'user'
			};
		} catch (err) {
			error = err.message || 'Failed to load user';
			console.error('Error loading user:', err);
		} finally {
			loading = false;
		}
	}

	function validateForm() {
		errors = {};

		if (!formData.name.trim()) {
			errors.name = 'Name is required';
		}

		if (!formData.level) {
			errors.level = 'Level is required';
		}

		return Object.keys(errors).length === 0;
	}

	function isValidEmail(email) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

	async function handleSubmit() {
		if (!validateForm()) {
			return;
		}

		submitLoading = true;
		submitError = null;

		try {
			const token = localStorage.getItem('token') || '';
			const response = await updateUser(params.id, formData, token);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
			}

			await goto('/users');
		} catch (err) {
			submitError = err.message || 'Failed to update user';
			console.error('Error updating user:', err);
		} finally {
			submitLoading = false;
		}
	}

	function handleCancel() {
		goto('/users');
	}

	$effect(() => {
		loadUser();
	});
</script>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold text-white">Edit User</h1>
		<p class="text-gray-400 text-sm mt-2">Update user information</p>
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
		<!-- Form Card -->
		<div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
			{#if submitError}
				<div class="mb-6 bg-red-900 border border-red-700 rounded-lg p-4 text-red-200">
					<i class="fas fa-exclamation-circle mr-2"></i>
					<span>{submitError}</span>
				</div>
			{/if}

			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-6">
				<!-- User ID (Read-only) -->
				<div>
					<label for="id" class="block text-sm font-medium text-gray-300 mb-2">
						<i class="fas fa-hashtag mr-2 text-blue-400"></i>
						User ID
					</label>
					<input
						type="text"
						id="id"
						value={user.id}
						disabled
						class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
					/>
				</div>

				<!-- Name Field -->
				<div>
					<label for="name" class="block text-sm font-medium text-gray-300 mb-2">
						<i class="fas fa-user mr-2 text-blue-400"></i>
						Full Name
					</label>
					<input
						type="text"
						id="name"
						bind:value={formData.name}
						placeholder="Enter user name"
						class="w-full px-4 py-2 bg-gray-700 border {errors.name ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
					/>
					{#if errors.name}
						<p class="text-red-400 text-sm mt-1">
							<i class="fas fa-exclamation-triangle mr-1"></i>
							{errors.name}
						</p>
					{/if}
				</div>

				<!-- Email Field (Read-only) -->
				<div>
					<label for="email" class="block text-sm font-medium text-gray-300 mb-2">
						<i class="fas fa-envelope mr-2 text-blue-400"></i>
						Email Address
					</label>
					<input
						type="email"
						id="email"
						value={formData.email}
						disabled
						class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
					/>
					<p class="text-gray-500 text-xs mt-1">
						<i class="fas fa-lock mr-1"></i>
						Email cannot be changed
					</p>
				</div>

				<!-- Level Field -->
				<div>
					<label for="level" class="block text-sm font-medium text-gray-300 mb-2">
						<i class="fas fa-shield-alt mr-2 text-blue-400"></i>
						User Level
					</label>
					<select
						id="level"
						bind:value={formData.level}
						class="w-full px-4 py-2 bg-gray-700 border {errors.level ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
					>
						<option value="user">User</option>
						<option value="reseller">Reseller</option>
						<option value="admin">Admin</option>
					</select>
					{#if errors.level}
						<p class="text-red-400 text-sm mt-1">
							<i class="fas fa-exclamation-triangle mr-1"></i>
							{errors.level}
						</p>
					{/if}
				</div>

				<!-- Created Date (Read-only) -->
				{#if user.created_at}
					<div>
						<label for="created_at" class="block text-sm font-medium text-gray-300 mb-2">
							<i class="fas fa-calendar mr-2 text-blue-400"></i>
							Created Date
						</label>
						<input
							type="text"
							id="created_at"
							value={new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
							disabled
							class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
						/>
					</div>
				{/if}

				<!-- Form Actions -->
				<div class="flex gap-3 pt-6 border-t border-gray-700">
					<button
						type="submit"
						disabled={submitLoading}
						class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if submitLoading}
							<i class="fas fa-spinner fa-spin"></i>
							<span>Updating...</span>
						{:else}
							<i class="fas fa-check"></i>
							<span>Update User</span>
						{/if}
					</button>
					<button
						type="button"
						onclick={handleCancel}
						disabled={submitLoading}
						class="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<i class="fas fa-times"></i>
						<span>Cancel</span>
					</button>
				</div>
			</form>
		</div>
	{/if}
</div>
