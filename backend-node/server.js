import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()
const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB connection error:", err))

// Test route
app.get("/", (req, res) => {
    res.send("Planit Todo API is running 🚀")
})

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
