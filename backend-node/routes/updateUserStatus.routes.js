import express from "express"
import { User } from "../models/User.js"

const router = express.Router()

// ✅ PATCH /api/users/:id/status
router.patch("/:id/status", async (req, res) => {
    try {
        const { id } = req.params
        const { is_logged_in } = req.body

        if (typeof is_logged_in !== "boolean") {
            return res.status(400).json({
                success: false,
                error: "Missing or invalid 'is_logged_in' value",
            })
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { is_logged_in },
            { new: true }
        )

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            })
        }

        res.json({
            success: true,
            message: "User login status updated",
            user: updatedUser,
        })
    } catch (err) {
        console.error("❌ Error updating user status:", err)
        res.status(500).json({ success: false, error: err.message })
    }
})

export default router
