import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

const API = "http://localhost/Planit-Todo-App/backend/api";

export function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem("loggedinUser");
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const getAvatar = (name, avatar_url) => {
        return (
            avatar_url ||
            "https://res.cloudinary.com/dool6mmp1/image/upload/v1757595867/Capture_igxch6.jpg"
        );
    };

    // ✅ Update backend and frontend when user logs out
    const handleLogout = async () => {
        if (!user) return;

        try {
            console.log("🔄 Logging out user:", user.email);
            const res = await fetch(`${API}/updateUserStatus.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.id, is_logged_in: 0 }),
            });

            const text = await res.text();
            console.log("🧾 Logout response text:", text);

            const data = JSON.parse(text);
            console.log("✅ Parsed logout response:", data);

            if (data.success) {
                console.log("✅ User logged out in DB successfully!");
            } else {
                console.warn("⚠️ Logout API returned error:", data);
            }
        } catch (err) {
            console.error("💥 Logout failed:", err);
        }

        // Clean up local state no matter what
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
