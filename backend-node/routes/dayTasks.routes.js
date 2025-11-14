import express from "express"
import mongoose from "mongoose"
import { DayTask } from "../models/DayTask.js"
import { Task } from "../models/Task.js" // ✅ import Task to update its counter

const router = express.Router()

// ✅ POST /api/daytasks (create new day task instance - allows multiple instances per day)
router.post("/", async (req, res) => {
    try {
        const { user_id, task_id, day_date, title } = req.body

        if (!user_id || !task_id || !day_date) {
            return res.status(400).json({
                success: false,
                error: "Missing required parameters: user_id, task_id, or day_date",
            })
        }

        // ✅ Create new day task (allows multiple instances of the same task per day)
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
        
        // Check if it's a duplicate key error (unique index still exists)
        if (err.code === 11000 || err.message?.includes("duplicate key")) {
            return res.status(500).json({
                success: false,
                error: "Duplicate key error - unique index still exists in database. Please restart the server to drop the index.",
                details: err.message,
            })
        }
        
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

        // ✅ Store removed task info to prevent sync-daily from re-adding it
        try {
            const RemovedTaskCollection = mongoose.connection.collection("removedtasks")
            // Check if this task was already marked as removed (avoid duplicates)
            const existing = await RemovedTaskCollection.findOne({
                user_id: deleted.user_id,
                task_id: deleted.task_id,
                day_date: deleted.day_date,
            })
            
            if (!existing) {
                await RemovedTaskCollection.insertOne({
                    user_id: deleted.user_id,
                    task_id: deleted.task_id,
                    day_date: deleted.day_date,
                    removed_at: new Date(),
                })
            }
        } catch (removedErr) {
            // Collection might not exist - that's okay, will be created on first insert
            console.warn("⚠️ Could not track removed task:", removedErr.message)
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
