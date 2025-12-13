export const authLogin = async ({email, password}) => {
    return await fetch(`${import.meta.env.VITE_URL_API}/auth/login`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        },
        body: JSON.stringify({email, password}),
    });
}

export const authDetail = async (token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/auth/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}