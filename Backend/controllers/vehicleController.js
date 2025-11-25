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

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const [vehiculoResult] = await pool.query("CALL GetVehiculoById(?)", [id]);

    if (!vehiculoResult[0] || vehiculoResult[0].length === 0) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }

    const vehiculo = vehiculoResult[0][0];

    const [imagenesResult] = await pool.query("CALL GetVehiculoImagenes(?)", [
      id,
    ]);
    const imagenes = imagenesResult[0] || [];

    res.json({
      ...vehiculo,
      imagenes,
    });
  } catch (err) {
    console.error("Error obteniendo vehículo:", err);
    res.status(500).json({ message: "Error interno de servidor" });
  }
};

exports.addImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { url_imagen, img_perfil } = req.body;

    if (!url_imagen) {
      return res.status(400).json({ message: "url_imagen es requerida" });
    }

    await pool.query("CALL AddVehiculoImagen(?, ?, ?)", [
      id,
      url_imagen,
      img_perfil ? 1 : 0,
    ]);

    res.status(201).json({ message: "Imagen registrada correctamente" });
  } catch (err) {
    console.error("Error agregando imagen:", err);
    res.status(500).json({ message: "Error interno al guardar imagen" });
  }
};

exports.setProfileImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_imagen } = req.body;

    if (!id_imagen) {
      return res.status(400).json({ message: "id_imagen es requerido" });
    }

    const idVehiculo = Number(id);
    const idImagen = Number(id_imagen);

    if (!Number.isInteger(idVehiculo) || idVehiculo <= 0) {
      return res.status(400).json({
        message: "El id de vehículo debe ser un entero positivo",
      });
    }

    if (!Number.isInteger(idImagen) || idImagen <= 0) {
      return res.status(400).json({
        message: "El id de imagen debe ser un entero positivo",
      });
    }

    await pool.query("CALL SetVehiculoImagenPerfil(?, ?)", [
      idVehiculo,
      idImagen,
    ]);

    res.json({ message: "Imagen de perfil actualizada correctamente" });
  } catch (err) {
    return handleMySQLError(err, res, "Error actualizando imagen de perfil:");
  }
};

exports.reorderImage = async (req, res) => {
  try {
    const { id } = req.params; 
    const { id_imagen, nuevo_orden } = req.body;

    if (!id_imagen || nuevo_orden === undefined || nuevo_orden === null) {
      return res.status(400).json({
        message: "id_imagen y nuevo_orden son requeridos",
      });
    }

    const idVehiculo = Number(id);
    const idImagen = Number(id_imagen);
    const nuevoOrden = Number(nuevo_orden);

    if (!Number.isInteger(idVehiculo) || idVehiculo <= 0) {
      return res.status(400).json({
        message: "El id de vehículo debe ser un entero positivo",
      });
    }

    if (!Number.isInteger(idImagen) || idImagen <= 0) {
      return res.status(400).json({
        message: "El id de imagen debe ser un entero positivo",
      });
    }

    if (!Number.isInteger(nuevoOrden) || nuevoOrden <= 0) {
      return res.status(400).json({
        message: "nuevo_orden debe ser un entero positivo",
      });
    }

    await pool.query("CALL ReordenarVehiculoImagen(?, ?, ?)", [
      idVehiculo,
      idImagen,
      nuevoOrden,
    ]);

    return res.json({
      message: "Orden de la imagen actualizado correctamente",
    });
  } catch (err) {
    return handleMySQLError(err, res, "Error reordenando imagen:");
  }
};

