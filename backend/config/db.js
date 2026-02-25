import mongoose from "mongoose";
const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: 15000, // Timeout after 15s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        })
        console.log("DB connected")
    } catch (error) {
        console.log("DB error:", error.message)
    }

}
export default connectDb