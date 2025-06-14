import mongoose from "mongoose"


const connectDB = async () => {

    try {
        const connection = await mongoose.connect(process.env.DATA_BASE)
        console.log(`MongoDB Connected : ${connection.connection.host}`)
    } catch (error) {
        console.error(`Error : ${error.message}`)
        process.exit(1)
    }
    
}

export default connectDB