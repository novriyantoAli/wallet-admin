<script>
	import { goto } from '$app/navigation';
	import { createUser } from '$lib/api/UserApi';

	let formData = $state({
		name: '',
		email: '',
		password: '',
		level: 'user'
	});

	let errors = $state({});
	let loading = $state(false);
	let submitError = $state(null);

	function validateForm() {
		errors = {};

		if (!formData.name.trim()) {
			errors.name = 'Name is required';
		}

		if (!formData.email.trim()) {
			errors.email = 'Email is required';
		} else if (!isValidEmail(formData.email)) {
			errors.email = 'Please enter a valid email';
		}

		if (!formData.password) {
			errors.password = 'Password is required';
		} else if (formData.password.length < 6) {
			errors.password = 'Password must be at least 6 characters';
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

		loading = true;
		submitError = null;

		try {
			const token = localStorage.getItem('token') || '';
			const response = await createUser(formData, token);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
			}

			await goto('/users');
		} catch (err) {
			submitError = err.message || 'Failed to create user';
			console.error('Error creating user:', err);
		} finally {
			loading = false;
		}
	}

	function handleCancel() {
		goto('/users');
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold text-white">Create User</h1>
		<p class="text-gray-400 text-sm mt-2">Add a new user to the system</p>
	</div>

	<!-- Form Card -->
	<div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
		{#if submitError}
			<div class="mb-6 bg-red-900 border border-red-700 rounded-lg p-4 text-red-200">
				<i class="fas fa-exclamation-circle mr-2"></i>
				<span>{submitError}</span>
			</div>
		{/if}

		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-6">
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

			<!-- Email Field -->
			<div>
				<label for="email" class="block text-sm font-medium text-gray-300 mb-2">
					<i class="fas fa-envelope mr-2 text-blue-400"></i>
					Email Address
				</label>
				<input
					type="email"
					id="email"
					bind:value={formData.email}
					placeholder="Enter email address"
					class="w-full px-4 py-2 bg-gray-700 border {errors.email ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
				/>
				{#if errors.email}
					<p class="text-red-400 text-sm mt-1">
						<i class="fas fa-exclamation-triangle mr-1"></i>
						{errors.email}
					</p>
				{/if}
			</div>

			<!-- Password Field -->
			<div>
				<label for="password" class="block text-sm font-medium text-gray-300 mb-2">
					<i class="fas fa-lock mr-2 text-blue-400"></i>
					Password
				</label>
				<input
					type="password"
					id="password"
					bind:value={formData.password}
					placeholder="Enter password (min 6 characters)"
					class="w-full px-4 py-2 bg-gray-700 border {errors.password ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
				/>
				{#if errors.password}
					<p class="text-red-400 text-sm mt-1">
						<i class="fas fa-exclamation-triangle mr-1"></i>
						{errors.password}
					</p>
				{/if}
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

			<!-- Form Actions -->
			<div class="flex gap-3 pt-6 border-t border-gray-700">
				<button
					type="submit"
					disabled={loading}
					class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if loading}
						<i class="fas fa-spinner fa-spin"></i>
						<span>Creating...</span>
					{:else}
						<i class="fas fa-check"></i>
						<span>Create User</span>
					{/if}
				</button>
				<button
					type="button"
					onclick={handleCancel}
					disabled={loading}
					class="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<i class="fas fa-times"></i>
					<span>Cancel</span>
				</button>
			</div>
		</form>
	</div>
</div>
