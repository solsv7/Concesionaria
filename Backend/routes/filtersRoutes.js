const express = require("express");
const router = express.Router();
const filtersController = require("../controllers/filtersController");

router.get("/combustibles", filtersController.getCombustibles);
router.get("/marcas", filtersController.getMarcas);
router.get("/anios", filtersController.getAnios);
router.get("/colores", filtersController.getColores);
router.get("/tipos-vehiculo", filtersController.getTiposVehiculo);
router.get("/transmisiones", filtersController.getTransmisiones);
router.get("/tracciones", filtersController.getTracciones);
router.get("/direcciones", filtersController.getDirecciones);

router.get("/metodos-pago", filtersController.getMetodosPago);
router.get("/planes-pago", filtersController.getPlanesPago);
router.get("/usuarios", filtersController.getUsuarios);


module.exports = router;
