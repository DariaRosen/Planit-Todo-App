import {
    FaUtensils,
    FaTrashAlt,
    FaBroom,
    FaPen,
    FaWater,
    FaCouch,
} from "react-icons/fa" // ← using fa (not fa6)
import { FaKitchenSet } from "react-icons/fa6" // only this one is fa6
import {
    MdOutlineLocalLaundryService,
    MdOutlineTableBar,
    MdOutlineCleanHands,
} from "react-icons/md"
import { IoRestaurantSharp } from "react-icons/io5"

export function TaskIcon({ title, size = 22, className = "" }) {
    if (!title) return null

    const icons = [
        { key: "dishes", icon: <FaUtensils color="#2d7c40ff" size={size} /> },
        { key: "cook", icon: <IoRestaurantSharp color="#f97316" size={size} /> },
        { key: "laundry", icon: <MdOutlineLocalLaundryService color="#3b82f6" size={size} /> },
        { key: "washing machine", icon: <MdOutlineCleanHands color="#60a5fa" size={size} /> },
        { key: "trash", icon: <FaTrashAlt color="#ef4444" size={size} /> },
        { key: "clean", icon: <FaBroom color="#10b981" size={size} /> },
        { key: "living room", icon: <FaCouch color="#8b5cf6" size={size} /> },
        { key: "kitchen", icon: <FaKitchenSet color="#f59e0b" size={size} /> },
        { key: "dining", icon: <MdOutlineTableBar color="#f472b6" size={size} /> },
        { key: "water", icon: <FaWater color="#3b82f6" size={size} /> },
    ]

    const found = icons.find((i) =>
        title.toLowerCase().includes(i.key)
    )

    const icon = found
        ? found.icon
        : <FaPen color="#94a3b8" size={size} /> // default gray pencil

    return <span className={`task-icon ${className}`}>{icon}</span>
}
