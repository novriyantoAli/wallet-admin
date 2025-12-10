<script>
	import { goto } from '$app/navigation';
	import { getProducts, createProduct, updateProduct, deleteProduct, updateProductStatus } from '$lib/api/ProductApi';

	/** @type {import('./$types').PageProps} */
	let { data } = $props();

	let products = $state([]);
	let loading = $state(true);
	let error = $state(null);

	let showAddForm = $state(false);
	let editingId = $state(null);
	let isSubmitting = $state(false);
	let updatingStatusId = $state(null);
	let formData = $state({
		name: '',
		description: '',
		price: '',
		stock: '',
		category: '',
		status: ''
	});

	// Load products from API
	async function loadProducts() {
		try {
			loading = true;
			error = null;
			
			// Get token from localStorage or context
			const token = localStorage.getItem('token') || '';
			
			const response = await getProducts(token);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const data = await response.json();
			products = data.data || data || [];
		} catch (err) {
			error = err.message || 'Failed to load products';
			console.error('Error loading products:', err);
			products = [];
		} finally {
			loading = false;
		}
	}

	function handleAddClick() {
		showAddForm = true;
		editingId = null;
		formData = { name: '', description: '', price: '', stock: '', category: '' };
	}

	function handleEditClick(product) {
		editingId = product.id;
		formData = {
			name: product.name,
			description: product.description,
			price: product.price,
			stock: product.stock,
			category: '',
			status: product.status || 'active'
		};
		showAddForm = true;
	}

	async function handleSubmit() {
		if (!formData.name || !formData.price || formData.stock === '') {
			alert('Please fill in all required fields');
			return;
		}

		// Validate category only for create (when editingId is null)
		if (!editingId && !formData.category) {
			alert('Please select a category');
			return;
		}

		isSubmitting = true;
		try {
			const token = localStorage.getItem('token') || '';
			
			const productPayload = {
				name: formData.name,
				description: formData.description,
				price: parseFloat(formData.price),
				stock: parseInt(formData.stock)
			};

			// Only add category to payload when creating
			if (!editingId) {
				productPayload.category = formData.category;
			}

			// Only add status to payload when updating
			if (editingId) {
				productPayload.status = formData.status;
			}

			let response;
			if (editingId) {
				response = await updateProduct(editingId, productPayload, token);
			} else {
				response = await createProduct(productPayload, token);
			}

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			// Reload products
			await loadProducts();
			showAddForm = false;
			formData = { name: '', description: '', price: '', stock: '', category: '', status: '' };
		} catch (err) {
			alert(`Error ${editingId ? 'updating' : 'creating'} product: ${err.message}`);
			console.error('Error:', err);
		} finally {
			isSubmitting = false;
		}
	}

	async function handleStatusToggle(product) {
		// Determine the new status
		const statusOptions = ['active', 'inactive'];
		const currentIndex = statusOptions.indexOf(product.status?.toLowerCase());
		const nextStatus = statusOptions[(currentIndex + 1) % statusOptions.length];

		const token = localStorage.getItem('token') || '';
		updatingStatusId = product.id;
		
		try {
			const response = await updateProductStatus(product.id, nextStatus, token);
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			// Update the product status in the local state
			const index = products.findIndex(p => p.id === product.id);
			if (index !== -1) {
				products[index].status = nextStatus;
			}
		} catch (err) {
			alert(`Error updating product status: ${err.message}`);
			console.error('Error:', err);
		} finally {
			updatingStatusId = null;
		}
	}

	async function handleDelete(id) {
		if (confirm('Are you sure you want to delete this product?')) {
			try {
				const token = localStorage.getItem('token') || '';
				const response = await deleteProduct(id, token);
				
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				
				await loadProducts();
			} catch (err) {
				alert(`Error deleting product: ${err.message}`);
				console.error('Error:', err);
			}
		}
	}

	function getStockStatus(stock) {
		if (stock === 0) return 'Out of Stock';
		if (stock < 20) return 'Low Stock';
		return 'In Stock';
	}

	function getProductStatusColor(status) {
		switch (status?.toLowerCase()) {
			case 'active':
				return 'bg-green-900 text-green-200';
			case 'inactive':
				return 'bg-yellow-900 text-yellow-200';
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

	// Load products when component mounts
	$effect(() => {
		loadProducts();
	});
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex justify-between items-center">
		<div>
			<h1 class="text-3xl font-bold text-white">Product Management</h1>
			<p class="text-gray-400 mt-2">Manage your product inventory and details</p>
		</div>
		<button
			onclick={handleAddClick}
			class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200"
		>
			<i class="fas fa-plus"></i>
			<span>Add Product</span>
		</button>
	</div>

	<!-- Error Message -->
	{#if error}
		<div class="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-200 flex items-center gap-3">
			<i class="fas fa-exclamation-circle text-lg"></i>
			<div>
				<p class="font-semibold">Error</p>
				<p class="text-sm">{error}</p>
			</div>
		</div>
	{/if}

	<!-- Add/Edit Form -->
	{#if showAddForm}
		<div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
			<h2 class="text-xl font-bold text-white mb-4">
				{editingId ? 'Edit Product' : 'Add New Product'}
			</h2>
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="name" class="block text-gray-300 text-sm font-medium mb-2">Product Name</label>
						<input
							id="name"
							type="text"
							bind:value={formData.name}
							required
							class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
							placeholder="Enter product name"
						/>
					</div>
					<div>
						<label for="price" class="block text-gray-300 text-sm font-medium mb-2">Price</label>
						<input
							id="price"
							type="number"
							bind:value={formData.price}
							required
							step="0.01"
							class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
							placeholder="0.00"
						/>
					</div>
					<div>
						<label for="stock" class="block text-gray-300 text-sm font-medium mb-2">Stock Quantity</label>
						<input
							id="stock"
							type="number"
							bind:value={formData.stock}
							required
							class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
							placeholder="0"
						/>
					</div>
				</div>

				<!-- Category field - only show for create -->
				{#if !editingId}
					<div>
						<label for="category" class="block text-gray-300 text-sm font-medium mb-2">Category</label>
						<select
							id="category"
							bind:value={formData.category}
							required
							class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
						>
							<option value="">Select a category</option>
							<option value="wifi">WiFi</option>
							<option value="pulsa">Pulsa</option>
						</select>
					</div>
				{/if}

				<!-- Status field - only show for update -->
				{#if editingId}
					<div>
						<label for="status" class="block text-gray-300 text-sm font-medium mb-2">Status</label>
						<select
							id="status"
							bind:value={formData.status}
							class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
						>
							<option value="active">Active</option>
							<option value="inactive">Inactive</option>
						</select>
					</div>
				{/if}

				<div>
					<label for="description" class="block text-gray-300 text-sm font-medium mb-2">Description</label>
					<textarea
						id="description"
						bind:value={formData.description}
						required
						class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
						placeholder="Enter product description"
						rows="3"
					></textarea>
				</div>
				<div class="flex gap-3">
					<button
						type="submit"
						disabled={isSubmitting}
						class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
					>
						{#if isSubmitting}
							<i class="fas fa-spinner fa-spin"></i>
							<span>Saving...</span>
						{:else}
							<span>{editingId ? 'Update Product' : 'Add Product'}</span>
						{/if}
					</button>
					<button
						type="button"
						onclick={() => (showAddForm = false)}
						class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors duration-200"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Loading State -->
	{#if loading}
		<div class="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
			<i class="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4 block"></i>
			<p class="text-gray-300">Loading products...</p>
		</div>
	{:else if products.length === 0}
		<!-- Empty State -->
		<div class="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
			<i class="fas fa-box-open text-4xl text-gray-500 mb-4 block"></i>
			<p class="text-gray-300">
				No products found.
				<button onclick={handleAddClick} class="text-blue-400 hover:underline">Create one</button>
			</p>
		</div>
	{:else}
		<!-- Products Table -->
		<div class="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
			<div class="overflow-x-auto">
					<table class="w-full">
					<thead class="bg-gray-700 border-b border-gray-600">
						<tr>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">Product Name</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">Category</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">SKU</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">Price</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">Stock</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">Status</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">Created</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">Updated</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-700">
						{#each products as product (product.id)}
							<tr class="hover:bg-gray-750 transition-colors duration-150">
								<td class="px-6 py-4 text-sm text-white font-medium">{product.name}</td>
								<td class="px-6 py-4 text-sm text-gray-300">
									<span class="px-2 py-1 rounded text-xs font-medium bg-blue-900 text-blue-200">{product.category || '-'}</span>
								</td>
								<td class="px-6 py-4 text-sm text-gray-300 font-mono">{product.sku}</td>
								<td class="px-6 py-4 text-sm text-white font-medium">${product.price.toFixed(2)}</td>
							<td class="px-6 py-4 text-sm text-white">{product.stock}</td>
							<td class="px-6 py-4 text-sm">
								<button
									onclick={() => handleStatusToggle(product)}
									disabled={updatingStatusId === product.id}
									class="px-3 py-1 rounded text-xs font-medium transition-all duration-200 {getProductStatusColor(product.status)} {updatingStatusId === product.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}"
									title="Click to toggle status"
								>
									{#if updatingStatusId === product.id}
										<i class="fas fa-spinner fa-spin"></i>
									{:else}
										{product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : '-'}
									{/if}
								</button>
							</td>
								<td class="px-6 py-4 text-sm text-gray-400">{formatDate(product.created_at)}</td>
								<td class="px-6 py-4 text-sm text-gray-400">{formatDate(product.updated_at)}</td>
							<td class="px-6 py-4 text-sm">
								<div class="flex gap-2">
									<button
										onclick={() => goto(`/products/${product.id}`)}
										class="text-green-400 hover:text-green-300 transition-colors"
										title="View details"
									>
										<i class="fas fa-eye"></i>
									</button>
									<button
										onclick={() => handleEditClick(product)}
										class="text-blue-400 hover:text-blue-300 transition-colors"
										title="Edit product"
									>
										<i class="fas fa-edit"></i>
									</button>
									<button
										onclick={() => handleDelete(product.id)}
										class="text-red-400 hover:text-red-300 transition-colors"
										title="Delete product"
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
