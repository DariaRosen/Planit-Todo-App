import express from "express"
import { User } from "../models/User.js"

const router = express.Router()

// ✅ GET all users
router.get("/", async (req, res) => {
    try {
        const users = await User.find().sort({ created_at: -1 })
        res.json(users)
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// ✅ POST add (sign-up) user
router.post("/", async (req, res) => {
    try {
        const { name, email, avatar_url, is_main_user } = req.body

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: name or email"
            })
        }

        // Check if user already exists
        const existing = await User.findOne({ email })
        if (existing) {
            return res.status(409).json({
                success: false,
                error: "User already exists"
            })
        }

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
            is_logged_in: true
        })

        const saved = await newUser.save()
        res.json({
            success: true,
            user_id: saved._id,
            user: saved,
            message: "User added successfully and logged in"
        })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// ✅ PUT update login status
router.put("/status/:id", async (req, res) => {
    try {
        const { id } = req.params
        const { is_logged_in } = req.body

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

// ✅ GET /api/users/email/:email
router.get("/email/:email", async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email?.trim() || "")
        if (!email) {
            return res.status(400).json({ success: false, error: "Missing or empty email parameter" })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" })
        }

        res.json({ success: true, user })
    } catch (err) {
        console.error("❌ Error fetching user by email:", err)
        res.status(500).json({ success: false, error: err.message })
    }
})


export default router
