export const getUsers = async (token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/users`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}

export const getUserById = async (id, token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/users/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}

export const createUser = async (userData, token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData)
    })
}

export const updateUser = async (id, userData, token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/users/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData)
    })
}

export const deleteUser = async (id, token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/users/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}

export const updateUserStatus = async (id, status, token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/users/${id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status })
    })
}
