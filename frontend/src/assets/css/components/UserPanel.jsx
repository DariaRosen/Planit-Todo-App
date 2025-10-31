import { useEffect, useState } from "react"
import { UserPlus, LogIn, LogOut } from "lucide-react"
import "./UserPanel.scss"

const API = "http://localhost/Planit-Todo-App/backend/api"

export function UserPanel() {
    const [users, setUsers] = useState([])
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        is_main_user: false,
        avatar_url: "",
    })

    // Load users
    useEffect(() => {
        fetch(`${API}/getUsers.php`)
            .then((res) => res.json())
            .then(setUsers)
            .catch(console.error)
    }, [])

    // Add new user
    const handleAddUser = (e) => {
        e.preventDefault()
        if (!newUser.name.trim()) {
            alert("Please enter a name.")
            return
        }

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
                        {
                            id: data.user_id,
                            ...newUser,
                            created_at: new Date().toISOString(),
                            is_logged_in: 0,
                        },
                        ...prev,
                    ])
                    setNewUser({ name: "", email: "", avatar_url: "", is_main_user: false })
                }
            })
            .catch(console.error)
    }

    // Toggle login/logout
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
        <aside className="user-panel">
            <h2 className="panel-title">👤 Users</h2>

            <form className="add-user-form" onSubmit={handleAddUser}>
                <input
                    type="text"
                    placeholder="Full name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Email (optional)"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <input
                    type="url"
                    placeholder="Avatar URL (optional)"
                    value={newUser.avatar_url}
                    onChange={(e) => setNewUser({ ...newUser, avatar_url: e.target.value })}
                />

                <label className="checkbox">
                    <input
                        type="checkbox"
                        checked={newUser.is_main_user}
                        onChange={(e) =>
                            setNewUser({ ...newUser, is_main_user: e.target.checked })
                        }
                    />
                    Main user
                </label>

                <button type="submit" className="add-btn">
                    <UserPlus size={18} />
                    <span>Add User</span>
                </button>
            </form>

            <div className="user-list">
                {users.length === 0 && (
                    <p className="no-users">No users yet</p>
                )}

                {users.map((user) => (
                    <div key={user.id} className="user-card">
                        <div className="user-info">
                            <img
                                src={
                                    user.avatar_url ||
                                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                                }
                                alt={user.name}
                                className="avatar"
                            />
                            <div className="details">
                                <p className="name">{user.name}</p>
                                <p className="meta">
                                    {user.is_main_user ? "Main User" : "Sub User"} ·{" "}
                                    {user.is_logged_in ? (
                                        <span className="status logged-in">Logged in</span>
                                    ) : (
                                        <span className="status logged-out">Logged out</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <button
                            className={`login-btn ${user.is_logged_in ? "logout" : "login"}`}
                            onClick={() => toggleLogin(user.id, user.is_logged_in)}
                        >
                            {user.is_logged_in ? (
                                <>
                                    <LogOut size={16} />
                                    Logout
                                </>
                            ) : (
                                <>
                                    <LogIn size={16} />
                                    Login
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>
        </aside>
    )
}
