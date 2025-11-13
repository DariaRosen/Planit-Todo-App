import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"
import dayTasksRouter from "./routes/dayTasks.routes.js"
import tasksRouter from "./routes/tasks.routes.js"
import usersRouter from "./routes/users.routes.js"
import syncDailyTasksRouter from "./routes/syncDailyTasks.routes.js"
import updateDailyAmountRouter from "./routes/updateDailyAmount.routes.js"
import updateDayTaskStatusRouter from "./routes/updateDayTaskStatus.routes.js"
import updateTaskRouter from "./routes/updateTask.routes.js"
import updateUserStatusRouter from "./routes/updateUserStatus.routes.js"

dotenv.config()

const app = express()

const defaultAllowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://planit-todo-app.vercel.app",
]

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? defaultAllowedOrigins.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true)
                return
            }

            callback(new Error("Not allowed by CORS"))
        },
        credentials: true,
    })
)

app.use(express.json())

const connectToDatabase = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("Missing MONGO_URI environment variable")
    }

    if (mongoose.connection.readyState >= 1) {
        return
    }

    if (!globalThis._mongooseConnectionPromise) {
        globalThis._mongooseConnectionPromise = mongoose.connect(process.env.MONGO_URI)
    }

    await globalThis._mongooseConnectionPromise
}

app.use("/api/daytasks", dayTasksRouter)
app.use("/api/tasks", tasksRouter)
app.use("/api/users", usersRouter)
app.use("/api/sync-daily", syncDailyTasksRouter)
app.use("/api/tasks", updateDailyAmountRouter)
app.use("/api/daytasks", updateDayTaskStatusRouter)
app.use("/api/tasks", updateTaskRouter)
app.use("/api/users", updateUserStatusRouter)

app.get("/", (req, res) => {
    res.send("Planit Todo API running 🚀")
})

export { connectToDatabase }
export default app

