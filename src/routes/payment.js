import express from "express";
import axios from "axios";
import prisma from "../../prisma/client.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

// Helper function to generate traceable IDs
const generateTransactionId = () => `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

router.post("/pay", protectRoute, async (req, res) => {
  // Validate input
  const { accountNo, amount, bookingId, description } = req.body;
  
  if (!accountNo || !amount || !bookingId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Get booking details for verification
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { trip: true }
  });

  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  // Prepare WAAFI API request
  const requestBody = {
    schemaVersion: "1.0",
    requestId: generateTransactionId(),
    timestamp: new Date().toISOString(),
    channelName: "WEB",
    serviceName: "API_PURCHASE",
    serviceParams: {
      merchantUid: "M0910291",
      apiUserId: "1000416",
      apiKey: "API-675418888AHX",
      paymentMethod: "mwallet_account",
      payerInfo: {
        accountNo: accountNo.replace(/\D/g, ''), // Sanitize phone number
      },
      transactionInfo: {
        referenceId: `BOOK-${bookingId}`,
        invoiceId: generateTransactionId(),
        amount: parseFloat(amount).toFixed(2), // Ensure 2 decimal places
        currency: "USD",
        description: description || `Payment for booking ${bookingId}`,
      },
    },
  };

  try {
    // Log the outgoing request
    console.log("Sending payment request:", JSON.stringify(requestBody, null, 2));

    const response = await axios.post("https://api.waafipay.net/asm", requestBody, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      timeout: 30000 // 30 seconds timeout
    });

    console.log("Payment API response:", response.data);

    // Handle successful payment
    if (response.data.responseMsg === "RCS_SUCCESS") {
      await prisma.$transaction([
        prisma.booking.update({
          where: { id: bookingId },
          data: {
            amountPaid: parseFloat(amount),
            paymentStatus: 'paid',
            paymentMethod: 'evcplus',
            transactionId: response.data.params.transactionId || requestBody.requestId,
            paymentVerified: true,
            status: 'CONFIRMED',
          }
        }),
        prisma.paymentLog.create({
          data: {
            bookingId,
            phoneNumber: accountNo,
            amount: parseFloat(amount),
            invoiceId: requestBody.serviceParams.transactionInfo.invoiceId,
            referenceId: response.data.params.referenceId,
            status: response.data.responseMsg,
            response: JSON.stringify(response.data),
          }
        })
      ]);

      return res.status(200).json({
        success: true,
        message: "Payment successful",
        transactionId: response.data.params.transactionId
      });
    }

    // Handle failed payment
    await prisma.paymentLog.create({
      data: {
        bookingId,
        phoneNumber: accountNo,
        amount: parseFloat(amount),
        invoiceId: requestBody.serviceParams.transactionInfo.invoiceId,
        status: response.data.responseMsg || "FAILED",
        response: JSON.stringify(response.data),
      }
    });

    return res.status(400).json({
      success: false,
      message: response.data.responseMsg || "Payment failed",
      code: response.data.responseCode
    });

  } catch (error) {
    console.error("Payment processing error:", error.response?.data || error.message);
    
    await prisma.paymentLog.create({
      data: {
        bookingId,
        phoneNumber: accountNo,
        amount: parseFloat(amount),
        status: "ERROR",
        response: error.message,
      }
    });

    return res.status(500).json({
      success: false,
      message: "Payment processing failed",
      error: error.response?.data || error.message
    });
  }
});

export default router;