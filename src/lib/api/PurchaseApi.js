export const getPurchases = async (token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/purchases/details`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}

export const getPurchaseById = async (id, token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/purchases/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}

export const createPurchase = async (purchaseData, token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/purchases`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(purchaseData)
    })
}

export const updatePurchase = async (id, purchaseData, token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/purchases/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(purchaseData)
    })
}

export const deletePurchase = async (id, token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/purchases/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}

export const updatePurchaseStatus = async (id, status, token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/purchases/${id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status })
    })
}
