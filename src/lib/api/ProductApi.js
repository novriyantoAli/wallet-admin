export const getProducts = async (token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/products`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}

export const getProductById = async (id, token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/products/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}

export const createProduct = async (productData, token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData)
    })
}

export const updateProduct = async (id, productData, token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/products/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData)
    })
}

export const deleteProduct = async (id, token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/products/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}

export const updateProductStatus = async (id, status, token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/products/${id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status })
    })
}


// product wifi api
export const getProductWifiByProductId = async (productId, token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/products/wifi/product/${productId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}

export const updateProductWifi = async (productId, wifiData, token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/products/wifi/${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(wifiData)
    })
}
