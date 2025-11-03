const express = require('express');
const router = express.Router();

// In-memory seats
let seats = [];
const TOTAL_SEATS = 10;

// Initialize seats
for (let i = 1; i <= TOTAL_SEATS; i++) {
  seats.push({
    id: i,
    status: 'available', // available | locked | booked
    lockedBy: null,
    lockExpiresAt: null
  });
}

// Helper: Clean expired locks
const cleanExpiredLocks = () => {
  const now = Date.now();
  seats.forEach(seat => {
    if (seat.status === 'locked' && seat.lockExpiresAt < now) {
      seat.status = 'available';
      seat.lockedBy = null;
      seat.lockExpiresAt = null;
    }
  });
};

// GET available seats
router.get('/seats', (req, res) => {
  cleanExpiredLocks();
  res.status(200).json(seats);
});

// POST lock a seat
router.post('/seats/lock', (req, res) => {
  cleanExpiredLocks();
  const { seatId, userId } = req.body;
  const seat = seats.find(s => s.id === seatId);

  if (!seat) return res.status(404).json({ message: `Seat ${seatId} not found` });
  if (seat.status === 'booked') return res.status(400).json({ message: 'Seat already booked' });
  if (seat.status === 'locked') return res.status(400).json({ message: 'Seat already locked' });

  seat.status = 'locked';
  seat.lockedBy = userId;
  seat.lockExpiresAt = Date.now() + 60 * 1000; // lock expires in 1 minute

  res.status(200).json({ message: `Seat ${seatId} locked for user ${userId}`, seat });
});

// POST confirm booking
router.post('/seats/confirm', (req, res) => {
  cleanExpiredLocks();
  const { seatId, userId } = req.body;
  const seat = seats.find(s => s.id === seatId);

  if (!seat) return res.status(404).json({ message: `Seat ${seatId} not found` });
  if (seat.status !== 'locked' || seat.lockedBy !== userId) {
    return res.status(400).json({ message: 'Seat is not locked by this user' });
  }

  seat.status = 'booked';
  seat.lockedBy = null;
  seat.lockExpiresAt = null;

  res.status(200).json({ message: `Seat ${seatId} successfully booked by user ${userId}`, seat });
});

module.exports = router;
