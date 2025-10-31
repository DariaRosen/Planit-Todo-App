import { useEffect, useState } from "react"
import { UserPlus, LogIn, LogOut } from "lucide-react"

const API = "http://localhost/Planit-Todo-App/backend/api"

export function UserPanel() {
    const [users, setUsers] = useState([])
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        is_main_user: 0,
        avatar_url: "",
    })

    // 🟢 Load users on mount
    useEffect(() => {
        fetch(`${API}/getUsers.php`)
            .then((res) => res.json())
            .then(setUsers)
            .catch(console.error)
    }, [])

    // 🧩 Add new user
    const handleAddUser = (e) => {
        e.preventDefault()
        if (!newUser.name.trim()) return alert("Please enter a name")

        fetch(`${API}/addUser.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...newUser,
                is_main_user: newUser.is_main_user ? 1 : 0,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setUsers((prev) => [
                        { id: data.user_id, ...newUser, created_at: new Date().toISOString(), is_logged_in: 0 },
                        ...prev,
                    ])
                    setNewUser({ name: "", email: "", avatar_url: "", is_main_user: 0 })
                }
            })
            .catch(console.error)
    }

    // 🔁 Toggle login status
    const toggleLogin = (userId, currentState) => {
        const newState = currentState ? 0 : 1

        fetch(`${API}/updateUserStatus.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, is_logged_in: newState }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setUsers((prev) =>
                        prev.map((u) =>
                            u.id === userId ? { ...u, is_logged_in: newState } : u
                        )
                    )
                }
            })
            .catch(console.error)
    }

    return (
        <aside className="user-panel bg-white shadow rounded-2xl p-6 w-full max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                👤 Users
            </h2>

            {/* ➕ Add new user form */}
            <form onSubmit={handleAddUser} className="space-y-3 mb-6">
                <input
                    type="text"
                    placeholder="Full name"
                    value={newUser.name}
                    onChange={(e) =>
                        setNewUser((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full border rounded-lg px-3 py-2"
                />
                <input
                    type="email"
                    placeholder="Email (optional)"
                    value={newUser.email}
                    onChange={(e) =>
                        setNewUser((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full border rounded-lg px-3 py-2"
                />
                <input
                    type="url"
                    placeholder="Avatar URL (optional)"
                    value={newUser.avatar_url}
                    onChange={(e) =>
                        setNewUser((prev) => ({ ...prev, avatar_url: e.target.value }))
                    }
                    className="w-full border rounded-lg px-3 py-2"
                />
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={newUser.is_main_user}
                        onChange={(e) =>
                            setNewUser((prev) => ({
                                ...prev,
                                is_main_user: e.target.checked,
                            }))
                        }
                    />
                    Main user
                </label>
                <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                >
                    <UserPlus size={18} /> Add User
                </button>
            </form>

            {/* 👥 User list */}
            <div className="user-list space-y-3">
                {users.length === 0 && (
                    <p className="text-gray-500 text-sm">No users yet</p>
                )}

                {users.map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center justify-between border rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <img
                                src={
                                    user.avatar_url ||
                                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                                }
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-gray-500">
                                    {user.is_main_user ? "Main User" : "Sub User"} ·{" "}
                                    {user.is_logged_in ? (
                                        <span className="text-green-600 font-semibold">
                                            Logged in
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">Logged out</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => toggleLogin(user.id, user.is_logged_in)}
                            className={`px-3 py-1 rounded-md text-white flex items-center gap-1 transition ${user.is_logged_in
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-blue-500 hover:bg-blue-600"
                                }`}
                        >
                            {user.is_logged_in ? (
                                <>
                                    <LogOut size={16} /> Logout
                                </>
                            ) : (
                                <>
                                    <LogIn size={16} /> Login
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>
        </aside>
    )
}
