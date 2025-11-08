import express from "express"
import { Task } from "../models/Task.js"

const router = express.Router()

// ✅ PATCH /api/tasks/:id
router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params
        const { title, completed } = req.body

        if (!id) {
            return res.status(400).json({ success: false, error: "Task ID is required" })
        }

        // Build dynamic update object
        const update = {}
        if (title !== undefined) update.title = title
        if (completed !== undefined) update.completed = completed

        if (Object.keys(update).length === 0) {
            return res
                .status(400)
                .json({ success: false, error: "No valid fields to update" })
        }

        const updatedTask = await Task.findByIdAndUpdate(id, update, { new: true })

        if (!updatedTask) {
            return res.status(404).json({ success: false, error: "Task not found" })
        }

        res.json({
            success: true,
            message: "Task updated successfully",
            task: updatedTask,
        })
    } catch (err) {
        console.error("❌ Error updating task:", err)
        res.status(500).json({ success: false, error: err.message })
    }
})

export default router
