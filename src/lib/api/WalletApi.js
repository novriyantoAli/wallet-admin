export const getWallets = async (token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/wallets`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}

export const getWalletById = async (id, token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/wallets/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}

export const createWallet = async (walletData, token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/wallets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(walletData)
    })
}

export const updateWallet = async (id, walletData, token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/wallets/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(walletData)
    })
}

export const deleteWallet = async (id, token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/wallets/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}
