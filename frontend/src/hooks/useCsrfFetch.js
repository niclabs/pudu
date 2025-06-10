import { useState, useEffect } from 'react';

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export function useCsrfFetch() {
    const [csrfToken, setCsrfToken] = useState('');

    useEffect(() => {
        const token = getCookie('csrftoken');
        setCsrfToken(token);
    }, []);

    const csrfFetch = async (url, options = {}) => {
        const method = options.method ? options.method.toUpperCase() : 'GET';

        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };

        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            headers['X-CSRFToken'] = csrfToken;
        }

        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
        });

        return response;
    };

    return csrfFetch;
}