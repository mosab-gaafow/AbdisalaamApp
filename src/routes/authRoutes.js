import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../../prisma/client.js';
import protectRoute from '../middleware/auth.middleware.js';
import { sendResetCode } from '../utils/email.js';

const router = express.Router();

const generateToken = (userId) => {
  // return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15d' });
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15d' });

};

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ message: 'Please fill all fields' }); // validate all fields
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${name}`;

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        image: avatarUrl,
        role: 'traveler', // Default role
      },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        _id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 mins

  // Save the code and expiry time in the DB
  await prisma.user.update({
    where: { email },
    data: {
      resetCode,
      resetCodeExpires: expires,
    },
  });

  try {
    // ✅ Send the code to the USER’S OWN email
    await sendResetCode(email, resetCode);
    res.json({ message: 'Reset code sent to user email' });
  } catch (error) {
    console.error('Email send failed:', error);
    res.status(500).json({ message: 'Failed to send reset code' });
  }
});


router.post('/verify-code', async (req, res) => {
  const { email, code } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (
    !user ||
    user.resetCode !== code ||
    !user.resetCodeExpires ||
    new Date(user.resetCodeExpires) < new Date()
  ) {
    return res.status(400).json({ message: 'Invalid or expired code' });
  }

  res.json({ message: 'Code verified' });
});


router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (
    !user ||
    user.resetCode !== code ||
    !user.resetCodeExpires ||
    new Date(user.resetCodeExpires) < new Date()
  ) {
    return res.status(400).json({ message: 'Invalid or expired code' });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: {
      password: hashed,
      resetCode: null,
      resetCodeExpires: null,
    },
  });

  res.json({ message: 'Password has been reset' });
});



// Get all users (admin only)
router.get('/getAllUsers', protectRoute, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/getAllVhecileOnwers', protectRoute, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isDeleted: false, role: 'vehicle_owner' },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
export default router;
