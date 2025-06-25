// import express from "express";
// import axios from "axios";
// import prisma from "../../prisma/client.js";
// import protectRoute from "../middleware/auth.middleware.js";

// const router = express.Router();

// // Helper function to generate traceable IDs
// const generateTransactionId = () => `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// router.post("/pay", protectRoute, async (req, res) => {
//   // Set response headers first
//   res.setHeader('Content-Type', 'application/json');

//   // Validate input
//   const { accountNo, amount, bookingId, description } = req.body;
  
//   if (!accountNo || !amount || !bookingId) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   // Validate phone number format
//   const sanitizedPhone = accountNo.replace(/\D/g, '');
//   if (!sanitizedPhone.startsWith('252') || sanitizedPhone.length < 9) {
//     return res.status(400).json({ error: "Invalid Somali phone number format" });
//   }

//   // Validate amount
//   const paymentAmount = parseFloat(amount);
//   if (isNaN(paymentAmount) || paymentAmount <= 0) {
//     return res.status(400).json({ error: "Invalid payment amount" });
//   }

//   try {
//     const booking = await prisma.booking.findUnique({
//       where: { id: bookingId },
//       include: { trip: true }
//     });

//     if (!booking) {
//       return res.status(404).json({ error: "Booking not found" });
//     }

//     const requestBody = {
//       schemaVersion: "1.0",
//       requestId: `BOOK-${bookingId}-${Date.now()}`,
//       timestamp: new Date().toISOString(),
//       channelName: "WEB",
//       serviceName: "API_PURCHASE",
//       serviceParams: {
//         merchantUid: "M0910291",
//         apiUserId: "1000416",
//         apiKey: "API-675418888AHX",
//         paymentMethod: "mwallet_account",
//         payerInfo: {
//           accountNo: sanitizedPhone,
//         },
//         transactionInfo: {
//           referenceId: `BOOK-${bookingId}`,
//           invoiceId: `INV-${Date.now()}`,
//           amount: paymentAmount.toFixed(2),
//           currency: "USD",
//           description: description || `Payment for booking ${bookingId}`,
//         },
//       },
//     };

//     console.log("Sending to WAAFI API:", requestBody);
//     const response = await axios.post("https://api.waafipay.net/asm", requestBody, {
//       headers: {
//         "Content-Type": "application/json",
//         "Accept": "application/json"
//       },
//       timeout: 30000
//     });

//     console.log("WAAFI API response:", response.data);

//     if (response.data.responseMsg === "RCS_SUCCESS") {
//       await prisma.$transaction([
//         prisma.booking.update({
//           where: { id: bookingId },
//           data: {
//             amountPaid: paymentAmount,
//             paymentStatus: 'paid',
//             paymentMethod: 'evcplus',
//             transactionId: response.data.params?.transactionId || requestBody.requestId,
//             paymentVerified: true,
//             status: 'CONFIRMED',
//           }
//         }),
//         prisma.paymentLog.create({
//           data: {
//             bookingId,
//             phoneNumber: sanitizedPhone,
//             amount: paymentAmount,
//             invoiceId: requestBody.serviceParams.transactionInfo.invoiceId,
//             referenceId: response.data.params?.referenceId || requestBody.requestId,
//             status: response.data.responseMsg,
//             response: JSON.stringify(response.data),
//           }
//         })
//       ]);

//       return res.json({
//         success: true,
//         message: "Payment successful",
//         transactionId: response.data.params?.transactionId,
//         requestId: requestBody.requestId
//       });
//     }

//     // Handle WAAFI API failure
//     await prisma.paymentLog.create({
//       data: {
//         bookingId,
//         phoneNumber: sanitizedPhone,
//         amount: paymentAmount,
//         invoiceId: requestBody.serviceParams.transactionInfo.invoiceId,
//         status: response.data.responseMsg || "FAILED",
//         response: JSON.stringify(response.data),
//       }
//     });

//     return res.status(400).json({
//       success: false,
//       message: response.data.responseMsg || "Payment failed",
//       responseCode: response.data.responseCode
//     });

//   } catch (error) {
//     console.error("Payment error:", error.response?.data || error.message);
    
//     await prisma.paymentLog.create({
//       data: {
//         bookingId,
//         phoneNumber: accountNo.replace(/\D/g, ''),
//         amount: parseFloat(amount) || 0,
//         status: "ERROR",
//         response: error.message,
//       }
//     });

//     return res.status(500).json({
//       success: false,
//       message: "Payment processing failed",
//       error: error.response?.data || error.message
//     });
//   }
// });

// export default router;