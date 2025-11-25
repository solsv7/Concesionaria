// src/routes/salesRoutes.js
const express = require("express");
const router = express.Router();
const salesController = require("../controllers/salesController");
const authMiddleware = require("../middleware/authMiddleware");

// MIS COMPRAS / MIS MOVIMIENTOS (solo usuario logueado)
router.get("/ventas/mias", authMiddleware, salesController.getMyVentasByRange);
router.get(
  "/movimientos/mios",
  authMiddleware,
  salesController.getMyMovimientosByRange
);

// RUTAS GENERALES (dashboard concesionaria)
router.get("/ventas", salesController.getVentasByRange);
router.get("/ventas/resumen", salesController.getVentasResumenByRange);
router.get("/movimientos", salesController.getMovimientosByRange); // 👈 FIX
router.get("/ventas/:id/cuotas", salesController.getCuotasByVenta);
router.post("/ventas/:id/cuotas/:idCuota/pago", salesController.payCuota);
router.post("/ventas", salesController.createVenta);

module.exports = router;
