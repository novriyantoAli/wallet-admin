<script>
	import { goto } from '$app/navigation';
	import { getWallets, deleteWallet, updateWalletBalance } from '$lib/api/WalletApi';

	let { data } = $props();

	let wallets = $state([]);
	let loading = $state(true);
	let error = $state(null);
	let showTransactionModal = $state(false);
	let selectedWalletId = $state(null);
	let transactionLoading = $state(false);
	let transactionForm = $state({
		amount: '',
		description: '',
		transaction_type: 'credit'
	});

	// Load wallets from API
	async function loadWallets() {
		try {
			loading = true;
			error = null;

			const token = localStorage.getItem('token') || '';

			const response = await getWallets(token);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			wallets = result.data || result || [];
		} catch (err) {
			error = err.message || 'Failed to load wallets';
			console.error('Error loading wallets:', err);
			wallets = [];
		} finally {
			loading = false;
		}
	}

	async function handleDelete(id) {
		if (confirm('Are you sure you want to delete this wallet?')) {
			try {
				const token = localStorage.getItem('token') || '';
				const response = await deleteWallet(id, token);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				await loadWallets();
			} catch (err) {
				alert(`Error deleting wallet: ${err.message}`);
				console.error('Error:', err);
			}
		}
	}

	function openTransactionModal(walletId) {
		selectedWalletId = walletId;
		showTransactionModal = true;
		transactionForm = {
			amount: '',
			description: '',
			transaction_type: 'credit'
		};
	}

	function closeTransactionModal() {
		showTransactionModal = false;
		selectedWalletId = null;
		transactionForm = {
			amount: '',
			description: '',
			transaction_type: 'credit'
		};
	}

	async function handleTransaction() {
		if (!transactionForm.amount || transactionForm.amount <= 0) {
			alert('Please enter a valid amount');
			return;
		}

		if (!transactionForm.transaction_type) {
			alert('Please select transaction type');
			return;
		}

		transactionLoading = true;
		try {
			const token = localStorage.getItem('token') || '';

			const payload = {
				amount: parseFloat(transactionForm.amount),
				description: transactionForm.description || '',
				transaction_type: transactionForm.transaction_type
			};

			const response = await updateWalletBalance(selectedWalletId, payload, token);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			alert('Transaction completed successfully');
			closeTransactionModal();
			await loadWallets();
		} catch (err) {
			alert(`Error processing transaction: ${err.message}`);
			console.error('Error:', err);
		} finally {
			transactionLoading = false;
		}
	}

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatCurrency(amount) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}

	// Load wallets when component mounts
	$effect(() => {
		loadWallets();
	});
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-white">Wallets</h1>
			<p class="text-gray-400 text-sm mt-2">Manage all customer wallets</p>
		</div>
		<button
			onclick={() => goto('/wallets/create')}
			class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
		>
			<i class="fas fa-plus"></i>
			Create Wallet
		</button>
	</div>

	{#if loading}
		<!-- Loading state -->
		<div class="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
			<i class="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4 block"></i>
			<p class="text-gray-300">Loading wallets...</p>
		</div>
	{:else if error}
		<!-- Error state -->
		<div class="bg-red-900 border border-red-700 rounded-lg p-6 text-red-200">
			<i class="fas fa-exclamation-circle mr-3"></i>
			<span>{error}</span>
		</div>
	{:else if wallets.length === 0}
		<!-- Empty state -->
		<div class="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
			<i class="fas fa-wallet text-4xl text-gray-500 mb-4 block"></i>
			<p class="text-gray-300">
				No wallets found.
				<button onclick={() => goto('/wallets/create')} class="text-blue-400 hover:underline">Create one</button>
			</p>
		</div>
	{:else}
		<!-- Wallets Table -->
		<div class="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-700 border-b border-gray-600">
						<tr>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">Wallet ID</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">User Name</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">User Email</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">User Level</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">Balance</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">Status</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">Created</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-gray-200">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-700">
						{#each wallets as wallet (wallet.id)}
							<tr class="hover:bg-gray-750 transition-colors duration-150">
								<td class="px-6 py-4 text-sm text-white font-medium">{wallet.id}</td>
								<td class="px-6 py-4 text-sm text-gray-300">{wallet.user?.name || wallet.user_name || 'N/A'}</td>
								<td class="px-6 py-4 text-sm text-gray-300">{wallet.user?.email || wallet.user_email || 'N/A'}</td>
								<td class="px-6 py-4 text-sm">
									<span class="px-3 py-1 rounded-full text-xs font-medium {wallet.user?.level === 'premium'
										? 'bg-purple-900 text-purple-200'
										: wallet.user?.level === 'gold'
											? 'bg-yellow-900 text-yellow-200'
											: 'bg-gray-900 text-gray-200'}">
										{wallet.user?.level || wallet.user_level || 'standard'}
									</span>
								</td>
								<td class="px-6 py-4 text-sm font-semibold text-green-400">{formatCurrency(wallet.balance || 0)}</td>
								<td class="px-6 py-4 text-sm">
									<span class="px-3 py-1 rounded-full text-xs font-medium {wallet.status?.toLowerCase() === 'active'
										? 'bg-green-900 text-green-200'
										: 'bg-yellow-900 text-yellow-200'}">
										{wallet.status ? wallet.status.charAt(0).toUpperCase() + wallet.status.slice(1) : 'Unknown'}
									</span>
								</td>
								<td class="px-6 py-4 text-sm text-gray-400">{formatDate(wallet.created_at)}</td>
								<td class="px-6 py-4 text-sm">
									<div class="flex gap-2">
										<button
											onclick={() => goto(`/wallets/${wallet.id}`)}
											class="text-green-400 hover:text-green-300 transition-colors"
											title="View details"
										>
											<i class="fas fa-eye"></i>
										</button>
										<button
											onclick={() => openTransactionModal(wallet.id)}
											class="text-yellow-400 hover:text-yellow-300 transition-colors"
											title="Add transaction"
										>
											<i class="fas fa-exchange-alt"></i>
										</button>
										<button
											onclick={() => goto(`/wallets/${wallet.id}/edit`)}
											class="text-blue-400 hover:text-blue-300 transition-colors"
											title="Edit wallet"
										>
											<i class="fas fa-edit"></i>
										</button>
										<button
											onclick={() => handleDelete(wallet.id)}
											class="text-red-400 hover:text-red-300 transition-colors"
											title="Delete wallet"
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

