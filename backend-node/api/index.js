import app, { connectToDatabase } from "../app.js"

export default async function handler(req, res) {
    try {
        await connectToDatabase()
    } catch (error) {
        console.error("❌ MongoDB connection error:", error)
        res.status(500).json({ message: "Database connection failed" })
        return
    }

    return app(req, res)
}

