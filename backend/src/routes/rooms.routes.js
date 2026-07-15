import { Router } from 'express';
import { store } from '../data/store.js';
import { createRoom, normalizeRoomFields } from '../models/Room.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  res.json(await store.getRooms());
});

// Only admins manage the room list itself.
router.post('/', requireRole('admin'), async (req, res) => {
  try {
    const rooms = await store.getRooms();
    const room = createRoom(req.body || {});
    if (rooms.some((r) => r.number === room.number)) {
      return res.status(400).json({ error: 'Номер с таким названием уже существует' });
    }
    await store.addRoom(room);
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id', requireRole('admin'), async (req, res) => {
  try {
    const { number, capacity, notes } = req.body || {};
    const patch = normalizeRoomFields({ number, capacity, notes });
    const rooms = await store.getRooms();
    if (rooms.some((r) => r.id !== req.params.id && r.number === patch.number)) {
      return res.status(400).json({ error: 'Номер с таким названием уже существует' });
    }
    const room = await store.updateRoom(req.params.id, patch);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Refuses to remove a room that a current or future stay still depends on.
router.delete('/:id', requireRole('admin'), async (req, res) => {
  const patients = await store.getPatients();
  const today = new Date().toISOString().slice(0, 10);
  const occupied = patients.some((p) => p.roomId === req.params.id && p.checkOut >= today);
  if (occupied) {
    return res.status(409).json({ error: 'В номере есть текущие или будущие пациенты — сначала переселите их' });
  }
  const ok = await store.deleteRoom(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Room not found' });
  res.status(204).end();
});

export default router;
