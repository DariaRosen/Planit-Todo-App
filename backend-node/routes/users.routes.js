import express from "express"
import { User } from "../models/User.js"

const router = express.Router()

// ======================================================
// ✅ GET all users
// ======================================================
router.get("/", async (req, res) => {
    try {
        const users = await User.find().sort({ created_at: -1 })
        res.json({ success: true, users })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// ======================================================
// ✅ GET user by Mongo _id
// ======================================================
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user)
            return res.status(404).json({ success: false, error: "User not found" })
        res.json({ success: true, user })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// ======================================================
// ✅ GET user by email
// ======================================================
router.get("/email/:email", async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email?.trim() || "")
        if (!email)
            return res.status(400).json({ success: false, error: "Missing or empty email parameter" })

        const user = await User.findOne({ email })
        if (!user)
            return res.status(404).json({ success: false, error: "User not found" })

        res.json({ success: true, user })
    } catch (err) {
        console.error("❌ Error fetching user by email:", err)
        res.status(500).json({ success: false, error: err.message })
    }
})

// ======================================================
// ✅ POST — Create a new user (Sign-up / Auto-login)
// ======================================================
router.post("/", async (req, res) => {
    try {
        const { name, email, avatar_url, is_main_user } = req.body
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: name or email",
            })
        }

        // Check if user already exists
        const existing = await User.findOne({ email })
        if (existing) {
            return res.status(409).json({
                success: false,
                error: "User already exists",
                user: existing,
            })
        }

        // Generate default avatar if not provided
        const avatar =
            avatar_url?.trim() ||
            `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(
                name || "Guest"
            )}`

        const newUser = new User({
            name,
            email,
            avatar_url: avatar,
            is_main_user: !!is_main_user,
            is_logged_in: true,
        })

        const saved = await newUser.save()
        res.json({
            success: true,
            user: saved,
            message: "User created and logged in successfully",
        })
    } catch (err) {
        console.error("❌ Error creating user:", err)
        res.status(500).json({ success: false, error: err.message })
    }
})

// ======================================================
// ✅ PATCH — Update profile (name, avatar, etc.)
// ======================================================
router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params
        const { name, avatar_url } = req.body

        if (!id)
            return res.status(400).json({ success: false, error: "Missing user ID" })

        const updated = await User.findByIdAndUpdate(
            id,
            {
                ...(name && { name }),
                ...(avatar_url && { avatar_url }),
            },
            { new: true }
        )

        if (!updated)
            return res.status(404).json({ success: false, error: "User not found" })

        res.json({
            success: true,
            user: updated,
            message: "Profile updated successfully",
        })
    } catch (err) {
        console.error("❌ Error updating user:", err)
        res.status(500).json({ success: false, error: err.message })
    }
})

// ======================================================
// ✅ PATCH — Update login status
// ======================================================
router.patch("/:id/status", async (req, res) => {
    try {
        const { id } = req.params
        const { is_logged_in } = req.body

        if (typeof is_logged_in !== "boolean") {
            return res.status(400).json({
                success: false,
                error: "Missing or invalid 'is_logged_in' field",
            })
        }

        const updated = await User.findByIdAndUpdate(
            id,
            { is_logged_in },
            { new: true }
        )

        if (!updated)
            return res.status(404).json({ success: false, error: "User not found" })

        res.json({ success: true, user: updated })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

export default router
