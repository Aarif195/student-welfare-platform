import express from "express";
import cors from "cors";
import studentRoutes from "./routes/studentRoutes";
import ownerRoutes from "./routes/ownerRoutes";
import hostelRoutes from "./routes/hostelRoutes";
import adminRoutes from "./routes/adminRoutes";
import publicRoutes from "./routes/publicRoutes";

const PORT = process.env.PORT || 5000;


const app = express();
app.use(cors());
app.use(express.json());

// Route registration
app.use("/students", studentRoutes);
app.use("/owners", ownerRoutes);
app.use("/hostels", hostelRoutes);
app.use("/admin", adminRoutes);
app.use("/public", publicRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
