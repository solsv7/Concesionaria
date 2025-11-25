require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const imagekitRoutes = require("./routes/imagekitRoutes");
const filtersRoutes = require("./routes/filtersRoutes");
const salesRoutes = require("./routes/salesRoutes");


const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*"
  })
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/imagekit", imagekitRoutes);
app.use("/api/filters", filtersRoutes);
app.use("/api/sales", salesRoutes);


app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.listen(PORT, () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
});
