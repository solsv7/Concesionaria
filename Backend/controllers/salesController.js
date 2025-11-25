const pool = require("../config/db");

const sendError = (res, status, code, message) => {
  return res.status(status).json({ code, message });
};

function handleMySQLError(err, res, defaultMessage) {
  console.error(defaultMessage, err);

  if (err && err.sqlState === "45000") {
    return sendError(
      res,
      400,
      "DB_VALIDATION_ERROR",
      err.sqlMessage || "Error de validación en base de datos"
    );
  }

  return sendError(
    res,
    500,
    "INTERNAL_ERROR",
    "Error interno del servidor"
  );
}

function parseAndValidateRange(req, res) {
  const { desde, hasta } = req.query;

  if (!desde || !hasta) {
    sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "Parámetros 'desde' y 'hasta' son obligatorios (YYYY-MM-DD)"
    );
    return null;
  }

  const desdeDate = new Date(desde);
  const hastaDate = new Date(hasta);

  if (Number.isNaN(desdeDate.getTime()) || Number.isNaN(hastaDate.getTime())) {
    sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "Formato de fecha inválido. Use YYYY-MM-DD"
    );
    return null;
  }

  if (hastaDate < desdeDate) {
    sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "'hasta' no puede ser menor que 'desde'"
    );
    return null;
  }

  return { desde, hasta };
}

/* =========================
   Ventas: rangos generales
   ========================= */

exports.getVentasByRange = async (req, res) => {
  try {
    const range = parseAndValidateRange(req, res);
    if (!range) return;
    const { desde, hasta } = range;

    const [rows] = await pool.query(
      "CALL GetVentasByRangoFechas(?, ?)",
      [desde, hasta]
    );

    const ventas = rows[0] || [];

    return res.json(ventas);
  } catch (err) {
    return handleMySQLError(
      err,
      res,
      "Error obteniendo ventas por rango:"
    );
  }
};

exports.getVentasResumenByRange = async (req, res) => {
  try {
    const range = parseAndValidateRange(req, res);
    if (!range) return;
    const { desde, hasta } = range;

    const [rows] = await pool.query(
      "CALL GetResumenVentasByRangoFechas(?, ?)",
      [desde, hasta]
    );

    const resumen = (rows[0] && rows[0][0]) || {
      cantidad_ventas: 0,
      monto_total: 0,
      monto_promedio: 0,
      monto_aprobadas: 0,
      monto_pendientes: 0,
      monto_rechazadas: 0,
    };

    return res.json(resumen);
  } catch (err) {
    return handleMySQLError(
      err,
      res,
      "Error obteniendo resumen de ventas:"
    );
  }
};

exports.getMovimientosByRange = async (req, res) => {
  try {
    const range = parseAndValidateRange(req, res);
    if (!range) return;
    const { desde, hasta } = range;

    const [rows] = await pool.query(
      "CALL GetMovimientosByRangoFechas(?, ?)",
      [desde, hasta]
    );

    const movimientos = rows[0] || [];

    return res.json(movimientos);
  } catch (err) {
    return handleMySQLError(
      err,
      res,
      "Error obteniendo movimientos por rango:"
    );
  }
};

/* =========================
   Mis compras / Mis movimientos
   ============================ */

// ✅ Acá va la versión que querías agregar
exports.getMyVentasByRange = async (req, res) => {
  try {
    const range = parseAndValidateRange(req, res);
    if (!range) return;
    const { desde, hasta } = range;

    const userId = req.user && Number(req.user.id_usuario);
    if (!userId) {
      return sendError(
        res,
        401,
        "UNAUTHORIZED",
        "No se pudo determinar el usuario autenticado"
      );
    }

    const [rows] = await pool.query(
      "CALL GetVentasByRangoFechas(?, ?)",
      [desde, hasta]
    );

    const allVentas = rows[0] || [];
    const ventasUsuario = allVentas.filter(
      (venta) => Number(venta.id_cliente) === userId
    );

    return res.json(ventasUsuario);
  } catch (err) {
    return handleMySQLError(
      err,
      res,
      "Error obteniendo mis ventas por rango:"
    );
  }
};

// si igual querés mantener un resumen para "Mis compras", podés dejar esta
exports.getMyVentasResumenByRange = async (req, res) => {
  try {
    const range = parseAndValidateRange(req, res);
    if (!range) return;
    const { desde, hasta } = range;

    const userId = req.user && Number(req.user.id_usuario);

    if (!userId || userId <= 0) {
      return sendError(
        res,
        401,
        "UNAUTHORIZED",
        "No se pudo determinar el usuario autenticado"
      );
    }

    const [rows] = await pool.query(
      "CALL GetResumenVentasUsuarioByRangoFechas(?, ?, ?)",
      [userId, desde, hasta]
    );

    const resumen = (rows[0] && rows[0][0]) || {
      cantidad_ventas: 0,
      monto_total: 0,
      monto_promedio: 0,
      monto_aprobadas: 0,
      monto_pendientes: 0,
      monto_rechazadas: 0,
    };

    return res.json(resumen);
  } catch (err) {
    return handleMySQLError(
      err,
      res,
      "Error obteniendo resumen de mis ventas:"
    );
  }
};

