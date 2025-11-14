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

// ✅ Allow multiple instances of the same task on the same day
// Removed unique index to support multiple instances (e.g., doing laundry 2-3 times per day)

export const DayTask = mongoose.model("DayTask", dayTaskSchema)
