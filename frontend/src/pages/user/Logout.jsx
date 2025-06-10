import { useCsrfFetch } from './hooks/useCsrfFetch';

function LogoutButton() {
    const csrfFetch = useCsrfFetch();

    const handleLogout = async () => {
        const response = await csrfFetch('/api/auth/logout/', { method: 'POST' });
        if (response.ok) {
            console.log('Logged out');
        } else {
            console.error('Logout failed');
        }
    };

    return <button onClick={handleLogout}>Logout</button>;
}

export default LogoutButton;