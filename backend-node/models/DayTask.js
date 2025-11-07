import mongoose from "mongoose"

const dayTaskSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    task_id: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    day_date: { type: String, required: true },
    title: { type: String, required: true },
    status: { type: String, default: "pending" },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
})

// ✅ Prevent duplicates (unique combo)
dayTaskSchema.index({ user_id: 1, task_id: 1, day_date: 1 }, { unique: true })

export const DayTask = mongoose.model("DayTask", dayTaskSchema)
