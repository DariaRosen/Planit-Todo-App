import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar_url: { type: String, default: "" },
    is_main_user: { type: Boolean, default: false },
    is_logged_in: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
})

export const User = mongoose.model("User", userSchema)
