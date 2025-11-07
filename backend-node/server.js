import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"
import dayTasksRouter from "./routes/dayTasks.routes.js"
import tasksRouter from "./routes/tasks.routes.js"
import usersRouter from "./routes/users.routes.js"

dotenv.config()
const app = express()
const PORT = process.env.PORT || 4000

// ✅ CORS Configuration (replaces cors.php)
const allowedOrigins = [
    "http://localhost:5173", // local Vite
    "http://localhost:3000", // optional for alt ports
    "https://planit-todo-app.vercel.app", // example production domain
]

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like Postman or curl)
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true)
            } else {
                callback(new Error("Not allowed by CORS"))
            }
        },
        credentials: true, // keep this if you ever use cookies or auth
    })
)

// ✅ Body parser
app.use(express.json())

// ✅ Mongo connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err))

// ✅ API Routes
app.use("/api/daytasks", dayTasksRouter)
app.use("/api/tasks", tasksRouter)
app.use("/api/users", usersRouter)

// ✅ Root route
app.get("/", (req, res) => res.send("Planit Todo API running 🚀"))

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
