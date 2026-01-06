import express from "express";
import cors from "cors";
import studentRoutes from "./routes/studentRoutes";
import ownerRoutes from "./routes/ownerRoutes";
import hostelRoutes from "./routes/hostelRoutes";
import adminRoutes from "./routes/adminRoutes";
import publicRoutes from "./routes/publicRoutes";
import notificationsRoutes from "./routes/notificationsRoutes";
import maintenanceRoutes from "./routes/maintenanceRoutes";
import studySpaceRoutes from "./routes/studySpaceRoutes";
import verifyOTPRoutes from "./routes/verifyOTPRoutes";
import resendOTPRoutes from "./routes/resendOTPRoutes";



import { connectTODB } from "./config/db";

const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors());
app.use(express.json());

// server to serve static files via a URL 
app.use('/uploads', express.static('uploads'));


// Route registration
app.use("/students", studentRoutes);
app.use("/owners", ownerRoutes); 
app.use("/hostels", hostelRoutes);
app.use("/admin", adminRoutes);
app.use("/public", publicRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/maintenance", maintenanceRoutes);
app.use("/study-spaces", studySpaceRoutes);
app.use("/api/auth", verifyOTPRoutes);
app.use("/api/auth", resendOTPRoutes);



app.listen(PORT, () => {
    connectTODB()
  console.log(`Server running on port ${PORT}`);
});

