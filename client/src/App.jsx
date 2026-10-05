import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import AuthScreen from './components/AuthScreen';

export default function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('sync_board_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const handleLoginSuccess = (userData) => {
        localStorage.setItem('sync_board_user', JSON.stringify(userData));
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('sync_board_user');
        setUser(null);
    };

    if (!user) {
        return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
    }

    return <Dashboard user={user} onLogout={handleLogout} />;
}