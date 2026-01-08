"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOwnerBookingsController = exports.getRoomsByHostelController = exports.createRoomController = exports.deleteRoomController = exports.deleteHostelController = exports.updateRoomController = exports.updateHostelController = exports.createHostelController = exports.getSingleRoomController = exports.getSingleHostelController = exports.getMyHostelsController = void 0;
const db_1 = require("../../config/db");
// getMyHostelsController
const getMyHostelsController = async (req, res) => {
    const owner_id = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Number(page);
    const pageLimit = Number(limit);
    const offset = (pageNumber - 1) * pageLimit;
    try {
        // total count
        const countResult = await db_1.pool.query("SELECT COUNT(*) FROM Hostels WHERE owner_id = $1", [owner_id]);
        const total = Number(countResult.rows[0].count);
        // paginated data
        const result = await db_1.pool.query(`
      SELECT *
      FROM Hostels
      WHERE owner_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
      `, [owner_id, pageLimit, offset]);
        res.status(200).json({
            success: true,
            meta: {
                page: pageNumber,
                limit: pageLimit,
                total,
            },
            MyHostels: result.rows,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Server error fetching your hostels" });
    }
};
exports.getMyHostelsController = getMyHostelsController;
// getSingleHostelController
const getSingleHostelController = async (req, res) => {
    const { hostelId } = req.params;
    const owner_id = req.user.id;
    // Debugging logs
    console.log("Searching for Hostel ID:", hostelId);
    console.log("Logged in Owner ID:", owner_id);
    try {
        // Fetch hostel by ID
        const result = await db_1.pool.query("SELECT * FROM Hostels WHERE id = $1", [
            parseInt(hostelId),
        ]);
        // Check 1: Does it exist?
        if (result.rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Hostel not found" });
        }
        const hostel = result.rows[0];
        // Check 2: Does the owner own it?
        if (hostel.owner_id !== owner_id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You do not own this hostel",
            });
        }
        // Return hostel data
        res.status(200).json({ success: true, data: hostel });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getSingleHostelController = getSingleHostelController;
// getSingleRoomController
const getSingleRoomController = async (req, res) => {
    const { hostelId, roomId } = req.params;
    const owner_id = req.user.id;
    try {
        // 1. Verify Hostel Ownership
        const hostelCheck = await db_1.pool.query("SELECT owner_id FROM Hostels WHERE id = $1", [hostelId]);
        if (hostelCheck.rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Hostel not found" });
        }
        if (hostelCheck.rows[0].owner_id !== owner_id) {
            return res
                .status(403)
                .json({ success: false, message: "Unauthorized access" });
        }
        // 2. Fetch the specific room
        const room = await db_1.pool.query("SELECT * FROM Rooms WHERE id = $1 AND hostel_id = $2", [roomId, hostelId]);
        if (room.rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Room not found in this hostel" });
        }
        res.status(200).json({ success: true, data: room.rows[0] });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getSingleRoomController = getSingleRoomController;
// createHostelController
const createHostelController = async (req, res) => {
    const { name, location, description } = req.body;
    const owner_id = req.user.id;
    try {
        const result = await db_1.pool.query(`INSERT INTO Hostels (owner_id, name, location, description, status) 
       VALUES ($1, $2, $3, $4, 'pending') 
       RETURNING *`, [owner_id, name, location, description]);
        res.status(201).json({
            success: true,
            message: "Hostel created and awaiting admin approval",
            data: result.rows[0],
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Server error creating hostel" });
    }
};
exports.createHostelController = createHostelController;
// updateHostelController
const updateHostelController = async (req, res) => {
    const { hostelId } = req.params;
    const { name, location, description } = req.body;
    const owner_id = req.user.id;
    try {
        // 1. Check existence
        const hostelCheck = await db_1.pool.query("SELECT owner_id FROM Hostels WHERE id = $1", [hostelId]);
        if (hostelCheck.rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Hostel not found" });
        }
        // 2. Check ownership
        if (hostelCheck.rows[0].owner_id !== owner_id) {
            return res
                .status(403)
                .json({ success: false, message: "Unauthorized: Access denied" });
        }
        // 3. Update
        const updatedHostel = await db_1.pool.query(`UPDATE Hostels 
       SET name = $1, location = $2, description = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 
       RETURNING *`, [name, location, description, hostelId]);
        res.status(200).json({ success: true, data: updatedHostel.rows[0] });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Server error updating hostel" });
    }
};
exports.updateHostelController = updateHostelController;
// updateRoomController
const updateRoomController = async (req, res) => {
    const { hostelId, roomId } = req.params;
    const { room_number, capacity, price, availability } = req.body;
    const owner_id = req.user.id;
    try {
        // 1. Verify Hostel Ownership
        const hostelCheck = await db_1.pool.query("SELECT owner_id FROM Hostels WHERE id = $1", [hostelId]);
        if (hostelCheck.rows.length === 0)
            return res
                .status(404)
                .json({ success: false, message: "Hostel not found" });
        if (hostelCheck.rows[0].owner_id !== owner_id)
            return res.status(403).json({ success: false, message: "Unauthorized" });
        // 2. Verify Room belongs to this Hostel
        const roomCheck = await db_1.pool.query("SELECT id FROM Rooms WHERE id = $1 AND hostel_id = $2", [roomId, hostelId]);
        if (roomCheck.rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Room not found in this hostel" });
        }
        // 3. Update Room
        const updatedRoom = await db_1.pool.query(`UPDATE Rooms 
       SET room_number = $1, capacity = $2, price = $3, availability = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 
       RETURNING *`, [room_number, capacity, price, availability, roomId]);
        res.status(200).json({ success: true, data: updatedRoom.rows[0] });
    }
    catch (error) {
        if (error.code === "23505")
            return res
                .status(400)
                .json({ success: false, message: "Room number already exists" });
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.updateRoomController = updateRoomController;
// deleteHostelController
const deleteHostelController = async (req, res) => {
    const { hostelId } = req.params;
    const owner_id = req.user.id;
    try {
        // 1. Check existence and ownership
        const hostelCheck = await db_1.pool.query("SELECT owner_id FROM Hostels WHERE id = $1", [hostelId]);
        if (hostelCheck.rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Hostel not found" });
        }
        if (hostelCheck.rows[0].owner_id !== owner_id) {
            return res
                .status(403)
                .json({ success: false, message: "Unauthorized: Access denied" });
        }
        // 2. Delete
        await db_1.pool.query("DELETE FROM Hostels WHERE id = $1", [hostelId]);
        res.status(204).send();
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Server error deleting hostel" });
    }
};
exports.deleteHostelController = deleteHostelController;
// deleteRoomController
const deleteRoomController = async (req, res) => {
    const { hostelId, roomId } = req.params;
    const owner_id = req.user.id;
    try {
        // 1. Verify Hostel Ownership
        const hostelCheck = await db_1.pool.query("SELECT owner_id FROM Hostels WHERE id = $1", [hostelId]);
        if (hostelCheck.rows.length === 0)
            return res
                .status(404)
                .json({ success: false, message: "Hostel not found" });
        if (hostelCheck.rows[0].owner_id !== owner_id)
            return res.status(403).json({ success: false, message: "Unauthorized" });
        // 2. Verify Room belongs to this Hostel
        const roomCheck = await db_1.pool.query("SELECT id FROM Rooms WHERE id = $1 AND hostel_id = $2", [roomId, hostelId]);
        if (roomCheck.rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Room not found in this hostel" });
        }
        // 3. Delete Room
        await db_1.pool.query("DELETE FROM Rooms WHERE id = $1", [roomId]);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.deleteRoomController = deleteRoomController;
// createRoomController
const createRoomController = async (req, res) => {
    const { hostelId } = req.params;
    const { room_number, capacity, price } = req.body;
    const owner_id = req.user.id;
    // Multer puts multiple files in req.files
    const files = req.files;
    const imagePaths = files ? files.map((file) => file.path) : [];
    // Check valid integer
    if (isNaN(Number(hostelId))) {
        return res
            .status(400)
            .json({ success: false, message: "Invalid hostel id" });
    }
    try {
        // 1. Verify ownership of the hostel
        const hostelCheck = await db_1.pool.query("SELECT owner_id FROM Hostels WHERE id = $1", [hostelId]);
        if (hostelCheck.rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Hostel not found" });
        }
        if (hostelCheck.rows[0].owner_id !== owner_id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You do not own this hostel",
            });
        }
        // 2. Create the room
        const newRoom = await db_1.pool.query(`INSERT INTO Rooms (hostel_id, room_number, capacity, price, images) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`, [hostelId, room_number, capacity, price, imagePaths]);
        res.status(201).json({ success: true, data: newRoom.rows[0] });
    }
    catch (error) {
        console.log("room", error);
        if (error.code === "23505") {
            return res.status(400).json({
                success: false,
                message: "Room number already exists in this hostel",
            });
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.createRoomController = createRoomController;
// getRoomsByHostelController
const getRoomsByHostelController = async (req, res) => {
    const { hostelId } = req.params;
    const owner_id = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Number(page);
    const pageLimit = Number(limit);
    const offset = (pageNumber - 1) * pageLimit;
    try {
        // 1. Verify hostel ownership
        const hostelCheck = await db_1.pool.query("SELECT owner_id FROM Hostels WHERE id = $1", [hostelId]);
        if (hostelCheck.rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Hostel not found" });
        }
        if (hostelCheck.rows[0].owner_id !== owner_id) {
            return res
                .status(403)
                .json({ success: false, message: "Unauthorized access" });
        }
        // 2. Total rooms count
        const countResult = await db_1.pool.query("SELECT COUNT(*) FROM Rooms WHERE hostel_id = $1", [hostelId]);
        const total = Number(countResult.rows[0].count);
        // 3. Paginated rooms
        const rooms = await db_1.pool.query(`
      SELECT *
      FROM Rooms
      WHERE hostel_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
      `, [hostelId, pageLimit, offset]);
        res.status(200).json({
            success: true,
            meta: {
                page: pageNumber,
                limit: pageLimit,
                total,
            },
            MyRooms: rooms.rows,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Server error fetching rooms" });
    }
};
exports.getRoomsByHostelController = getRoomsByHostelController;
// getOwnerBookingsController
const getOwnerBookingsController = async (req, res) => {
    const owner_id = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Number(page);
    const pageLimit = Number(limit);
    const offset = (pageNumber - 1) * pageLimit;
    try {
        // total count
        const countResult = await db_1.pool.query(`
      SELECT COUNT(*) 
      FROM Bookings b
      JOIN Rooms r ON b.room_id = r.id
      JOIN Hostels h ON r.hostel_id = h.id
      WHERE h.owner_id = $1
      `, [owner_id]);
        const total = Number(countResult.rows[0].count);
        // paginated data
        const result = await db_1.pool.query(`
      SELECT 
        s.firstName,
        s.lastName,
        s.phone,
        r.room_number,
        b.booking_status AS status,
        b.start_date AS move_in_date
      FROM Bookings b
      JOIN Rooms r ON b.room_id = r.id
      JOIN Hostels h ON r.hostel_id = h.id
      JOIN Students s ON b.student_id = s.id
      WHERE h.owner_id = $1
      ORDER BY b.booked_at DESC
      LIMIT $2 OFFSET $3
      `, [owner_id, pageLimit, offset]);
        res.status(200).json({
            success: true,
            meta: {
                page: pageNumber,
                limit: pageLimit,
                total,
            },
            data: result.rows,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getOwnerBookingsController = getOwnerBookingsController;
