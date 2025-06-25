import express from "express";
import axios from "axios";
// import prisma from "../prisma/client.js"; // ✅ adjust if your Prisma path differs
import protectRoute from "../middleware/auth.middleware.js";
import prisma from "../../prisma/client.js";

const router = express.Router();

router.post("/pay", protectRoute, async (req, res) => {
  try {
    const { accountNo, amount, invoiceId, bookingId, description } = req.body;

    const requestBody = {
      schemaVersion: "1.0",
      requestId: Date.now().toString(),
      timestamp: new Date().toISOString(),
      channelName: "WEB",
      serviceName: "API_PURCHASE",
      serviceParams: {
        merchantUid: "M0910291",
        apiUserId: "1000416",
        apiKey: "API-675418888AHX",
        paymentMethod: "mwallet_account",
        payerInfo: {
          accountNo: accountNo,
        },
        transactionInfo: {
          referenceId: invoiceId,
          invoiceId: invoiceId,
          amount: parseFloat(amount),
          currency: "USD",
          description: description || "Trip Booking Payment",
        },
      },
    };

    const response = await axios.post("https://api.waafipay.net/asm", requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // ✅ Success: Update Booking + Save Log
    if (response.data.responseMsg === "RCS_SUCCESS") {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          amountPaid: parseFloat(amount),
          paymentStatus: 'paid',
          paymentMethod: 'evcplus',
          transactionId: response.data.transactionId || response.data.referenceId,
          paymentVerified: true,
        },
      });

      await prisma.paymentLog.create({
        data: {
          bookingId,
          phoneNumber: accountNo,
          amount: parseFloat(amount),
          invoiceId,
          referenceId: response.data.referenceId,
          status: response.data.responseMsg,
          response: response.data,
        },
      });
    }




    // Respond with full API result
    res.status(200).json(response.data);

        console.log("📨 Outgoing payment:", {
  accountNo,
  amount,
  invoiceId,
});
  } catch (error) {
    console.error("Payment error:", error.message);
    res.status(500).json({ error: "Payment failed", detail: error.message });
  }
});

export default router;
