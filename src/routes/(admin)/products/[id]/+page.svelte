<script>
	import { goto } from '$app/navigation';
	import { 
        getProductById,
        getProductWifiByProductId,
        updateProductWifi,
        updateProduct, 
        updateProductStatus,
    } from '$lib/api/ProductApi';

	let { data } = $props();

	let product = $state(null);
	let loading = $state(true);
	let error = $state(null);
	let isEditing = $state(false);
	let isEditingWifi = $state(false);
	let isSaving = $state(false);
	let isSavingWifi = $state(false);
	let updatingStatus = $state(false);

	let editForm = $state({
		name: '',
		description: '',
		price: '',
		stock: '',
		status: '',
	});

	let wifiEditForm = $state({
		quota: 0,
		duration: 0,
		speed_limit: 0,
	});

    let productWifi = $derived.by( async() => {
        if (!product) return null;

        if (product.category === 'wifi') {
                    try {
            const token = localStorage.getItem('token') || '';
            const response = await getProductWifiByProductId(product.id, token);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();

            console.log(result);
            
            return result || {};
        } catch (err) {
            console.error('Error loading product WiFi details:', err);
            return null;
        }
        } else {
            return null;
        }
    })

	// Load product on mount
	async function loadProduct() {
		try {
			loading = true;
			error = null;
			const token = localStorage.getItem('token') || '';

			const response = await getProductById(data.id, token);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			product = result.data || result;

			// Initialize edit form with current data
			if (product) {
				editForm = {
					name: product.name || '',
					description: product.description || '',
					price: product.price || '',
					stock: product.stock || '',
					status: product.status || '',
				};
			}
		} catch (err) {
			error = err.message || 'Failed to load product';
			console.error('Error loading product:', err);
		} finally {
			loading = false;
		}
	}

	async function handleSave() {
		if (!editForm.name || !editForm.price || editForm.stock === '') {
			alert('Please fill in all required fields');
			return;
		}

		isSaving = true;
		try {
			const token = localStorage.getItem('token') || '';

			const payload = {
				name: editForm.name,
				description: editForm.description,
				price: parseFloat(editForm.price),
				stock: parseInt(editForm.stock),
				status: editForm.status
			};

			const response = await updateProduct(product.id, payload, token);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			// Reload product data
			await loadProduct();
			isEditing = false;
			alert('Product updated successfully');
		} catch (err) {
			alert(`Error saving product: ${err.message}`);
			console.error('Error:', err);
		} finally {
			isSaving = false;
		}
	}

	async function handleStatusToggle() {
		if (!product) return;

		const newStatus = product.status?.toLowerCase() === 'active' ? 'inactive' : 'active';
		updatingStatus = true;

		try {
			const token = localStorage.getItem('token') || '';
			const response = await updateProductStatus(product.id, newStatus, token);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			product.status = newStatus;
			editForm.status = newStatus;
		} catch (err) {
			alert(`Error updating status: ${err.message}`);
			console.error('Error:', err);
		} finally {
			updatingStatus = false;
		}
	}

	function handleCancel() {
		isEditing = false;
		// Reset form to current product data
		if (product) {
			editForm = {
				name: product.name || '',
				description: product.description || '',
				price: product.price || '',
				stock: product.stock || '',
				status: product.status || ''
			};
		}
	}

	function handleWifiEditClick() {
		isEditingWifi = true;
		// Initialize WiFi form with current data if available
		if (productWifi) {
			const wifiData = typeof productWifi === 'function' ? null : productWifi;
			if (wifiData) {
				wifiEditForm = {
					quota: wifiData.quota || 0,
					duration: wifiData.duration || 0,
					speed_limit: wifiData.speed_limit || 0
				};
			}
		}
	}

	async function handleWifiSave() {
		// Allow saving with any values including 0
		isSavingWifi = true;
		try {
			const token = localStorage.getItem('token') || '';

			const payload = {
				quota: wifiEditForm.quota ? parseFloat(wifiEditForm.quota) : null,
				duration: wifiEditForm.duration ? parseInt(wifiEditForm.duration) : null,
				speed_limit: wifiEditForm.speed_limit ? parseFloat(wifiEditForm.speed_limit) : null
			};

			const response = await updateProductWifi(product.id, payload, token);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			// Update productWifi state
			const result = await response.json();
			productWifi = result.data || result;
			isEditingWifi = false;
			alert('WiFi specifications updated successfully');
		} catch (err) {
			alert(`Error saving WiFi specifications: ${err.message}`);
			console.error('Error:', err);
		} finally {
			isSavingWifi = false;
		}
	}

	function handleWifiCancel() {
		isEditingWifi = false;
		// Reset form
		wifiEditForm = {
			quota: 0,
			duration: 0,
			speed_limit: 0
		};
	}

	function getStatusColor(status) {
		switch (status?.toLowerCase()) {
			case 'active':
				return 'bg-green-900 text-green-200';
			case 'inactive':
				return 'bg-yellow-900 text-yellow-200';
			default:
				return 'bg-gray-700 text-gray-300';
		}
	}

	function getCategoryColor(category) {
		return 'bg-blue-900 text-blue-200';
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

	$effect(() => {
		loadProduct();
	});
</script>

<div class="space-y-6">
	<!-- Header with back button -->
	<div class="flex items-center justify-between mb-8">
		<div class="flex items-center gap-4">
			<button
				onclick={() => goto('/products')}
				class="text-gray-400 hover:text-gray-200 transition-colors"
				title="Back to products"
			>
				<i class="fas fa-arrow-left text-xl"></i>
			</button>
			<div>
				<h1 class="text-3xl font-bold text-white">Product Details</h1>
				<p class="text-gray-400 text-sm mt-1">View and manage product information</p>
			</div>
		</div>
		<button
			onclick={() => (isEditing = !isEditing)}
			class="px-4 py-2 rounded-lg transition-colors {isEditing
				? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
				: 'bg-blue-600 text-white hover:bg-blue-700'}"
		>
			<i class="fas {isEditing ? 'fa-times' : 'fa-edit'} mr-2"></i>
			{isEditing ? 'Cancel' : 'Edit'}
		</button>
	</div>

	{#if loading}
		<!-- Loading state -->
		<div class="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
			<i class="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4 block"></i>
			<p class="text-gray-300">Loading product details...</p>
		</div>
	{:else if error}
		<!-- Error state -->
		<div class="bg-red-900 border border-red-700 rounded-lg p-6 text-red-200">
			<i class="fas fa-exclamation-circle mr-3"></i>
			<span>{error}</span>
		</div>
	{:else if product}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Main Content Area -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Product Overview Card -->
				<div class="bg-gray-800 border border-gray-700 rounded-lg p-8">
					<div class="flex items-start justify-between mb-6">
						<div>
							{#if isEditing}
								<input
									type="text"
									bind:value={editForm.name}
									class="text-2xl font-bold text-white bg-gray-700 border border-gray-600 rounded px-4 py-2 w-full mb-2"
									placeholder="Product name"
								/>
							{:else}
								<h2 class="text-2xl font-bold text-white mb-2">{product.name}</h2>
							{/if}
							<div class="flex items-center gap-3 mt-3 flex-wrap">
								<span class="px-3 py-1 rounded-full text-sm font-medium {getCategoryColor(product.category)}">
									<i class="fas fa-tag mr-1"></i>
									{product.category || 'Uncategorized'}
								</span>
								<span class="px-3 py-1 rounded text-sm font-medium {getStatusColor(product.status)}">
									{product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : 'Unknown'}
								</span>
								<span class="px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-300">
									<i class="fas fa-barcode mr-1"></i>
									{product.sku}
								</span>
							</div>
						</div>
					</div>

					<!-- Description Section -->
					<div class="mt-8 pt-8 border-t border-gray-700">
						<h3 class="text-lg font-semibold text-white mb-4">Description</h3>
						{#if isEditing}
							<textarea
								bind:value={editForm.description}
								rows="5"
								class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
								placeholder="Product description"
							></textarea>
						{:else}
							<p class="text-gray-300 leading-relaxed whitespace-pre-wrap">
								{product.description || 'No description available'}
							</p>
						{/if}
					</div>
				</div>

				<!-- Pricing & Inventory Card -->
				<div class="grid grid-cols-2 gap-6">
					<!-- Price Section -->
					<div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
						<div class="flex items-center justify-between mb-4">
							<h3 class="text-lg font-semibold text-white flex items-center gap-2">
								<i class="fas fa-tag text-green-400"></i>
								Price
							</h3>
						</div>
						{#if isEditing}
							<input
								type="number"
								bind:value={editForm.price}
								step="0.01"
								class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
								placeholder="0.00"
							/>
						{:else}
							<p class="text-3xl font-bold text-green-400">${parseFloat(product.price).toFixed(2)}</p>
						{/if}
					</div>

					<!-- Stock Section -->
					<div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
						<div class="flex items-center justify-between mb-4">
							<h3 class="text-lg font-semibold text-white flex items-center gap-2">
								<i class="fas fa-boxes text-blue-400"></i>
								Stock
							</h3>
						</div>
						{#if isEditing}
							<input
								type="number"
								bind:value={editForm.stock}
								class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
								placeholder="0"
							/>
						{:else}
							<div class="flex items-end justify-between">
								<p class="text-3xl font-bold text-blue-400">{product.stock}</p>
								<span
									class="px-3 py-1 rounded-full text-xs font-medium {product.stock === 0
										? 'bg-red-900 text-red-200'
										: product.stock < 20
											? 'bg-yellow-900 text-yellow-200'
											: 'bg-green-900 text-green-200'}"
								>
									{product.stock === 0 ? 'Out of Stock' : product.stock < 20 ? 'Low Stock' : 'In Stock'}
								</span>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Sidebar -->
			<div class="lg:col-span-1 space-y-6">
				<!-- Status Control Card -->
				<div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
					<h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
						<i class="fas fa-toggle-on"></i>
						Status
					</h3>
					<button
						onclick={handleStatusToggle}
						disabled={updatingStatus}
						class="w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 {product.status?.toLowerCase() === 'active'
							? 'bg-green-600 hover:bg-green-700 text-white'
							: 'bg-yellow-600 hover:bg-yellow-700 text-white'} {updatingStatus && 'opacity-50 cursor-not-allowed'}"
					>
						{#if updatingStatus}
							<i class="fas fa-spinner fa-spin"></i>
						{:else}
							<i class="fas {product.status?.toLowerCase() === 'active' ? 'fa-check-circle' : 'fa-clock'}"></i>
						{/if}
						{product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : 'Unknown'}
					</button>
					<p class="text-xs text-gray-400 mt-3 text-center">
						Click to toggle between Active and Inactive
					</p>
				</div>

				<!-- Metadata Card -->
				<div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
					<h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
						<i class="fas fa-info-circle"></i>
						Information
					</h3>
					<div class="space-y-4 text-sm">
						<div>
							<p class="text-gray-400 mb-1">Product ID</p>
							<p class="text-white font-mono text-xs bg-gray-700 p-2 rounded break-all">{product.id}</p>
						</div>
						<div>
							<p class="text-gray-400 mb-1">Created Date</p>
							<p class="text-white">{formatDate(product.created_at)}</p>
						</div>
						<div>
							<p class="text-gray-400 mb-1">Last Updated</p>
							<p class="text-white">{formatDate(product.updated_at)}</p>
						</div>
					</div>
				</div>

				<!-- Action Buttons -->
				{#if isEditing}
					<div class="space-y-2">
						<button
							onclick={handleSave}
							disabled={isSaving}
							class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors {isSaving && 'opacity-50 cursor-not-allowed'}"
						>
							{#if isSaving}
								<i class="fas fa-spinner fa-spin mr-2"></i>
								Saving...
							{:else}
								<i class="fas fa-save mr-2"></i>
								Save Changes
							{/if}
						</button>
						<button
							onclick={handleCancel}
							class="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors"
						>
							<i class="fas fa-times mr-2"></i>
							Cancel
						</button>
					</div>
				{/if}
			</div>
		</div>

        {#await productWifi then productWifiInfo}
        {#if product.category === 'wifi'}

        <!-- Additional Information Section -->
		<div class="bg-gray-800 border border-gray-700 rounded-lg p-8">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-2xl font-bold text-white flex items-center gap-2">
					<i class="fas fa-cog"></i>
					WiFi Product
				</h2>
				<button
					onclick={() => (isEditingWifi = !isEditingWifi)}
					class="px-4 py-2 rounded-lg transition-colors {isEditingWifi
						? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
						: 'bg-blue-600 text-white hover:bg-blue-700'}"
				>
					<i class="fas {isEditingWifi ? 'fa-times' : 'fa-edit'} mr-2"></i>
					{isEditingWifi ? 'Cancel' : 'Edit'}
				</button>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<!-- Quota -->
				<div class="bg-gray-700 rounded-lg p-6">
					<div class="flex items-center justify-between mb-3">
						<h3 class="text-gray-400 text-sm font-medium">Quota</h3>
						<i class="fas fa-chart-bar text-cyan-400"></i>
					</div>
					{#if isEditingWifi}
						<input
							type="number"
							bind:value={wifiEditForm.quota}
							step="0.01"
							class="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
							placeholder="0.00"
						/>
					{:else}
						<p class="text-2xl font-bold text-white">
							{productWifiInfo.quota ? productWifiInfo.quota.toFixed(2) : '-'}
						</p>
					{/if}
					{#if productWifiInfo.quota}
						<p class="text-xs text-gray-400 mt-2">GB</p>
					{/if}
				</div>

				<!-- Duration -->
				<div class="bg-gray-700 rounded-lg p-6">
					<div class="flex items-center justify-between mb-3">
						<h3 class="text-gray-400 text-sm font-medium">Duration</h3>
						<i class="fas fa-hourglass-end text-orange-400"></i>
					</div>
					{#if isEditingWifi}
						<input
							type="number"
							bind:value={wifiEditForm.duration}
							class="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
							placeholder="0"
						/>
					{:else}
						<p class="text-2xl font-bold text-white">
							{productWifiInfo.duration ?? '-'}
						</p>
					{/if}
					{#if productWifiInfo.duration}
						<p class="text-xs text-gray-400 mt-2">Days</p>
					{/if}
				</div>

				<!-- Speed Limit -->
				<div class="bg-gray-700 rounded-lg p-6">
					<div class="flex items-center justify-between mb-3">
						<h3 class="text-gray-400 text-sm font-medium">Speed Limit</h3>
						<i class="fas fa-tachometer-alt text-green-400"></i>
					</div>
					{#if isEditingWifi}
						<input
							type="number"
							bind:value={wifiEditForm.speed_limit}
							step="0.01"
							class="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
							placeholder="0.00"
						/>
					{:else}
						<p class="text-2xl font-bold text-white">
							{productWifiInfo.speed_limit ? productWifiInfo.speed_limit.toFixed(2) : '-'}
						</p>
					{/if}
					{#if productWifiInfo.speed_limit}
						<p class="text-xs text-gray-400 mt-2">Mbps</p>
					{/if}
				</div>

				<!-- Product ID Info -->
				<div class="bg-gray-700 rounded-lg p-6">
					<div class="flex items-center justify-between mb-3">
						<h3 class="text-gray-400 text-sm font-medium">Product ID</h3>
						<i class="fas fa-fingerprint text-purple-400"></i>
					</div>
					<p class="text-sm font-mono text-white break-all">
						{productWifiInfo.id}
					</p>
				</div>
			</div>

			<!-- Metadata Section -->
			<div class="mt-8 pt-8 border-t border-gray-600">
				<h3 class="text-lg font-semibold text-white mb-4">Metadata</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<p class="text-gray-400 text-sm mb-2">Created At</p>
						<p class="text-white font-mono text-sm">{formatDate(productWifiInfo.created_at)}</p>
					</div>
					<div>
						<p class="text-gray-400 text-sm mb-2">Updated At</p>
						<p class="text-white font-mono text-sm">{formatDate(productWifiInfo.updated_at)}</p>
					</div>
				</div>
			</div>

			<!-- Action Buttons for WiFi -->
			{#if isEditingWifi}
				<div class="mt-8 flex gap-3">
					<button
						onclick={handleWifiSave}
						disabled={isSavingWifi}
						class="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors {isSavingWifi && 'opacity-50 cursor-not-allowed'}"
					>
						{#if isSavingWifi}
							<i class="fas fa-spinner fa-spin mr-2"></i>
							Saving...
						{:else}
							<i class="fas fa-save mr-2"></i>
							Save WiFi Specs
						{/if}
					</button>
					<button
						onclick={handleWifiCancel}
						class="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors"
					>
						<i class="fas fa-times mr-2"></i>
						Cancel
					</button>
				</div>
			{/if}
		</div>
        {/if}
            
        {/await}
		
	{:else}
		<!-- Not found state -->
		<div class="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
			<i class="fas fa-box-open text-4xl text-gray-500 mb-4 block"></i>
			<p class="text-gray-300">Product not found</p>
		</div>
	{/if}
</div>

<style>
	/* Custom styles if needed */
</style>
