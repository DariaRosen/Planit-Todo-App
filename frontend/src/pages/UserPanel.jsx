import { useState } from "react"
import { Edit, LogOut } from "lucide-react"
import { buildApiUrl } from "../lib/api-config"

export function UserPanel({ user, setUser }) {
    const apiBaseUrl = buildApiUrl()
    const [form, setForm] = useState({ name: "", avatar_url: "" })
    const [avatarPreview, setAvatarPreview] = useState(null)

    const updateForm = (key, val) => setForm((prev) => ({ ...prev, [key]: val }))

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file")
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("Image size must be less than 5MB")
            return
        }

        // Convert to base64
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64String = reader.result
            setForm((prev) => ({ ...prev, avatar_url: base64String }))
            setAvatarPreview(base64String)
        }
        reader.onerror = () => {
            alert("Failed to read image file")
        }
        reader.readAsDataURL(file)
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        const updated = {
            ...user,
            name: form.name.trim() || user.name,
            avatar_url: form.avatar_url.trim() || user.avatar_url,
        }

        console.log("updated", updated)

        try {
            const res = await fetch(`${apiBaseUrl}/users/${user._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
            })

            const data = await res.json()
            if (data.success) {
                localStorage.setItem("loggedinUser", JSON.stringify(data.user))
                setUser(data.user)

                // ✅ Clear inputs after successful update
                setForm({ name: "", avatar_url: "" })
                setAvatarPreview(null)

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
            await fetch(`${apiBaseUrl}/users/${user._id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_logged_in: false }),
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
                
                <div className="avatar-upload-container">
                    <label htmlFor="avatar-upload" className="avatar-upload-label">
                        {avatarPreview || user?.avatar_url ? (
                            <img 
                                src={avatarPreview || user.avatar_url} 
                                alt="Avatar preview" 
                                className="avatar-preview"
                            />
                        ) : (
                            <div className="avatar-upload-placeholder">
                                <span>📷</span>
                                <span>Upload Avatar</span>
                            </div>
                        )}
                    </label>
                    <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                    />
                    {avatarPreview && (
                        <button
                            type="button"
                            className="avatar-remove-btn"
                            onClick={() => {
                                setAvatarPreview(null)
                                setForm((prev) => ({ ...prev, avatar_url: "" }))
                            }}
                        >
                            Remove
                        </button>
                    )}
                </div>
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
