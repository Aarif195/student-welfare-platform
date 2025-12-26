import { Request, Response } from "express";
import { pool } from "../../config/db";


// getMyHostelsController
export const getMyHostelsController = async (req: Request, res: Response) => {
  const owner_id = (req as any).user.id;

  try {
    const result = await pool.query(
      "SELECT * FROM Hostels WHERE owner_id = $1 ORDER BY created_at DESC",
      [owner_id]
    );

    res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching your hostels" });
  }
};

// getSingleHostelController
export const getSingleHostelController = async (req: Request, res: Response) => {
  const { hostelId } = req.params;
  const owner_id = (req as any).user.id;

  // Check valid integer
  if (isNaN(Number(hostelId))) {
    return res.status(400).json({ success: false, message: "Invalid hostel id" });
  }

  // Debugging logs
  console.log("Searching for Hostel ID:", hostelId);
  console.log("Logged in Owner ID:", owner_id);

  try {
    // Fetch hostel by ID
    const result = await pool.query("SELECT * FROM Hostels WHERE id = $1", [parseInt(hostelId)]);

    // Check 1: Does it exist?
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Hostel not found" });
    }

    const hostel = result.rows[0];

    // Check 2: Does the owner own it?
    if (hostel.owner_id !== owner_id) {
      return res.status(403).json({ success: false, message: "Unauthorized: You do not own this hostel" });
    }

    // Return hostel data
    res.status(200).json({ success: true, data: hostel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// createHostelController
export const createHostelController = async (req: Request, res: Response) => {
  const { name, location, description } = req.body;
  const owner_id = (req as any).user.id;

  try {
    const result = await pool.query(
      `INSERT INTO Hostels (owner_id, name, location, description, status) 
       VALUES ($1, $2, $3, $4, 'pending') 
       RETURNING *`,
      [owner_id, name, location, description]
    );

    res.status(201).json({
      success: true,
      message: "Hostel created and awaiting admin approval",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error creating hostel" });
  }
};




export const createRoomController = (
  req: Request,
  res: Response
) => {};