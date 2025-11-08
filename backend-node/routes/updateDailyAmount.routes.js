import express from "express"
import { Task } from "../models/Task.js"

const router = express.Router()

// ✅ PATCH /api/tasks/:id/daily-amount
router.patch("/:id/daily-amount", async (req, res) => {
    try {
        const { id } = req.params
        const { daily_amount } = req.body

        if (!id) {
            return res.status(400).json({ success: false, error: "Missing task_id" })
        }

        // Validate numeric value
        if (typeof daily_amount !== "number") {
            return res.status(400).json({ success: false, error: "daily_amount must be a number" })
        }

        // Update task in Mongo
        const updated = await Task.findByIdAndUpdate(
            id,
            { daily_amount },
            { new: true }
        )

        if (!updated) {
            return res.status(404).json({ success: false, error: "Task not found" })
        }

        res.json({ success: true, task: updated })
    } catch (err) {
        console.error("❌ Error updating daily_amount:", err)
        res.status(500).json({ success: false, error: err.message })
    }
})

export default router
