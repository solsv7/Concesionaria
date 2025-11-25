const pool = require("../config/db");

function handleMySQLError(err, res, defaultMessage) {
  console.error(defaultMessage, err);

  if (err && err.sqlState === "45000") {
    return res.status(400).json({
      message: err.sqlMessage || "Error de validación en base de datos",
    });
  }

  return res.status(500).json({
    message: "Error interno del servidor",
  });
}

exports.getCombustibles = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL GetCombustibles()");
    res.json(rows[0] || []);
  } catch (err) {
    return handleMySQLError(
      err,
      res,
      "Error obteniendo combustibles:"
    );
  }
};

exports.getMarcas = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL GetMarcas()");
    res.json(rows[0] || []);
  } catch (err) {
    return handleMySQLError(
      err,
      res,
      "Error obteniendo marcas:"
    );
  }
};

exports.getAnios = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL GetVehiculoAniosDisponibles()");
    res.json(rows[0] || []);
  } catch (err) {
    return handleMySQLError(
      err,
      res,
      "Error obteniendo años de vehículos:"
    );
  }
};


exports.getColores = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL GetColores()");
    res.json(rows[0] || []);
  } catch (err) {
    return handleMySQLError(
      err,
      res,
      "Error obteniendo colores:"
    );
  }
};

exports.getTiposVehiculo = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL GetTiposVehiculo()");
    res.json(rows[0] || []);
  } catch (err) {
    return handleMySQLError(
      err,
      res,
      "Error obteniendo tipos de vehículo:"
    );
  }
};

exports.getTransmisiones = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL GetTransmisiones()");
    res.json(rows[0] || []);
  } catch (err) {
    return handleMySQLError(
      err,
      res,
      "Error obteniendo transmisiones:"
    );
  }
};

exports.getTracciones = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL GetTracciones()");
    res.json(rows[0] || []);
  } catch (err) {
    return handleMySQLError(
      err,
      res,
      "Error obteniendo tracciones:"
    );
  }
};

exports.getDirecciones = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL GetDirecciones()");
    res.json(rows[0] || []);
  } catch (err) {
    return handleMySQLError(
      err,
      res,
      "Error obteniendo direcciones:"
    );
  }
};
exports.getMetodosPago = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL GetMetodosPago()");
    res.json(rows[0] || []);
  } catch (err) {
    return handleMySQLError(
      err,
      res,
      "Error obteniendo métodos de pago:"
    );
  }
};

exports.getPlanesPago = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL GetPlanesPago()");
    res.json(rows[0] || []);
  } catch (err) {
    return handleMySQLError(
      err,
      res,
      "Error obteniendo planes de pago:"
    );
  }
};

exports.getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query("CALL GetUsuarios()");
    res.json(rows[0] || []);
  } catch (err) {
    return handleMySQLError(
      err,
      res,
      "Error obteniendo usuarios:"
    );
  }
};
