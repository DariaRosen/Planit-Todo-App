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
    "http://localhost:5174",
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

    // ✅ Drop the old unique index to allow multiple instances of the same task per day
    try {
        const DayTaskCollection = mongoose.connection.collection("daytasks")
        const indexes = await DayTaskCollection.indexes()
        
        // Find the unique index on user_id, task_id, day_date
        const uniqueIndex = indexes.find(
            (idx) => {
                const keys = idx.key || {}
                return (
                    keys.user_id === 1 &&
                    keys.task_id === 1 &&
                    keys.day_date === 1 &&
                    idx.unique === true
                )
            }
        )
        
        if (uniqueIndex) {
            const indexName = uniqueIndex.name || "user_id_1_task_id_1_day_date_1"
            try {
                await DayTaskCollection.dropIndex(indexName)
                console.log(`✅ Dropped unique index '${indexName}' on daytasks to allow multiple instances`)
            } catch (dropErr) {
                // Try alternative index name format
                if (dropErr.code === 27) {
                    // IndexNotFound - might have been dropped already
                    console.log("ℹ️ Index already removed or doesn't exist")
                } else {
                    // Try dropping by key pattern
                    try {
                        await DayTaskCollection.dropIndex({ user_id: 1, task_id: 1, day_date: 1 })
                        console.log("✅ Dropped unique index by key pattern")
                    } catch (dropErr2) {
                        console.warn("⚠️ Could not drop index:", dropErr2.message)
                    }
                }
            }
        }
    } catch (err) {
        // Collection might not exist yet - that's okay
        console.warn("⚠️ Could not check/drop index (collection might not exist yet):", err.message)
    }
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

