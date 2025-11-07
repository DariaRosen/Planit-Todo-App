import express from "express"
import { DayTask } from "../models/DayTask.js"

const router = express.Router()

// POST /api/daytasks
router.post("/", async (req, res) => {
    try {
        const { user_id, task_id, day_date, title } = req.body
        if (!user_id || !task_id || !day_date) {
            return res.status(400).json({ success: false, error: "Missing required parameters" })
        }

        const newTask = new DayTask({ user_id, task_id, day_date, title })
        const saved = await newTask.save()

        res.json({
            success: true,
            id: saved._id,
            task: saved
        })
    } catch (err) {
        console.error("❌ Error inserting day task:", err)
        res.status(500).json({ success: false, error: err.message })
    }
})

export default router
