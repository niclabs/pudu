import React, { useState } from 'react';
import { useCsrfFetch } from './hooks/useCsrfFetch';

function LoginForm() {
    const csrfFetch = useCsrfFetch();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await csrfFetch('/api/auth/login/', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            console.log('Login successful');
        } else {
            console.error('Login failed');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit">Login</button>
        </form>
    );
}

export default LoginForm;
