import mongoose from "mongoose";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();

const uri = `mongodb+srv://roger-account:${process.env.MONGO_PASS}@actitoutcluster.q3ympoj.mongodb.net/?retryWrites=true&w=majority`;

async function connectToMongoDB() {
    try {

        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

export { connectToMongoDB };
