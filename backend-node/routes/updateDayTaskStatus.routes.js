import express from "express"
import { DayTask } from "../models/DayTask.js"

const router = express.Router()

// ✅ PATCH /api/daytasks/:id/status
router.patch("/:id/status", async (req, res) => {
    try {
        const { id } = req.params
        const { user_id, status } = req.body

        if (!user_id || !status) {
            return res.status(400).json({
                success: false,
                error: "Missing parameters: user_id or status",
            })
        }

        // ✅ Update day task
        const updated = await DayTask.findOneAndUpdate(
            { _id: id, user_id },
            { status, updated_at: new Date() },
            { new: true }
        )

        if (!updated) {
            return res.status(404).json({
                success: false,
                error: "No matching record found",
            })
        }

        res.json({
            success: true,
            message: "Status updated",
            new_status: status,
            task: updated,
        })
    } catch (err) {
        console.error("❌ Error updating day task status:", err)
        res.status(500).json({ success: false, error: err.message })
    }
})

export default router
