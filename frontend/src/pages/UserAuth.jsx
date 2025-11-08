import { useState, useEffect } from "react"
import { UserPlus, LogIn } from "lucide-react"

const API = "http://localhost:4000/api"

export function UserAuth({ setUser }) {
    const [mode, setMode] = useState("login") // 'login' | 'signup'
    const [users, setUsers] = useState([])
    const [form, setForm] = useState({
        name: "",
        email: "",
        avatar_url: "",
        is_main_user: false,
    })

    // 🔄 Load all users from MongoDB
    useEffect(() => {
        fetch(`${API}/users`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success && Array.isArray(data.users)) {
                    setUsers(data.users)
                } else {
                    console.error("⚠️ Unexpected response format:", data)
                    setUsers([])
                }
            })
            .catch((err) => console.error("❌ Failed to load users:", err))
    }, [])


    const updateForm = (key, val) => setForm((prev) => ({ ...prev, [key]: val }))

    // ✅ SIGN UP (POST /api/users)
    const handleSignup = async (e) => {
        e.preventDefault()

        const payload = {
            name: form.name.trim(),
            email: form.email.trim(),
            is_main_user: form.is_main_user,
            avatar_url:
                form.avatar_url.trim() ||
                `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(
                    form.name || "Guest"
                )}`,
        }

        try {
            const res = await fetch(`${API}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            const data = await res.json()
            if (data.success) {
                const newUser = {
                    ...data.user,
                    is_logged_in: true,
                }
                localStorage.setItem("loggedinUser", JSON.stringify(newUser))
                setUser(newUser)
                alert(`✅ Welcome, ${newUser.name}!`)
            } else {
                alert("❌ " + (data.error || "Signup failed"))
            }
        } catch (err) {
            console.error("❌ Signup failed:", err)
        }
    }

    // ✅ LOGIN (PUT /api/users/status/:id)
    const handleLogin = async (e) => {
        e.preventDefault()
        const found = users.find(
            (u) => u.email.toLowerCase() === form.email.toLowerCase()
        )
        if (!found) {
            alert("❌ User not found. Please sign up first.")
            return
        }

        try {
            const res = await fetch(`${API}/users/${found._id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_logged_in: true }),
            })
            const data = await res.json()
            if (data.success) {
                const updatedUser = { ...found, is_logged_in: true }
                localStorage.setItem("loggedinUser", JSON.stringify(updatedUser))
                setUser(updatedUser)
                alert(`👋 Welcome back, ${updatedUser.name}!`)
            } else {
                alert("❌ " + (data.error || "Login failed"))
            }
        } catch (err) {
            console.error("❌ Login failed:", err)
        }

    }

    return (
        <div className="user-auth">
            {mode === "login" ? (
                <form className="user-form-login" onSubmit={handleLogin}>
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
