import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

const API = "http://localhost/Planit-Todo-App/backend/api";

export function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);

    // ✅ Auto login for Daria when app loads
    useEffect(() => {
        async function autoLoginUser() {
            try {
                console.log("🔍 Checking for Daria user...");
                const res = await fetch(`${API}/getUserByEmail.php?email=daria.sk135@gmail.com`);
                const data = await res.json();

                if (data.success && data.user) {
                    const dbUser = data.user;
                    console.log("📡 Found user in DB:", dbUser);

                    // If Daria is logged out, log her in automatically
                    if (dbUser.is_logged_in === 0) {
                        console.log("🔄 User is logged out — updating to logged in...");
                        const loginRes = await fetch(`${API}/updateUserStatus.php`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ user_id: dbUser.id, is_logged_in: 1 }),
                        });

                        const loginText = await loginRes.text();
                        console.log("🧾 Login response text:", loginText);

                        const loginData = JSON.parse(loginText);
                        if (loginData.success) {
                            console.log("✅ Daria auto-logged in successfully!");
                            dbUser.is_logged_in = 1;
                        } else {
                            console.warn("⚠️ Auto login API returned error:", loginData);
                        }
                    }

                    // Save user locally for header display
                    localStorage.setItem("loggedinUser", JSON.stringify(dbUser));
                    setUser(dbUser);
                } else {
                    console.warn("⚠️ Hardcoded user not found in DB.");
                }
            } catch (err) {
                console.error("💥 Auto login failed:", err);
            }
        }

        autoLoginUser();
    }, []);

    const getAvatar = (name, avatar_url) => {
        return (
            avatar_url ||
            "https://res.cloudinary.com/dool6mmp1/image/upload/v1757595867/Capture_igxch6.jpg"
        );
    };

    // ✅ Logout logic (DB + local cleanup)
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

        // Clean up local state regardless
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

                    {/* ✅ Show User Panel only if logged in */}
                    {user && (
                        <NavLink to="/user" className="nav-item">
                            User Panel
                        </NavLink>
                    )}
                </nav>

                <div className="user-section">
                    {user ? (
                        <div className="user-info">
                            <img
                                src={getAvatar(user.name, user.avatar_url)}
                                alt={user.name}
                                className="avatar"
                            />
                            <span className="greeting">
                                Hello, {user.name} 👋
                            </span>
                            <button
                                className="logout-btn"
                                onClick={handleLogout}
                            >
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
