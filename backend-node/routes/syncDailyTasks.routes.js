import express from "express"
import { DayTask } from "../models/DayTask.js"
import { Task } from "../models/Task.js"

const router = express.Router()

// ✅ POST /api/sync-daily
router.post("/", async (req, res) => {
    try {
        const { user_id } = req.body
        if (!user_id) {
            return res.status(400).json({ success: false, error: "Missing user_id" })
        }

        // 1️⃣ Get all daily tasks
        const dailyTasks = await Task.find({ frequency: "daily" })
        if (!dailyTasks.length) {
            return res.json({ success: true, message: "No daily tasks found" })
        }

        // 2️⃣ Define visible days (today + next 2)
        const days = []
        const today = new Date()
        for (let i = 0; i < 3; i++) {
            const d = new Date(today)
            d.setDate(today.getDate() + i)
            days.push(d.toISOString().split("T")[0])
        }

        // 3️⃣ Fetch existing day tasks for this user & range
        const existingTasks = await DayTask.find({
            user_id,
            day_date: { $in: days },
        })

        const existingMap = new Map()
        for (const task of existingTasks) {
            const key = `${task.day_date}-${task.task_id}`
            existingMap.set(key, true)
        }

        // 4️⃣ Insert missing ones
        let insertedCount = 0
        const newEntries = []

        for (const day of days) {
            for (const task of dailyTasks) {
                const key = `${day}-${task._id}`
                if (!existingMap.has(key)) {
                    newEntries.push({
                        user_id,
                        task_id: task._id,
                        day_date: day,
                        title: task.title || "Untitled",
                        status: "pending",
                    })
                    insertedCount++
                }
            }
        }

        if (newEntries.length) {
            await DayTask.insertMany(newEntries)
        }

        // 5️⃣ Optional: cleanup of non-daily tasks (rarely needed)
        const nonDailyIds = (await Task.find({ frequency: { $ne: "daily" } }, "_id")).map(t => t._id)
        if (nonDailyIds.length) {
            await DayTask.deleteMany({
                user_id,
                task_id: { $in: nonDailyIds },
                day_date: { $in: days },
            })
        }

        res.json({
            success: true,
            inserted: insertedCount,
            days_checked: days,
            message: "✅ Daily tasks synced successfully",
        })
    } catch (err) {
        console.error("❌ Error syncing daily tasks:", err)
        res.status(500).json({ success: false, error: err.message })
    }
})

export default router
