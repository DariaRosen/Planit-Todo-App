import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

export function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);

    // ✅ Load the logged-in user from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("loggedinUser");
        if (stored) setUser(JSON.parse(stored));
    }, []);

    // ✅ Generate a fallback avatar if none exists
    const getAvatar = (name, avatar_url) => {
        return (
            avatar_url ||
            `https://res.cloudinary.com/dool6mmp1/image/upload/v1757595867/Capture_igxch6.jpg`
        );
    };

    // ✅ Handle logout
    const handleLogout = () => {
        localStorage.removeItem("loggedinUser");
        setUser(null);
    };

    return (
        <header className="app-header">
            <div className="header-container">
                <h1 className="logo">🪐 Planit</h1>

                <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
                    <NavLink to="/" className="nav-item">
                        Home
                    </NavLink>
                    <NavLink to="/tasks" className="nav-item">
                        Tasks
                    </NavLink>
                    <NavLink to="/user" className="nav-item">
                        User Panel
                    </NavLink>
                </nav>

                <div className="user-section">
                    {user ? (
                        <div className="user-info">
                            <img
                                src={getAvatar(user.name, user.avatar_url)}
                                alt={user.name}
                                className="avatar"
                            />
                            <span className="greeting">Hello, {user.name} 👋</span>
                            <button className="logout-btn" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <NavLink to="/user" className="login-btn">
                            Login / Sign Up
                        </NavLink>
                    )}
                </div>

                <button
                    className="menu-toggle"
                    onClick={() => setMenuOpen((prev) => !prev)}
                >
                    ☰
                </button>
            </div>
        </header>
    );
}
