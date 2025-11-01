import { useState } from "react"
import { Edit, LogOut } from "lucide-react"

const API = "http://localhost/Planit-Todo-App/backend/api"

export function UserPanel({ user, setUser }) {
    const [form, setForm] = useState({
        name: "",
        avatar_url: "",
    })

    const updateForm = (key, val) => setForm((prev) => ({ ...prev, [key]: val }))

    const handleUpdate = async (e) => {
        e.preventDefault()
        const updated = {
            ...user,
            name: form.name.trim() || user.name,
            avatar_url: form.avatar_url.trim() || user.avatar_url,
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
                setUser(updated)
                alert("✅ Profile updated successfully.")
            } else {
                alert("❌ Update failed.")
            }
        } catch (err) {
            console.error("Update failed:", err)
        }
    }

    const handleLogout = async () => {
        try {
            await fetch(`${API}/updateUserStatus.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.id, is_logged_in: 0 }),
            })
        } catch (err) {
            console.error("Logout failed:", err)
        }
        localStorage.removeItem("loggedinUser")
        setUser(null)
    }

    return (
        <aside className="user-panel">
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
        </aside>
    )
}
