import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"
import dayTasksRouter from "./routes/dayTasks.routes.js"

dotenv.config()
const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

// Mongo connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB connection error:", err))

// Routes
app.use("/api/daytasks", dayTasksRouter)

app.get("/", (req, res) => res.send("Planit Todo API running 🚀"))
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
