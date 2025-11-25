const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");

router.get("/", vehicleController.search);
router.get("/:id", vehicleController.getById);

router.post("/:id/images", vehicleController.addImage);
router.put("/:id/imagen-perfil", vehicleController.setProfileImage);
router.put("/:id/imagenes/orden", vehicleController.reorderImage);
router.put("/:id", vehicleController.update);


router.post("/", vehicleController.create);
router.patch("/:id/estado", vehicleController.updateEstado);
router.delete("/:id", vehicleController.delete);

module.exports = router;
