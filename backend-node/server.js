const PORT = process.env.PORT || 4000
import app, { connectToDatabase } from "./app.js"

const startServer = async () => {
    try {
        await connectToDatabase()
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
    } catch (error) {
        console.error("❌ Failed to start server:", error)
        process.exit(1)
    }
}

startServer()
