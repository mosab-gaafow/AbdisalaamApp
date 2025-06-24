// middleware/auth.middleware.js

import jwt from 'jsonwebtoken';
import prisma from '../../prisma/client.js'; // Adjust if your path differs

const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // You can change `decoded.id` to `decoded.userId` depending on your login logic
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        isVerified: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || user.isDeleted) {
      return res.status(401).json({ message: "Unauthorized: Invalid or deleted user" });
    }

    // Attach user + role helpers
    req.user = {
      ...user,
      isAdmin: user.role === 'admin',
      isOwner: user.role === 'vehicle_owner',
      isTraveler: user.role === 'traveler',
    };

    next();
  } catch (e) {
    console.error("Auth middleware error:", e.message);
    return res.status(401).json({ message: "Unauthorized: Token verification failed" });
  }
};

export default protectRoute;
