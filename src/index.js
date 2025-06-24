import express from 'express';
import authRoutes from './routes/authRoutes.js';
import { connectDB } from './lib/db.js';
import cors from 'cors';
import job from './lib/cron.js';

import bookingRoutes from './routes/bookingRoutes.js'
import vehicleRoutes from './routes/vehicleRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import dotenv from 'dotenv';
dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 4000;

job.start(); // Start the cron job, when using physical phone.
app.use(express.json());
// app.use(express.json({ limit: '10mb' })); // for large image uploads
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use(cors());

app.use("/api/auth", authRoutes)
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes); // or statsRoutes



app.listen(PORT, () => {
    console.log('Server is running on port 4000');
    connectDB();
});

