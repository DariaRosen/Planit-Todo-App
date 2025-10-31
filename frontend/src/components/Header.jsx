import { NavLink } from "react-router-dom"
import { useState } from "react"

export function Header() {
    const [menuOpen, setMenuOpen] = useState(false)

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

                <button
                    className="menu-toggle"
                    onClick={() => setMenuOpen((prev) => !prev)}
                >
                    ☰
                </button>
            </div>
        </header>
    )
}