// ✅ Y esta es la nueva versión de mis movimientos
exports.getMyMovimientosByRange = async (req, res) => {
  try {
    const range = parseAndValidateRange(req, res);
    if (!range) return;
    const { desde, hasta } = range;

    const userId = req.user && Number(req.user.id_usuario);
    if (!userId) {
      return sendError(
        res,
        401,
        "UNAUTHORIZED",
        "No se pudo determinar el usuario autenticado"
      );
    }

    const [rows] = await pool.query(
      "CALL GetMovimientosByRangoFechas(?, ?)",
      [desde, hasta]
    );

    const allMovimientos = rows[0] || [];
    const movimientosUsuario = allMovimientos.filter(
      (mov) => Number(mov.id_cliente) === userId
    );

    return res.json(movimientosUsuario);
  } catch (err) {
    return handleMySQLError(
      err,
      res,
      "Error obteniendo mis movimientos por rango:"
    );
  }
};

/* =========================
   Cuotas / pagos
   ========================= */

exports.getCuotasByVenta = async (req, res) => {
  try {
    const { id } = req.params;

    const idVenta = Number(id);
    if (!idVenta || idVenta <= 0) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "El id de la venta debe ser un número mayor a 0"
      );
    }

    const [rows] = await pool.query("CALL GetCuotasByVenta(?)", [idVenta]);

    const cuotas = rows[0] || [];

    return res.json(cuotas);
  } catch (err) {
    return handleMySQLError(
      err,
      res,
      "Error obteniendo cuotas de la venta:"
    );
  }
};

exports.payCuota = async (req, res) => {
  try {
    const { id, idCuota } = req.params;
    const { id_metodo, monto } = req.body || {};

    const idVenta = Number(id);
    const cuotaId = Number(idCuota);

    if (!idVenta || idVenta <= 0) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "El id de la venta debe ser un número mayor a 0"
      );
    }

    if (!cuotaId || cuotaId <= 0) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "El id de la cuota debe ser un número mayor a 0"
      );
    }

    if (!id_metodo || Number(id_metodo) <= 0) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "El método de pago (id_metodo) es obligatorio"
      );
    }

    const params = [cuotaId, Number(id_metodo), monto ?? null];

    await pool.query("CALL PagarCuota(?, ?, ?)", params);

    return res.json({
      message: "Cuota pagada correctamente",
    });
  } catch (err) {
    return handleMySQLError(err, res, "Error pagando cuota:");
  }
};

exports.createVenta = async (req, res) => {
  try {
    const { id_vehiculo, id_usuario, id_plan, fecha, pagos } = req.body || {};

    const errors = [];

    if (!id_vehiculo || Number(id_vehiculo) <= 0) {
      errors.push("El id_vehiculo es obligatorio y debe ser mayor a 0");
    }

    if (!id_usuario || Number(id_usuario) <= 0) {
      errors.push("El id_usuario (cliente) es obligatorio y debe ser mayor a 0");
    }

    if (!Array.isArray(pagos) || pagos.length === 0) {
      errors.push("Debes indicar al menos un pago en el campo 'pagos'");
    }

    if (Array.isArray(pagos)) {
      pagos.forEach((pago, index) => {
        if (!pago || typeof pago !== "object") {
          errors.push(`El pago en posición ${index} no es un objeto válido`);
          return;
        }

        if (!pago.id_metodo || Number(pago.id_metodo) <= 0) {
          errors.push(
            `El pago en posición ${index} debe tener un id_metodo mayor a 0`
          );
        }

        if (
          pago.monto === undefined ||
          pago.monto === null ||
          Number(pago.monto) <= 0
        ) {
          errors.push(
            `El pago en posición ${index} debe tener un monto mayor a 0`
          );
        }

        if (pago.es_vehiculo_entregado) {
          if (!pago.id_marca || !pago.modelo || !pago.id_combustible) {
            errors.push(
              `El pago en posición ${index} está marcado como vehículo entregado, pero falta id_marca, modelo o id_combustible`
            );
          }
        }
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Datos inválidos para crear la venta",
        errors,
      });
    }

    const pagosJson = JSON.stringify(pagos);

    const params = [
      Number(id_vehiculo),
      Number(id_usuario),
      id_plan ? Number(id_plan) : null,
      fecha || null,
      pagosJson,
    ];

    const [rows] = await pool.query(
      "CALL CreateVentaAuto(?, ?, ?, ?, ?)",
      params
    );

    const resultSet = rows && rows[0] ? rows[0] : [];
    const ventaRow = resultSet[0] || null;

    return res.status(201).json({
      message: "Venta creada correctamente",
      venta: ventaRow,
    });
  } catch (err) {
    return handleMySQLError(err, res, "Error creando venta:");
  }
};