exports.create = async (req, res) => {
  try {
    const {
      id_marca,
      modelo,
      precio,
      id_combustible,
      origen,
      es_usado,
      anio,
      id_color,
      id_tipo_vehiculo,
      id_transmision,
      id_traccion,
      km,
      puertas,
      id_direccion,
      imagenes, 
    } = req.body;

    if (
      id_marca === undefined ||
      !modelo ||
      precio === undefined ||
      id_combustible === undefined ||
      !origen ||
      es_usado === undefined
    ) {
      return res.status(400).json({
        message:
          "id_marca, modelo, precio, id_combustible, origen y es_usado son requeridos",
      });
    }

    const idMarca = Number(id_marca);
    const idCombustible = Number(id_combustible);
    const precioNum = Number(precio);
    const esUsadoNum = Number(es_usado);

    const anioNum =
      anio === undefined || anio === null || anio === ""
        ? null
        : Number(anio);
    const idColorNum =
      id_color === undefined || id_color === null || id_color === ""
        ? null
        : Number(id_color);
    const idTipoVehiculoNum =
      id_tipo_vehiculo === undefined ||
      id_tipo_vehiculo === null ||
      id_tipo_vehiculo === ""
        ? null
        : Number(id_tipo_vehiculo);
    const idTransmisionNum =
      id_transmision === undefined ||
      id_transmision === null ||
      id_transmision === ""
        ? null
        : Number(id_transmision);
    const idTraccionNum =
      id_traccion === undefined || id_traccion === null || id_traccion === ""
        ? null
        : Number(id_traccion);
    const kmNum =
      km === undefined || km === null || km === "" ? null : Number(km);
    const puertasNum =
      puertas === undefined || puertas === null || puertas === ""
        ? null
        : Number(puertas);
    const idDireccionNum =
      id_direccion === undefined ||
      id_direccion === null ||
      id_direccion === ""
        ? null
        : Number(id_direccion);

    if (!Number.isInteger(idMarca) || idMarca <= 0) {
      return res
        .status(400)
        .json({ message: "id_marca debe ser entero positivo" });
    }

    if (!Number.isInteger(idCombustible) || idCombustible <= 0) {
      return res
        .status(400)
        .json({ message: "id_combustible debe ser entero positivo" });
    }

    if (Number.isNaN(precioNum) || precioNum <= 0) {
      return res.status(400).json({
        message: "precio debe ser un número mayor a 0",
      });
    }

    if (![0, 1].includes(esUsadoNum)) {
      return res.status(400).json({
        message: "es_usado debe ser 0 o 1",
      });
    }

    if (!["AGENCIA", "USADO_CLIENTE"].includes(origen)) {
      return res.status(400).json({
        message: "origen debe ser 'AGENCIA' o 'USADO_CLIENTE'",
      });
    }

    if (
      anioNum !== null &&
      (!Number.isInteger(anioNum) || anioNum < 1900 || anioNum > 2100)
    ) {
      return res.status(400).json({
        message: "anio debe ser un entero válido",
      });
    }

    if (kmNum !== null && (!Number.isInteger(kmNum) || kmNum < 0)) {
      return res.status(400).json({
        message: "km debe ser un entero mayor o igual a 0",
      });
    }

    if (
      puertasNum !== null &&
      (!Number.isInteger(puertasNum) || puertasNum <= 0)
    ) {
      return res.status(400).json({
        message: "puertas debe ser un entero mayor a 0",
      });
    }

    const fkFields = [
      { value: idColorNum, name: "id_color" },
      { value: idTipoVehiculoNum, name: "id_tipo_vehiculo" },
      { value: idTransmisionNum, name: "id_transmision" },
      { value: idTraccionNum, name: "id_traccion" },
      { value: idDireccionNum, name: "id_direccion" },
    ];

    for (const field of fkFields) {
      if (
        field.value !== null &&
        (!Number.isInteger(field.value) || field.value <= 0)
      ) {
        return res.status(400).json({
          message: `${field.name} debe ser un entero positivo`,
        });
      }
    }

    let estadoInicial = "EN_STOCK";


    const [rows] = await pool.query(
      "CALL CreateVehiculoPublicacion(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        idMarca,
        modelo.trim(),
        precioNum,
        idCombustible,
        origen,
        esUsadoNum,
        estadoInicial,
        anioNum,
        idColorNum,
        idTipoVehiculoNum,
        idTransmisionNum,
        idTraccionNum,
        kmNum,
        puertasNum,
        idDireccionNum,
      ]
    );

    const nuevo = rows[0] && rows[0][0];
    const idNuevoVehiculo = nuevo?.id_vehiculo;

    return res.status(201).json({
      message: "Vehículo publicado correctamente",
      id_vehiculo: idNuevoVehiculo,
      estado_inicial: estadoInicial,
    });
  } catch (err) {
    return handleMySQLError(err, res, "Error creando vehículo:");
  }
};



