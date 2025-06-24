import mongoose from 'mongoose';


export const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.DATABASE_URL);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

    }catch(e){
        console.log("Error connecting to Database", e.message);
        process.exit(1);
    }
}