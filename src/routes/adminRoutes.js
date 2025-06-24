import express from 'express';
import prisma from '../../prisma/client.js';
import protectRoute from '../middleware/auth.middleware.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.get('/summaryStats', protectRoute, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({ where: { isDeleted: false } });
    const totalTrips = await prisma.trip.count({ where: { isDeleted: false } });
    const totalVehicles = await prisma.vehicle.count({ where: { isDeleted: false } });
    const totalBookings = await prisma.booking.count({ where: { isDeleted: false } });

    const recentUsers = await prisma.user.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({ totalUsers, totalTrips, totalVehicles, totalBookings, recentUsers });
  } catch (err) {
    console.error("Summary stats error:", err);
    res.status(500).json({ error: 'Failed to fetch summary statistics' });
  }
});

router.get('/vehcilestats', protectRoute, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const [vehicleCount, tripCount, userCount] = await Promise.all([
      prisma.vehicle.count({ where: { isDeleted: false } }),
      prisma.trip.count({ where: { isDeleted: false } }),
      prisma.user.count(),
    ]);

    res.json({
      totalVehicles: vehicleCount,
      totalTrips: tripCount,
      totalUsers: userCount,
    });
  } catch (err) {
    console.error('Admin stats error:', err.message);
    res.status(500).json({ message: "Failed to load statistics" });
  }
});


// Admin: Mark a payment as verified
router.patch('/verifyPayment/:bookingId', protectRoute, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { paymentVerified: true },
    });

    res.json({ message: 'Payment marked as verified', booking: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});


router.put('/update-profile', protectRoute, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const userId = req.user.id;

    console.log("Update request received:", { userId, body: req.body }); // Debug log

    // Enhanced validation - allow partial updates
    if (!name && !email && !phone && !password) {
      return res.status(400).json({ 
        success: false,
        error: 'At least one field must be provided for update' 
      });
    }

    // Validate password length if provided
    if (password && password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Email change validation
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use'
        });
      }
    }

    // Prepare update data - handle null/undefined properly
    const updateData = {
      name: name !== undefined ? name : existingUser.name,
      email: email !== undefined ? email : existingUser.email,
      phone: phone !== undefined ? phone : existingUser.phone,
    };

    // Only hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Use transaction for safety
    const updatedUser = await prisma.$transaction(async (prisma) => {
      return await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
    });

    console.log("Successfully updated user:", updatedUser); // Debug log

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser // Make sure to return the updated user data
    });

  } catch (error) {
    console.error('Profile update error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to update profile',
      // Only show details in development
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        code: error.code
      } : undefined
    });
  }
});

export default router;