<!-- Transaction Modal -->
{#if showTransactionModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-gray-800 rounded-lg p-8 border border-gray-700 max-w-md w-full mx-4">
			<h2 class="text-2xl font-bold text-white mb-6">Add Transaction</h2>

			<div class="space-y-4">
				<!-- Transaction Type -->
				<div>
					<label for="transaction_type" class="block text-gray-300 text-sm font-medium mb-2">
						Transaction Type
					</label>
					<select
						id="transaction_type"
						bind:value={transactionForm.transaction_type}
						class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
					>
						<option value="credit">Credit</option>
						<option value="debit">Debit</option>
					</select>
				</div>

				<!-- Amount -->
				<div>
					<label for="amount" class="block text-gray-300 text-sm font-medium mb-2">Amount</label>
					<input
						id="amount"
						type="number"
						bind:value={transactionForm.amount}
						step="0.01"
						placeholder="0.00"
						class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
						required
					/>
				</div>

				<!-- Description -->
				<div>
					<label for="description" class="block text-gray-300 text-sm font-medium mb-2">
						Description (Optional)
					</label>
					<textarea
						id="description"
						bind:value={transactionForm.description}
						placeholder="Enter transaction description..."
						rows="3"
						class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
					></textarea>
				</div>
			</div>

			<!-- Modal Actions -->
			<div class="flex gap-3 mt-8">
				<button
					onclick={handleTransaction}
					disabled={transactionLoading}
					class="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors {transactionLoading && 'opacity-50 cursor-not-allowed'}"
				>
					{#if transactionLoading}
						<i class="fas fa-spinner fa-spin mr-2"></i>
						Processing...
					{:else}
						<i class="fas fa-check mr-2"></i>
						Confirm
					{/if}
				</button>
				<button
					onclick={closeTransactionModal}
					disabled={transactionLoading}
					class="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors {transactionLoading && 'opacity-50 cursor-not-allowed'}"
				>
					<i class="fas fa-times mr-2"></i>
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	:global(.hover\:bg-gray-750:hover) {
		background-color: rgba(55, 65, 81, 0.5);
	}
</style>
