import express from "express"
import { DayTask } from "../models/DayTask.js"

const router = express.Router()

// ✅ POST /api/daytasks (create day task if not already exists)
router.post("/", async (req, res) => {
    try {
        const { user_id, task_id, day_date, title } = req.body

        if (!user_id || !task_id || !day_date) {
            return res.status(400).json({
                success: false,
                error: "Missing required parameters: user_id, task_id, or day_date",
            })
        }

        // 🔍 Check if already exists for same day and task
        const exists = await DayTask.findOne({ user_id, task_id, day_date })
        if (exists) {
            return res.json({
                success: true,
                message: "Task already exists for this day",
                duplicate: true,
                id: exists._id,
            })
        }

        // ✅ Create new day task
        const newTask = new DayTask({
            user_id,
            task_id,
            day_date,
            title: title || "", // optional
            status: "pending",
        })

        const saved = await newTask.save()

        res.json({
            success: true,
            id: saved._id,
            message: "Task inserted successfully",
            task: saved,
        })
    } catch (err) {
        console.error("❌ Error inserting day task:", err)
        res.status(500).json({ success: false, error: err.message })
    }
})

export default router
