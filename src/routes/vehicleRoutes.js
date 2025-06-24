import express from 'express';
import prisma from '../../prisma/client.js';
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

// ✅ Register a new vehicle
router.post('/registerVehicles', protectRoute, async (req, res) => {
  try {
    const { plateNumber, model, capacity, type, userId } = req.body;

    if (!plateNumber || !model || !capacity || !type || !userId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { plateNumber },
    });

    if (existingVehicle) {
      return res.status(400).json({ message: "Plate number already exists." });
    }

    const newVehicle = await prisma.vehicle.create({
      data: {
        plateNumber,
        model,
        capacity: parseInt(capacity),
        type,
        userId,
        isDeleted: false,
      },
    });

    res.status(201).json(newVehicle);
  } catch (err) {
    console.error("Register vehicle error:", err.message);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// ✅ Get all vehicles for the current user
router.get('/my', protectRoute, async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        userId: req.user.id,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(vehicles);
  } catch (err) {
    console.error("Fetch my vehicles error:", err.message);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// ✅ Get all vehicles (admin only)
router.get('/getAllVehicles', protectRoute, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { isDeleted: false },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(vehicles);
  } catch (err) {
    console.error("Admin fetch vehicles error:", err.message);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// ✅ Update a vehicle (admin only)
router.put('/:id', protectRoute, async (req, res) => {
  try {
    const { id } = req.params;
    const { plateNumber, model, capacity, type, userId } = req.body;

    // Ensure only admin can update vehicles
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update vehicles.' });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });

    if (!vehicle || vehicle.isDeleted) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        plateNumber,
        model,
        capacity: parseInt(capacity),
        type,
        userId, // allow admin to change the vehicle owner if needed
      },
    });

    res.status(200).json(updatedVehicle);
  } catch (err) {
    console.error('Update vehicle error:', err.message);
    res.status(500).json({ message: 'Something went wrong.' });
  }
});


// ✅ Only admins can delete a vehicle
router.delete('/:id', protectRoute, async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure only admin role can proceed
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete vehicles.' });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });

    if (!vehicle || vehicle.isDeleted) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }

    await prisma.vehicle.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.status(200).json({ message: 'Vehicle deleted successfully.' });
  } catch (err) {
    console.error('Delete vehicle error:', err.message);
    res.status(500).json({ message: 'Something went wrong.' });
  }
});


export default router;