exports.updateEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({
        message: "estado es requerido",
      });
    }

    const idVehiculo = Number(id);

    if (!Number.isInteger(idVehiculo) || idVehiculo <= 0) {
      return res.status(400).json({
        message: "id de vehículo inválido",
      });
    }

    if (
      ![
        "EN_EVALUACION",
        "EN_STOCK",
        "VENDIDO",
        "RECHAZADO",
        "INACTIVO",
      ].includes(estado)
    ) {
      return res.status(400).json({
        message: "estado inválido",
      });
    }

    await pool.query("CALL UpdateVehiculoEstado(?, ?)", [idVehiculo, estado]);

    return res.json({
      message: "Estado de vehículo actualizado correctamente",
    });
  } catch (err) {
    return handleMySQLError(
      err,
      res,
      "Error actualizando estado del vehículo:"
    );
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const idVehiculo = Number(id);

    if (!Number.isInteger(idVehiculo) || idVehiculo <= 0) {
      return res.status(400).json({
        message: "id de vehículo inválido",
      });
    }

    await pool.query("CALL InactivarVehiculoPublicacion(?)", [idVehiculo]);

    return res.json({
      message: "Publicación inactivada correctamente",
    });
  } catch (err) {
    return handleMySQLError(
      err,
      res,
      "Error inactivando publicación de vehículo:"
    );
  }
};

