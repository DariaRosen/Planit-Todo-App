import express from "express"
import { DayTask } from "../models/DayTask.js"
import { Task } from "../models/Task.js" // ✅ import Task to update its counter

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

        // 🔍 Check if already exists
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
            title: title || "",
            status: "pending",
        })
        const saved = await newTask.save()

        // ✅ Increment parent task’s daily_amount by +1
        await Task.findByIdAndUpdate(task_id, { $inc: { daily_amount: 1 } })

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
