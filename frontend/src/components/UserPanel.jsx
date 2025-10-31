import { useEffect, useState } from "react"
import { UserPlus, LogIn, LogOut } from "lucide-react"

const API = "http://localhost/Planit-Todo-App/backend/api"

export function UserPanel() {
    const [users, setUsers] = useState([])
    const [loggedInUser, setLoggedInUser] = useState(null)
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        is_main_user: false,
        avatar_url: "",
    })

    useEffect(() => {
        const stored = localStorage.getItem("loggedinUser")
        if (stored) setLoggedInUser(JSON.parse(stored))
    }, [])

    useEffect(() => {
        fetch(`${API}/getUsers.php`)
            .then((res) => res.json())
            .then(setUsers)
            .catch(console.error)
    }, [])

    const handleAddUser = async (e) => {
        e.preventDefault()

        const payload = {
            name: newUser.name.trim(),
            email: newUser.email.trim(),
            is_main_user: newUser.is_main_user ? 1 : 0,
            avatar_url: newUser.avatar_url.trim(),
        }

        try {
            const res = await fetch(`${API}/addUser.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            const text = await res.text()
            const data = JSON.parse(text)

            if (data.success) {
                const loggedUser = {
                    id: data.user_id,
                    name: newUser.name,
                    email: newUser.email,
                    is_main_user: newUser.is_main_user,
                    avatar_url:
                        newUser.avatar_url ||
                        `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(
                            newUser.name || "Guest"
                        )}`,
                    is_logged_in: 1,
                }

                localStorage.setItem("loggedinUser", JSON.stringify(loggedUser))
                setLoggedInUser(loggedUser)
                alert(`✅ Welcome, ${loggedUser.name}!`)
                setNewUser({ name: "", email: "", is_main_user: false, avatar_url: "" })
            } else {
                alert("❌ " + (data.error || "Failed to add user"))
            }
        } catch (err) {
            console.error("Add user failed:", err)
            alert("❌ Failed to add user. Check console for details.")
        }
    }

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

                    if (newState === 0) {
                        localStorage.removeItem("loggedinUser")
                        setLoggedInUser(null)
                    }
                }
            })
            .catch(console.error)
    }

    return (
        <aside className="user-panel">
            {!loggedInUser && (
                <>
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
                            onChange={(e) =>
                                setNewUser({ ...newUser, email: e.target.value })
                            }
                        />
                        <input
                            type="url"
                            placeholder="Avatar URL (optional)"
                            value={newUser.avatar_url}
                            onChange={(e) =>
                                setNewUser({ ...newUser, avatar_url: e.target.value })
                            }
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
                </>
            )}

            <div className="user-list">
                {users.length === 0 && <p className="no-users">No users yet</p>}

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
                            className={`login-btn ${user.is_logged_in ? "logout" : "login"
                                }`}
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