exports.search = async (req, res) => {
  try {
    const {
      marca,
      precio_min,
      precio_max,
      combustible,
      es_usado,
      anio_min,
      anio_max,
      origen,
      color,
      tipo_vehiculo,
      transmision,
      traccion,
      direccion,
      km_min,
      km_max,
      puertas_min,
      puertas_max,
      page,
      pageSize,
    } = req.query;

    const p_id_marca = marca ? Number(marca) : null;
    const p_precio_min = precio_min ? Number(precio_min) : null;
    const p_precio_max = precio_max ? Number(precio_max) : null;
    const p_id_combustible = combustible ? Number(combustible) : null;
    const p_es_usado =
      es_usado === undefined || es_usado === "" ? null : Number(es_usado); 
    const p_anio_min = anio_min ? Number(anio_min) : null;
    const p_anio_max = anio_max ? Number(anio_max) : null;
    const p_origen = origen || null; 

    const p_id_color = color ? Number(color) : null;
    const p_id_tipo_vehiculo = tipo_vehiculo ? Number(tipo_vehiculo) : null;
    const p_id_transmision = transmision ? Number(transmision) : null;
    const p_id_traccion = traccion ? Number(traccion) : null;
    const p_id_direccion = direccion ? Number(direccion) : null;

    const p_km_min = km_min ? Number(km_min) : null;
    const p_km_max = km_max ? Number(km_max) : null;
    const p_puertas_min = puertas_min ? Number(puertas_min) : null;
    const p_puertas_max = puertas_max ? Number(puertas_max) : null;

    const p_page = page ? Number(page) : 1;
    const p_page_size = pageSize ? Number(pageSize) : 12;

    const intPositive = (val) =>
      Number.isInteger(val) && val > 0;

    if (p_id_marca !== null && !intPositive(p_id_marca)) {
      return res
        .status(400)
        .json({ message: "marca debe ser un entero positivo" });
    }

    if (p_id_combustible !== null && !intPositive(p_id_combustible)) {
      return res.status(400).json({
        message: "combustible debe ser un entero positivo",
      });
    }

    if (p_es_usado !== null && ![0, 1].includes(p_es_usado)) {
      return res.status(400).json({
        message: "es_usado debe ser 0 o 1",
      });
    }

    if (p_anio_min !== null && !Number.isInteger(p_anio_min)) {
      return res
        .status(400)
        .json({ message: "anio_min debe ser entero" });
    }

    if (p_anio_max !== null && !Number.isInteger(p_anio_max)) {
      return res
        .status(400)
        .json({ message: "anio_max debe ser entero" });
    }

    if (
      p_anio_min !== null &&
      p_anio_max !== null &&
      p_anio_min > p_anio_max
    ) {
      return res.status(400).json({
        message: "anio_min no puede ser mayor que anio_max",
      });
    }

    if (p_precio_min !== null && Number.isNaN(p_precio_min)) {
      return res
        .status(400)
        .json({ message: "precio_min debe ser numérico" });
    }

    if (p_precio_max !== null && Number.isNaN(p_precio_max)) {
      return res
        .status(400)
        .json({ message: "precio_max debe ser numérico" });
    }

    if (
      p_precio_min !== null &&
      p_precio_max !== null &&
      p_precio_min > p_precio_max
    ) {
      return res.status(400).json({
        message: "precio_min no puede ser mayor que precio_max",
      });
    }

    if (
      p_origen !== null &&
      !["AGENCIA", "USADO_CLIENTE"].includes(p_origen)
    ) {
      return res.status(400).json({
        message: "origen debe ser 'AGENCIA' o 'USADO_CLIENTE'",
      });
    }

    const fkFilters = [
      { value: p_id_color, name: "color" },
      { value: p_id_tipo_vehiculo, name: "tipo_vehiculo" },
      { value: p_id_transmision, name: "transmision" },
      { value: p_id_traccion, name: "traccion" },
      { value: p_id_direccion, name: "direccion" },
    ];

    for (const f of fkFilters) {
      if (f.value !== null && !intPositive(f.value)) {
        return res.status(400).json({
          message: `${f.name} debe ser un entero positivo`,
        });
      }
    }

    if (p_km_min !== null && (!Number.isInteger(p_km_min) || p_km_min < 0)) {
      return res.status(400).json({
        message: "km_min debe ser un entero mayor o igual a 0",
      });
    }

    if (p_km_max !== null && (!Number.isInteger(p_km_max) || p_km_max < 0)) {
      return res.status(400).json({
        message: "km_max debe ser un entero mayor o igual a 0",
      });
    }

    if (
      p_km_min !== null &&
      p_km_max !== null &&
      p_km_min > p_km_max
    ) {
      return res.status(400).json({
        message: "km_min no puede ser mayor que km_max",
      });
    }

    if (
      p_puertas_min !== null &&
      (!Number.isInteger(p_puertas_min) || p_puertas_min <= 0)
    ) {
      return res.status(400).json({
        message: "puertas_min debe ser un entero mayor a 0",
      });
    }

    if (
      p_puertas_max !== null &&
      (!Number.isInteger(p_puertas_max) || p_puertas_max <= 0)
    ) {
      return res.status(400).json({
        message: "puertas_max debe ser un entero mayor a 0",
      });
    }

    if (
      p_puertas_min !== null &&
      p_puertas_max !== null &&
      p_puertas_min > p_puertas_max
    ) {
      return res.status(400).json({
        message: "puertas_min no puede ser mayor que puertas_max",
      });
    }

    const [rows] = await pool.query(
      "CALL SearchVehiculos(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        p_id_marca,
        p_precio_min,
        p_precio_max,
        p_id_combustible,
        p_es_usado,
        p_anio_min,
        p_anio_max,
        p_origen,
        p_id_color,
        p_id_tipo_vehiculo,
        p_id_transmision,
        p_id_traccion,
        p_id_direccion,
        p_km_min,
        p_km_max,
        p_puertas_min,
        p_puertas_max,
        p_page,
        p_page_size,
      ]
    );

    const total = rows[0]?.[0]?.total || 0;
    const results = rows[1] || [];

    return res.json({
      total,
      page: p_page,
      pageSize: p_page_size,
      results,
    });
  } catch (err) {
    return handleMySQLError(err, res, "Error buscando vehículos:");
  }
};
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const idVehiculo = Number(id);

    if (!Number.isInteger(idVehiculo) || idVehiculo <= 0) {
      return res.status(400).json({
        message: "id de vehículo inválido",
      });
    }

    const {
      id_marca,
      modelo,
      precio,
      id_combustible,
      origen,
      es_usado,
      anio,
      id_color,
      id_tipo_vehiculo,
      id_transmision,
      id_traccion,
      km,
      puertas,
      id_direccion,
    } = req.body;

    if (
      id_marca === undefined ||
      !modelo ||
      precio === undefined ||
      id_combustible === undefined ||
      !origen ||
      es_usado === undefined
    ) {
      return res.status(400).json({
        message:
          "id_marca, modelo, precio, id_combustible, origen y es_usado son requeridos",
      });
    }

    const idMarca = Number(id_marca);
    const idCombustible = Number(id_combustible);
    const precioNum = Number(precio);
    const esUsadoNum = Number(es_usado);

    const anioNum =
      anio === undefined || anio === null || anio === ""
        ? null
        : Number(anio);
    const idColorNum =
      id_color === undefined || id_color === null || id_color === ""
        ? null
        : Number(id_color);
    const idTipoVehiculoNum =
      id_tipo_vehiculo === undefined ||
      id_tipo_vehiculo === null ||
      id_tipo_vehiculo === ""
        ? null
        : Number(id_tipo_vehiculo);
    const idTransmisionNum =
      id_transmision === undefined ||
      id_transmision === null ||
      id_transmision === ""
        ? null
        : Number(id_transmision);
    const idTraccionNum =
      id_traccion === undefined || id_traccion === null || id_traccion === ""
        ? null
        : Number(id_traccion);
    const kmNum =
      km === undefined || km === null || km === "" ? null : Number(km);
    const puertasNum =
      puertas === undefined || puertas === null || puertas === ""
        ? null
        : Number(puertas);
    const idDireccionNum =
      id_direccion === undefined ||
      id_direccion === null ||
      id_direccion === ""
        ? null
        : Number(id_direccion);

    if (!Number.isInteger(idMarca) || idMarca <= 0) {
      return res
        .status(400)
        .json({ message: "id_marca debe ser entero positivo" });
    }

    if (!Number.isInteger(idCombustible) || idCombustible <= 0) {
      return res
        .status(400)
        .json({ message: "id_combustible debe ser entero positivo" });
    }

    if (Number.isNaN(precioNum) || precioNum <= 0) {
      return res.status(400).json({
        message: "precio debe ser un número mayor a 0",
      });
    }

    if (![0, 1].includes(esUsadoNum)) {
      return res.status(400).json({
        message: "es_usado debe ser 0 o 1",
      });
    }

    if (!["AGENCIA", "USADO_CLIENTE"].includes(origen)) {
      return res.status(400).json({
        message: "origen debe ser 'AGENCIA' o 'USADO_CLIENTE'",
      });
    }

    if (
      anioNum !== null &&
      (!Number.isInteger(anioNum) || anioNum < 1900 || anioNum > 2100)
    ) {
      return res.status(400).json({
        message: "anio debe ser un entero válido",
      });
    }

    if (kmNum !== null && (!Number.isInteger(kmNum) || kmNum < 0)) {
      return res.status(400).json({
        message: "km debe ser un entero mayor o igual a 0",
      });
    }

    if (
      puertasNum !== null &&
      (!Number.isInteger(puertasNum) || puertasNum <= 0)
    ) {
      return res.status(400).json({
        message: "puertas debe ser un entero mayor a 0",
      });
    }

    const fkFields = [
      { value: idColorNum, name: "id_color" },
      { value: idTipoVehiculoNum, name: "id_tipo_vehiculo" },
      { value: idTransmisionNum, name: "id_transmision" },
      { value: idTraccionNum, name: "id_traccion" },
      { value: idDireccionNum, name: "id_direccion" },
    ];

    for (const field of fkFields) {
      if (
        field.value !== null &&
        (!Number.isInteger(field.value) || field.value <= 0)
      ) {
        return res.status(400).json({
          message: `${field.name} debe ser un entero positivo`,
        });
      }
    }

    await pool.query("CALL UpdateVehiculoDatos(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [
      idVehiculo,
      idMarca,
      modelo.trim(),
      precioNum,
      idCombustible,
      origen,
      esUsadoNum,
      anioNum,
      idColorNum,
      idTipoVehiculoNum,
      idTransmisionNum,
      idTraccionNum,
      kmNum,
      puertasNum,
      idDireccionNum,
    ]);

    return res.json({
      message: "Vehículo actualizado correctamente",
    });
  } catch (err) {
    return handleMySQLError(err, res, "Error actualizando vehículo:");
  }
};
