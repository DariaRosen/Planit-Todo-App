import { useEffect, useState } from "react"
import { UserPlus, LogIn, LogOut, Edit } from "lucide-react"

const API = "http://localhost/Planit-Todo-App/backend/api"

export function UserPanel() {
    const [users, setUsers] = useState([])
    const [loggedInUser, setLoggedInUser] = useState(null)
    const [mode, setMode] = useState("login") // 'login' | 'signup' | 'edit'
    const [form, setForm] = useState({
        name: "",
        email: "",
        avatar_url: "",
        is_main_user: false,
    })

    // ✅ Load user from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("loggedinUser")
        if (stored) {
            const parsed = JSON.parse(stored)
            setLoggedInUser(parsed)
            setMode("edit")
        }
    }, [])

    // ✅ Fetch all users
    useEffect(() => {
        fetch(`${API}/getUsers.php`)
            .then((res) => res.json())
            .then(setUsers)
            .catch(console.error)
    }, [])

    // 🧩 Shared change handler
    const updateForm = (key, val) => setForm((prev) => ({ ...prev, [key]: val }))

    // ✅ Add new user (Sign Up)
    const handleSignup = async (e) => {
        e.preventDefault()
        const payload = {
            name: form.name.trim(),
            email: form.email.trim(),
            is_main_user: form.is_main_user ? 1 : 0,
            avatar_url:
                form.avatar_url.trim() ||
                `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(
                    form.name || "Guest"
                )}`,
        }

        try {
            const res = await fetch(`${API}/addUser.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (data.success) {
                const newUser = { ...payload, id: data.user_id, is_logged_in: 1 }
                localStorage.setItem("loggedinUser", JSON.stringify(newUser))
                setLoggedInUser(newUser)
                setUsers((prev) => [...prev, newUser])
                alert(`✅ Welcome, ${newUser.name}!`)
                setMode("edit")
            } else alert("❌ " + (data.error || "Failed to add user"))
        } catch (err) {
            console.error("Add user failed:", err)
            alert("❌ Failed to sign up.")
        }
    }

    // ✅ Log in existing user
    const handleLogin = async (e) => {
        e.preventDefault()
        const found = users.find(
            (u) => u.email.toLowerCase() === form.email.toLowerCase()
        )
        if (!found) {
            alert("❌ User not found, please sign up first.")
            return
        }

        try {
            const res = await fetch(`${API}/updateUserStatus.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: found.id, is_logged_in: 1 }),
            })
            const data = await res.json()
            if (data.success) {
                found.is_logged_in = 1
                localStorage.setItem("loggedinUser", JSON.stringify(found))
                setLoggedInUser(found)
                setMode("edit")
            } else alert("❌ Failed to login.")
        } catch (err) {
            console.error("Login failed:", err)
        }
    }

    // ✅ Update user details (Edit)
    const handleUpdate = async (e) => {
        e.preventDefault()
        if (!loggedInUser) return

        const updated = {
            ...loggedInUser,
            name: form.name.trim() || loggedInUser.name,
            avatar_url: form.avatar_url.trim() || loggedInUser.avatar_url,
        }

        try {
            const res = await fetch(`${API}/updateUserDetails.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
            })
            const data = await res.json()
            if (data.success) {
                localStorage.setItem("loggedinUser", JSON.stringify(updated))
                setLoggedInUser(updated)
                alert("✅ Profile updated successfully.")
            } else {
                alert("❌ Update failed.")
            }
        } catch (err) {
            console.error("Update failed:", err)
        }
    }

    // ✅ Logout
    const handleLogout = async () => {
        if (!loggedInUser) return
        try {
            await fetch(`${API}/updateUserStatus.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: loggedInUser.id, is_logged_in: 0 }),
            })
            localStorage.removeItem("loggedinUser")
            setLoggedInUser(null)
            setMode("login")
        } catch (err) {
            console.error("Logout failed:", err)
        }
    }

    // ✅ Form UI depending on mode
    const renderForm = () => {
        switch (mode) {
            case "login":
                return (
                    <form className="user-form" onSubmit={handleLogin}>
                        <h2>🔐 Login</h2>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={(e) => updateForm("email", e.target.value)}
                            required
                        />
                        <button type="submit" className="login-btn">
                            <LogIn size={18} />
                            Login
                        </button>
                        <p className="switch">
                            New here?{" "}
                            <button type="button" onClick={() => setMode("signup")}>
                                Sign Up
                            </button>
                        </p>
                    </form>
                )

            case "signup":
                return (
                    <form className="user-form" onSubmit={handleSignup}>
                        <h2>📝 Sign Up</h2>
                        <input
                            type="text"
                            placeholder="Full name"
                            value={form.name}
                            onChange={(e) => updateForm("name", e.target.value)}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => updateForm("email", e.target.value)}
                            required
                        />
                        <input
                            type="url"
                            placeholder="Avatar URL (optional)"
                            value={form.avatar_url}
                            onChange={(e) => updateForm("avatar_url", e.target.value)}
                        />
                        <label className="checkbox">
                            <input
                                type="checkbox"
                                checked={form.is_main_user}
                                onChange={(e) =>
                                    updateForm("is_main_user", e.target.checked)
                                }
                            />
                            Main user
                        </label>
                        <button type="submit" className="add-btn">
                            <UserPlus size={18} /> Sign Up
                        </button>
                        <p className="switch">
                            Already have an account?{" "}
                            <button type="button" onClick={() => setMode("login")}>
                                Log in
                            </button>
                        </p>
                    </form>
                )

            case "edit":
                return (
                    <form className="user-form" onSubmit={handleUpdate}>
                        <h2>✏️ Edit Profile</h2>
                        <input
                            type="text"
                            placeholder="New name"
                            value={form.name}
                            onChange={(e) => updateForm("name", e.target.value)}
                        />
                        <input
                            type="url"
                            placeholder="New avatar URL"
                            value={form.avatar_url}
                            onChange={(e) => updateForm("avatar_url", e.target.value)}
                        />
                        <button type="submit" className="edit-btn">
                            <Edit size={18} /> Update
                        </button>
                        <button
                            type="button"
                            className="logout-btn"
                            onClick={handleLogout}
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    </form>
                )

            default:
                return null
        }
    }

    return (
        <aside className="user-panel">
            <div className="panel-content">{renderForm()}</div>

            {/* 🧑‍🤝‍🧑 Users list */}
            {users.length > 0 && (
                <div className="user-list">
                    <h3>All Users</h3>
                    {users.map((u) => (
                        <div key={u.id} className="user-card">
                            <div className="user-info">
                                <img
                                    src={
                                        u.avatar_url ||
                                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                                    }
                                    alt={u.name}
                                    className="avatar"
                                />
                                <div className="details">
                                    <p className="name">{u.name}</p>
                                    <p className="meta">
                                        {u.is_main_user ? "Main User" : "Sub User"} ·{" "}
                                        {u.is_logged_in ? (
                                            <span className="status logged-in">
                                                Logged in
                                            </span>
                                        ) : (
                                            <span className="status logged-out">
                                                Logged out
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </aside>
    )
}
