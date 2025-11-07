import express from "express"
import { Task } from "../models/Task.js"

const router = express.Router()

// ✅ GET all tasks
router.get("/", async (req, res) => {
    try {
        const tasks = await Task.find().sort({ created_at: -1 })
        res.json(tasks)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ✅ POST add new task
router.post("/", async (req, res) => {
    try {
        const { title, frequency } = req.body
        if (!title?.trim()) {
            return res.status(400).json({ success: false, error: "Title is required" })
        }

        const newTask = new Task({ title, frequency })
        const saved = await newTask.save()

        res.json({ success: true, id: saved._id, task: saved })
    } catch (err) {
        console.error("❌ Error adding task:", err)
        res.status(500).json({ success: false, error: err.message })
    }
})

// ✅ DELETE task
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params
        const result = await Task.findByIdAndDelete(id)
        if (!result) return res.status(404).json({ success: false, error: "Task not found" })

        res.json({ success: true, deletedId: id })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// ✅ UPDATE task
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params
        const { title, frequency } = req.body
        const updated = await Task.findByIdAndUpdate(
            id,
            { title, frequency },
            { new: true }
        )
        if (!updated) return res.status(404).json({ success: false, error: "Task not found" })

        res.json({ success: true, task: updated })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

export default router
