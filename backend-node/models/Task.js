import mongoose from "mongoose"

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    frequency: {
        type: String,
        enum: ["daily", "weekly", "as_needed"],
        default: "as_needed"
    },
    completed: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
})

export const Task = mongoose.model("Task", taskSchema)
