import express from "express"
import { DayTask } from "../models/DayTask.js"
import { Task } from "../models/Task.js"

const router = express.Router()

// ✅ POST /api/daytasks (create a day task if not already exists)
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
            title: title || "",
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


// ✅ GET /api/daytasks?user_id=xxx&days=2025-11-05,2025-11-06,2025-11-07
router.get("/", async (req, res) => {
    try {
        const { user_id, days } = req.query

        if (!user_id || !days) {
            return res.status(400).json({ success: false, error: "Missing user_id or days" })
        }

        const dayArray = days.split(",")

        // Fetch tasks for those days and include task data
        const results = await DayTask.find({
            user_id,
            day_date: { $in: dayArray },
        })
            .populate("task_id", "title frequency") // join with Task model
            .sort({ day_date: 1 })

        // Group by day_date (same as PHP version)
        const grouped = {}
        for (const row of results) {
            const date = row.day_date
            if (!grouped[date]) grouped[date] = []

            grouped[date].push({
                id: row._id,
                task_id: row.task_id?._id || row.task_id,
                title: row.task_id?.title || row.title || "Untitled",
                frequency: row.task_id?.frequency || "as_needed",
                status: row.status,
            })
        }

        res.json({ success: true, tasks: grouped })
    } catch (err) {
        console.error("❌ Error fetching day tasks:", err)
        res.status(500).json({ success: false, error: err.message })
    }
})

// ✅ DELETE /api/daytasks/:id
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params
        const { user_id } = req.body // optional sanity check

        if (!id) {
            return res.status(400).json({
                success: false,
                error: "Missing day_task_id",
            })
        }

        // ✅ Optionally validate user_id (if passed)
        const filter = user_id ? { _id: id, user_id } : { _id: id }

        const deleted = await DayTask.findOneAndDelete(filter)

        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: "Task not found or already deleted",
            })
        }

        res.json({
            success: true,
            message: "Task removed successfully",
            deletedId: deleted._id,
        })
    } catch (err) {
        console.error("❌ Error deleting day task:", err)
        res.status(500).json({ success: false, error: err.message })
    }
})


export default router
