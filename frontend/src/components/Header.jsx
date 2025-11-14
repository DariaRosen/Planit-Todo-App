import { NavLink } from "react-router-dom";
import { useState } from "react";

export function Header({ user, onLogout }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const getAvatar = (name, avatar_url) =>
        avatar_url ||
        "https://res.cloudinary.com/dool6mmp1/image/upload/v1757595867/Capture_igxch6.jpg";

    return (
        <header className="app-header">
            <div className="header-container">
                {/* Top row: Logo on left, User on right (on small screens) */}
                <div className="header-top">
                    <h1 className="logo"><img src="/256px-Planet.svg.png" alt="Planit" /> Planit</h1>

                    <div className="user-section user-section-mobile">
                        {user ? (
                            <div className="user-info">
                                <img
                                    src={getAvatar(user.name, user.avatar_url)}
                                    alt={user.name}
                                    className="avatar"
                                />
                                <span className="greeting">Hello, {user.name}</span>
                                <button className="logout-btn" onClick={onLogout}>
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <NavLink to="/user" className="login-btn">
                                Login / Sign Up
                            </NavLink>
                        )}
                    </div>
                </div>

                {/* Navigation links - below on small screens, center on large screens */}
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

                {/* User section for large screens - right side */}
                <div className="user-section user-section-desktop">
                    {user ? (
                        <div className="user-info">
                            <img
                                src={getAvatar(user.name, user.avatar_url)}
                                alt={user.name}
                                className="avatar"
                            />
                            <span className="greeting">Hello, {user.name}</span>
                            <button className="logout-btn" onClick={onLogout}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <NavLink to="/user" className="login-btn">
                            Login / Sign Up
                        </NavLink>
                    )}
                </div>
            </div>
        </header>
    );
}
