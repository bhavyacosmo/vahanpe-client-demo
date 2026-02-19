import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem('vahanpe_user');
        const storedToken = localStorage.getItem('vahanpe_token');

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Validate if we have a token either in user object or separate storage
                if (parsedUser.token || storedToken) {
                    // Ensure token is attached to user if found separately
                    if (!parsedUser.token && storedToken) {
                        parsedUser.token = storedToken;
                    }
                    setUser(parsedUser);
                } else {
                    // Stale session (Pre-fix) - valid user but no token
                    console.warn("Found stale session without token. Logging out.");
                    localStorage.removeItem('vahanpe_user');
                    setUser(null);
                }
            } catch (e) {
                console.error("Failed to parse user session", e);
                localStorage.removeItem('vahanpe_user');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        // userType: 'consumer' | 'admin'
        // id: unique id
        // name: user name
        // phone: (for consumer)
        const userWithId = {
            ...userData,
            id: userData.id || `VH-${Math.floor(Math.random() * 10000)}`, // Fallback ID generation
            phone: userData.phone || userData.customerPhone, // Ensure phone is captured
            token: token // Attach token to user object for easy access
        };
        setUser(userWithId);
        localStorage.setItem('vahanpe_user', JSON.stringify(userWithId));
        if (token) {
            localStorage.setItem('vahanpe_token', token);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('vahanpe_user');
        localStorage.removeItem('vahanpe_token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
