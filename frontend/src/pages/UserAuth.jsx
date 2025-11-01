import { useState, useEffect } from "react"
import { UserPlus, LogIn } from "lucide-react"

const API = "http://localhost/Planit-Todo-App/backend/api"

export function UserAuth({ setUser }) {
    const [mode, setMode] = useState("login") // 'login' | 'signup'
    const [users, setUsers] = useState([])
    const [form, setForm] = useState({
        name: "",
        email: "",
        avatar_url: "",
        is_main_user: false,
    })

    useEffect(() => {
        fetch(`${API}/getUsers.php`)
            .then((res) => res.json())
            .then(setUsers)
            .catch(console.error)
    }, [])

    const updateForm = (key, val) => setForm((prev) => ({ ...prev, [key]: val }))

    // ✅ Signup
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
                setUser(newUser)
                alert(`✅ Welcome, ${newUser.name}!`)
            } else {
                alert("❌ " + (data.error || "Failed to add user"))
            }
        } catch (err) {
            console.error("Add user failed:", err)
        }
    }

    // ✅ Login
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
                setUser(found)
            } else alert("❌ Failed to login.")
        } catch (err) {
            console.error("Login failed:", err)
        }
    }

    return (
        <div className="user-auth">
            {mode === "login" ? (
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
                        <LogIn size={18} /> Login
                    </button>
                    <p className="switch">
                        New here?{" "}
                        <button type="button" onClick={() => setMode("signup")}>
                            Sign Up
                        </button>
                    </p>
                </form>
            ) : (
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
            )}
        </div>
    )
}
