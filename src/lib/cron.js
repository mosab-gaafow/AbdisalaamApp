import cron from 'cron';
import https from 'https';
import prisma from '../../prisma/client.js';


const job = new cron.CronJob('*/5 * * * *', async function () {
  // 🔄 1. KEEP RENDER AWAKE
  https.get(process.env.API_URL, (res) => {
    if (res.statusCode === 200)
      console.log(`[KEEP ALIVE] GET request successful. Status: ${res.statusCode}`);
    else
      console.error(`[KEEP ALIVE] GET request failed. Status: ${res.statusCode}`);
  }).on('error', (e) => console.error('Error in keep-alive GET:', e));

  // ⏳ 2. AUTO-EXPIRE OLD BOOKINGS
  const expirationMinutes = 15;
  const cutoff = new Date(Date.now() - expirationMinutes * 60 * 1000);

  const expiredBookings = await prisma.booking.findMany({
    where: {
      status: 'PENDING',
      bookingTime: { lt: cutoff },
      isDeleted: false
    },
  });

  for (const booking of expiredBookings) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'EXPIRED',
        expiredAt: new Date()
      },
    });

    await prisma.trip.update({
      where: { id: booking.tripId },
      data: {
        availableSeats: { increment: booking.seatsBooked }
      }
    });

    console.log(`[AUTO-CANCEL] Booking ${booking.id} marked as EXPIRED.`);
  }
});

export default job;
