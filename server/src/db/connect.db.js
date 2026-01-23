import mongoose from "mongoose";
import config from "../config/env.config.js";

const MONGO_URI = config.MONGO_URI;

const connectDb = async() => {
    try{
        await mongoose.connect(MONGO_URI);
    } catch(err){
        console.error(err);
    }
}

export default connectDb;