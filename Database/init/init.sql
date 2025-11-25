-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Nov 25, 2025 at 12:10 PM
-- Server version: 8.0.44
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `concesionaria_db`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`%` PROCEDURE `ActualizarPasswordUsuario` (IN `p_id_usuario` INT, IN `p_password_hash` VARCHAR(255))   BEGIN
    IF p_id_usuario IS NULL OR p_id_usuario <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'ID_USUARIO_REQUERIDO';
    END IF;

    IF p_password_hash IS NULL OR LENGTH(p_password_hash) < 10 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'PASSWORD_HASH_INVALIDO';
    END IF;

    -- Inactivar credenciales anteriores activas
    UPDATE usuarios_credenciales
    SET es_activa = 0
    WHERE id_usuario = p_id_usuario
      AND es_activa = 1;

    -- Insertar nueva credencial activa
    INSERT INTO usuarios_credenciales (id_usuario, password_hash, es_activa)
    VALUES (p_id_usuario, p_password_hash, 1);
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `AddVehiculoImagen` (IN `p_id_vehiculo` INT, IN `p_url` VARCHAR(500), IN `p_img_perfil` TINYINT)   BEGIN
    DECLARE v_orden INT DEFAULT 0;

    IF p_img_perfil = 1 THEN
        UPDATE vehiculos_imagenes
        SET img_perfil = 0
        WHERE id_vehiculo = p_id_vehiculo;
    END IF;

    SELECT COALESCE(MAX(orden), 0) + 1
    INTO v_orden
    FROM vehiculos_imagenes
    WHERE id_vehiculo = p_id_vehiculo;

    INSERT INTO vehiculos_imagenes(id_vehiculo, url_imagen, orden, img_perfil)
    VALUES (p_id_vehiculo, p_url, v_orden, p_img_perfil);
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `CreateVehiculoPublicacion` (IN `p_id_marca` INT, IN `p_modelo` VARCHAR(100), IN `p_precio` DECIMAL(12,2), IN `p_id_combustible` INT, IN `p_origen` VARCHAR(20), IN `p_es_usado` TINYINT(1), IN `p_estado_inicial` VARCHAR(20), IN `p_anio` SMALLINT UNSIGNED, IN `p_id_color` INT, IN `p_id_tipo_vehiculo` INT, IN `p_id_transmision` INT, IN `p_id_traccion` INT, IN `p_km` INT UNSIGNED, IN `p_puertas` TINYINT UNSIGNED, IN `p_id_direccion` INT)   BEGIN
    DECLARE v_existe_marca         INT DEFAULT 0;
    DECLARE v_existe_combustible   INT DEFAULT 0;
    DECLARE v_existe_color         INT DEFAULT 0;
    DECLARE v_existe_tipo          INT DEFAULT 0;
    DECLARE v_existe_transmision   INT DEFAULT 0;
    DECLARE v_existe_traccion      INT DEFAULT 0;
    DECLARE v_existe_direccion     INT DEFAULT 0;

    -- Validaciones de nulos básicos
    IF p_id_marca IS NULL OR p_modelo IS NULL OR p_precio IS NULL
       OR p_id_combustible IS NULL OR p_origen IS NULL
       OR p_es_usado IS NULL OR p_estado_inicial IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Parámetros obligatorios nulos';
    END IF;

    -- Precio válido
    IF p_precio <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El precio debe ser mayor a 0';
    END IF;

    -- Estado inicial válido
    IF p_estado_inicial NOT IN ('EN_STOCK','EN_EVALUACION') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Estado inicial inválido';
    END IF;

    -- Validar origen
    IF p_origen NOT IN ('AGENCIA','USADO_CLIENTE') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Origen inválido';
    END IF;

    -- Validar año (si viene)
    IF p_anio IS NOT NULL AND (p_anio < 1900 OR p_anio > YEAR(CURDATE()) + 1) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Año de vehículo inválido';
    END IF;

    -- Validar km (si viene)
    IF p_km IS NOT NULL AND p_km < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Los kilómetros no pueden ser negativos';
    END IF;

    -- Validar puertas (si viene)
    IF p_puertas IS NOT NULL AND p_puertas <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La cantidad de puertas debe ser mayor a 0';
    END IF;

    -- Validar marca
    SELECT COUNT(*) INTO v_existe_marca
    FROM marcas
    WHERE id_marca = p_id_marca;

    IF v_existe_marca = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La marca especificada no existe';
    END IF;

    -- Validar combustible
    SELECT COUNT(*) INTO v_existe_combustible
    FROM combustibles
    WHERE id_combustible = p_id_combustible;

    IF v_existe_combustible = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El combustible especificado no existe';
    END IF;

    -- Validar color (si viene)
    IF p_id_color IS NOT NULL THEN
        SELECT COUNT(*) INTO v_existe_color
        FROM colores
        WHERE id_color = p_id_color;

        IF v_existe_color = 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'El color especificado no existe';
        END IF;
    END IF;

    -- Validar tipo de vehículo (si viene)
    IF p_id_tipo_vehiculo IS NOT NULL THEN
        SELECT COUNT(*) INTO v_existe_tipo
        FROM tipos_vehiculo
        WHERE id_tipo_vehiculo = p_id_tipo_vehiculo;

        IF v_existe_tipo = 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'El tipo de vehículo especificado no existe';
        END IF;
    END IF;

    -- Validar transmisión (si viene)
    IF p_id_transmision IS NOT NULL THEN
        SELECT COUNT(*) INTO v_existe_transmision
        FROM transmisiones
        WHERE id_transmision = p_id_transmision;

        IF v_existe_transmision = 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La transmisión especificada no existe';
        END IF;
    END IF;

    -- Validar tracción (si viene)
    IF p_id_traccion IS NOT NULL THEN
        SELECT COUNT(*) INTO v_existe_traccion
        FROM tracciones
        WHERE id_traccion = p_id_traccion;

        IF v_existe_traccion = 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La tracción especificada no existe';
        END IF;
    END IF;

    -- Validar dirección (si viene)
    IF p_id_direccion IS NOT NULL THEN
        SELECT COUNT(*) INTO v_existe_direccion
        FROM direcciones
        WHERE id_direccion = p_id_direccion;

        IF v_existe_direccion = 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La dirección especificada no existe';
        END IF;
    END IF;

    INSERT INTO vehiculos (
        id_marca,
        modelo,
        anio,
        id_color,
        id_tipo_vehiculo,
        id_transmision,
        id_traccion,
        km,
        puertas,
        id_direccion,
        precio,
        id_combustible,
        estado,
        origen,
        es_usado
    )
    VALUES (
        p_id_marca,
        p_modelo,
        p_anio,
        p_id_color,
        p_id_tipo_vehiculo,
        p_id_transmision,
        p_id_traccion,
        p_km,
        p_puertas,
        p_id_direccion,
        p_precio,
        p_id_combustible,
        p_estado_inicial,
        p_origen,
        p_es_usado
    );

    SELECT LAST_INSERT_ID() AS id_vehiculo;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `CreateVentaAuto` (IN `p_id_vehiculo` INT, IN `p_id_usuario` INT, IN `p_id_plan` INT, IN `p_pagos` JSON, IN `p_fecha` DATE)   BEGIN
  DECLARE v_fecha DATE;
  DECLARE v_total DECIMAL(12,2);
  DECLARE v_count INT;
  DECLARE v_index INT;
  DECLARE v_id_venta_auto INT;

  DECLARE v_id_metodo INT;
  DECLARE v_monto DECIMAL(12,2);
  DECLARE v_es_entregado TINYINT(1);

  DECLARE v_id_marca INT;
  DECLARE v_modelo VARCHAR(100);
  DECLARE v_anio INT;
  DECLARE v_id_color INT;
  DECLARE v_id_tipo_vehiculo INT;
  DECLARE v_id_transmision INT;
  DECLARE v_id_traccion INT;
  DECLARE v_km INT;
  DECLARE v_puertas TINYINT;
  DECLARE v_id_direccion INT;
  DECLARE v_id_combustible INT;
  DECLARE v_id_vehiculo_usado INT;

  DECLARE v_precio_vehiculo DECIMAL(12,2);
  DECLARE v_cuotas INT;
  DECLARE v_interes DECIMAL(5,2);
  DECLARE v_min_entrega DECIMAL(5,2);
  DECLARE v_monto_entrega DECIMAL(12,2);
  DECLARE v_principal DECIMAL(12,2);
  DECLARE v_total_con_interes DECIMAL(12,2);
  DECLARE v_monto_cuota DECIMAL(12,2);
  DECLARE v_i INT;

  -- Validaciones básicas
  IF p_id_vehiculo IS NULL OR p_id_usuario IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'id_vehiculo e id_usuario son obligatorios';
  END IF;

  SET v_fecha = COALESCE(p_fecha, CURDATE());

  SET v_count = COALESCE(JSON_LENGTH(p_pagos), 0);
  IF v_count = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Debe indicarse al menos un pago';
  END IF;

  -- Calcular total pagado y total de entrega (solo usados)
  SET v_index = 0;
  SET v_total = 0;
  SET v_monto_entrega = 0;

  WHILE v_index < v_count DO
    SET v_monto = JSON_UNQUOTE(JSON_EXTRACT(p_pagos, CONCAT('$[', v_index, '].monto')));
    IF v_monto IS NULL OR v_monto <= 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Todos los pagos deben tener monto > 0';
    END IF;

    SET v_total = v_total + v_monto;

    SET v_es_entregado = JSON_EXTRACT(p_pagos, CONCAT('$[', v_index, '].es_vehiculo_entregado'));
    IF v_es_entregado IS NULL THEN
      SET v_es_entregado = 0;
    END IF;

    IF v_es_entregado = 1 THEN
      SET v_monto_entrega = v_monto_entrega + v_monto;
    END IF;

    SET v_index = v_index + 1;
  END WHILE;

  START TRANSACTION;

  -- Precio del vehículo a vender
  SELECT precio INTO v_precio_vehiculo
  FROM vehiculos
  WHERE id_vehiculo = p_id_vehiculo
  FOR UPDATE;

  IF v_precio_vehiculo IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El vehículo indicado no existe';
  END IF;

  -- Datos del plan (si hay)
  IF p_id_plan IS NOT NULL THEN
    SELECT cuotas, interes, min_entrega
      INTO v_cuotas, v_interes, v_min_entrega
    FROM planes_pago
    WHERE id_plan = p_id_plan;

    IF v_cuotas IS NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El plan de pago indicado no existe';
    END IF;

    -- min_entrega: porcentaje sobre el precio, contra TODO lo pagado al inicio
    IF v_min_entrega > 0 THEN
      IF v_total < (v_precio_vehiculo * v_min_entrega / 100) THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'La entrega no alcanza el mínimo requerido para el plan';
      END IF;
    END IF;
  END IF;

  -- Insertar venta
  INSERT INTO venta_auto(
    id_vehiculo,
    id_usuario,
    id_plan,
    fecha,
    total_pagado,
    estado_venta
  ) VALUES (
    p_id_vehiculo,
    p_id_usuario,
    p_id_plan,
    v_fecha,
    v_total,
    'PENDIENTE'
  );

  SET v_id_venta_auto = LAST_INSERT_ID();

  -- Recorrer pagos: movimientos + vehículos usados entregados
  SET v_index = 0;
  WHILE v_index < v_count DO
    SET v_id_metodo = JSON_UNQUOTE(JSON_EXTRACT(p_pagos, CONCAT('$[', v_index, '].id_metodo')));
    SET v_monto     = JSON_UNQUOTE(JSON_EXTRACT(p_pagos, CONCAT('$[', v_index, '].monto')));
    SET v_es_entregado = JSON_EXTRACT(p_pagos, CONCAT('$[', v_index, '].es_vehiculo_entregado'));

    IF v_id_metodo IS NULL OR v_id_metodo <= 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cada pago debe tener un id_metodo válido';
    END IF;

    IF v_es_entregado IS NULL THEN
      SET v_es_entregado = 0;
    END IF;

    SET v_id_vehiculo_usado = NULL;

    IF v_es_entregado = 1 THEN
      SET v_id_marca         = JSON_UNQUOTE(JSON_EXTRACT(p_pagos, CONCAT('$[', v_index, '].id_marca')));
      SET v_modelo           = JSON_UNQUOTE(JSON_EXTRACT(p_pagos, CONCAT('$[', v_index, '].modelo')));
      SET v_anio             = JSON_UNQUOTE(JSON_EXTRACT(p_pagos, CONCAT('$[', v_index, '].anio')));
      SET v_id_color         = JSON_UNQUOTE(JSON_EXTRACT(p_pagos, CONCAT('$[', v_index, '].id_color')));
      SET v_id_tipo_vehiculo = JSON_UNQUOTE(JSON_EXTRACT(p_pagos, CONCAT('$[', v_index, '].id_tipo_vehiculo')));
      SET v_id_transmision   = JSON_UNQUOTE(JSON_EXTRACT(p_pagos, CONCAT('$[', v_index, '].id_transmision')));
      SET v_id_traccion      = JSON_UNQUOTE(JSON_EXTRACT(p_pagos, CONCAT('$[', v_index, '].id_traccion')));
      SET v_km               = JSON_UNQUOTE(JSON_EXTRACT(p_pagos, CONCAT('$[', v_index, '].km')));
      SET v_puertas          = JSON_UNQUOTE(JSON_EXTRACT(p_pagos, CONCAT('$[', v_index, '].puertas')));
      SET v_id_direccion     = JSON_UNQUOTE(JSON_EXTRACT(p_pagos, CONCAT('$[', v_index, '].id_direccion')));
      SET v_id_combustible   = JSON_UNQUOTE(JSON_EXTRACT(p_pagos, CONCAT('$[', v_index, '].id_combustible')));

      IF v_id_marca IS NULL OR v_modelo IS NULL OR v_id_combustible IS NULL THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Datos incompletos para vehículo entregado';
      END IF;

      INSERT INTO vehiculos (
        id_marca,
        modelo,
        anio,
        id_color,
        id_tipo_vehiculo,
        id_transmision,
        id_traccion,
        km,
        puertas,
        id_direccion,
        precio,
        id_combustible,
        estado,
        origen,
        es_usado
      ) VALUES (
        v_id_marca,
        v_modelo,
        v_anio,
        v_id_color,
        v_id_tipo_vehiculo,
        v_id_transmision,
        v_id_traccion,
        v_km,
        v_puertas,
        v_id_direccion,
        v_monto,
        v_id_combustible,
        'EN_EVALUACION',
        'USADO_CLIENTE',
        1
      );

      SET v_id_vehiculo_usado = LAST_INSERT_ID();
    END IF;

    INSERT INTO movimiento (
      id_venta_auto,
      id_metodo,
      tipo_movimiento,
      total,
      fecha,
      id_vehiculo_entregado
    ) VALUES (
      v_id_venta_auto,
      v_id_metodo,
      'ENTRADA',
      v_monto,
      NOW(),
      v_id_vehiculo_usado
    );

    SET v_index = v_index + 1;
  END WHILE;

  -- Generar cuotas si hay plan
  IF p_id_plan IS NOT NULL THEN
    -- ahora el principal es precio - TODO lo que pagaste al inicio
    SET v_principal = v_precio_vehiculo - v_total;
    IF v_principal < 0 THEN
      SET v_principal = 0;
    END IF;

    SET v_total_con_interes = v_principal * (1 + (v_interes / 100));

    IF v_cuotas > 0 THEN
      SET v_monto_cuota = ROUND(v_total_con_interes / v_cuotas, 2);
      SET v_i = 1;
      WHILE v_i <= v_cuotas DO
        INSERT INTO cuotas_venta (
          id_venta_auto,
          nro_cuota,
          monto,
          fecha_vencimiento,
          pagada
        ) VALUES (
          v_id_venta_auto,
          v_i,
          v_monto_cuota,
          DATE_ADD(v_fecha, INTERVAL v_i MONTH),
          0
        );
        SET v_i = v_i + 1;
      END WHILE;
    END IF;
  END IF;

  -- Marcar vehículo como vendido
  UPDATE vehiculos
  SET estado = 'VENDIDO'
  WHERE id_vehiculo = p_id_vehiculo;

  COMMIT;

  -- Respuesta para el backend
  SELECT v_id_venta_auto AS id_venta_auto;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetColores` ()   BEGIN
    SELECT 
        id_color,
        nombre
    FROM colores
    ORDER BY nombre;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetCombustibles` ()   BEGIN
    SELECT 
        id_combustible,
        nombre
    FROM combustibles
    ORDER BY nombre;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetCuotasByVenta` (IN `p_id_venta` INT)   BEGIN
    SELECT
        id_cuota,
        id_venta_auto,
        nro_cuota,
        monto,
        fecha_vencimiento,
        pagada
    FROM cuotas_venta
    WHERE id_venta_auto = p_id_venta
    ORDER BY nro_cuota;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetDirecciones` ()   BEGIN
    SELECT 
        id_direccion,
        nombre
    FROM direcciones
    ORDER BY nombre;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetMarcas` ()   BEGIN
    SELECT 
        id_marca,
        marca
    FROM marcas
    ORDER BY marca;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetMetodosPago` ()   BEGIN
    SELECT 
        id_metodo,
        metodo
    FROM metodos_pago
    ORDER BY metodo;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetMovimientos` (IN `p_desde` DATE, IN `p_hasta` DATE)   BEGIN
    SELECT
        m.id_movimiento,
        m.fecha,
        m.tipo_movimiento,
        m.total,
        
        m.id_metodo,
        mp.metodo,
        
        va.id_venta_auto,
        va.fecha         AS fecha_venta,
        va.estado_venta,
        
        u.id_usuario     AS id_cliente,
        u.nombre         AS nombre_cliente,
        u.telefono,
        u.email,
        
        v.id_vehiculo    AS id_vehiculo_vendido,
        mv.marca         AS marca_vehiculo_vendido,
        v.modelo         AS modelo_vehiculo_vendido,
        v.anio           AS anio_vehiculo_vendido,
        
        m.id_vehiculo_entregado,
        vu.id_vehiculo   AS id_vehiculo_usado,
        mu.marca         AS marca_vehiculo_usado,
        vu.modelo        AS modelo_vehiculo_usado,
        vu.anio          AS anio_vehiculo_usado
    FROM movimiento m
    JOIN metodos_pago mp
         ON m.id_metodo = mp.id_metodo
    JOIN venta_auto va
         ON m.id_venta_auto = va.id_venta_auto
    JOIN usuarios u
         ON va.id_usuario = u.id_usuario
    JOIN vehiculos v
         ON va.id_vehiculo = v.id_vehiculo
    JOIN marcas mv
         ON v.id_marca = mv.id_marca
    LEFT JOIN vehiculos vu
         ON m.id_vehiculo_entregado = vu.id_vehiculo
    LEFT JOIN marcas mu
         ON vu.id_marca = mu.id_marca
    WHERE m.fecha >= p_desde
      AND m.fecha < DATE_ADD(p_hasta, INTERVAL 1 DAY)
    ORDER BY m.fecha DESC, m.id_movimiento DESC;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetMovimientosByRangoFechas` (IN `p_desde` DATE, IN `p_hasta` DATE)   BEGIN
  SELECT
    m.id_movimiento,
    m.fecha,
    m.tipo_movimiento,
    m.total,
    m.id_metodo,
    mp.metodo,
    va.id_venta_auto,
    va.fecha      AS fecha_venta,
    va.estado_venta,
    u.id_usuario  AS id_cliente,
    u.nombre      AS nombre_cliente,
    u.telefono,
    u.email,
    v.id_vehiculo AS id_vehiculo_vendido,
    mv.marca      AS marca_vehiculo_vendido,
    v.modelo      AS modelo_vehiculo_vendido,
    v.anio        AS anio_vehiculo_vendido,
    m.id_vehiculo_entregado,
    vu.id_vehiculo AS id_vehiculo_usado,
    mu.marca       AS marca_vehiculo_usado,
    vu.modelo      AS modelo_vehiculo_usado,
    vu.anio        AS anio_vehiculo_usado
  FROM movimiento m
  JOIN metodos_pago mp
       ON m.id_metodo = mp.id_metodo
  JOIN venta_auto va
       ON m.id_venta_auto = va.id_venta_auto
  JOIN usuarios u
       ON va.id_usuario = u.id_usuario
  JOIN vehiculos v
       ON va.id_vehiculo = v.id_vehiculo
  JOIN marcas mv
       ON v.id_marca = mv.id_marca
  LEFT JOIN vehiculos vu
       ON m.id_vehiculo_entregado = vu.id_vehiculo
  LEFT JOIN marcas mu
       ON vu.id_marca = mu.id_marca
  WHERE m.fecha >= p_desde
    AND m.fecha < DATE_ADD(p_hasta, INTERVAL 1 DAY)
  ORDER BY m.fecha DESC, m.id_movimiento DESC;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetMovimientosUsuarioByRangoFechas` (IN `p_id_usuario` INT, IN `p_desde` DATE, IN `p_hasta` DATE)   BEGIN
  IF p_id_usuario IS NULL OR p_id_usuario <= 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'p_id_usuario es obligatorio y debe ser > 0';
  END IF;

  SELECT
    m.id_movimiento,
    m.fecha,
    m.tipo_movimiento,
    m.total,
    m.id_metodo,
    mp.metodo,
    va.id_venta_auto,
    va.fecha      AS fecha_venta,
    va.estado_venta,
    u.id_usuario  AS id_cliente,
    u.nombre      AS nombre_cliente,
    u.telefono,
    u.email,
    v.id_vehiculo AS id_vehiculo_vendido,
    mv.marca      AS marca_vehiculo_vendido,
    v.modelo      AS modelo_vehiculo_vendido,
    v.anio        AS anio_vehiculo_vendido,
    m.id_vehiculo_entregado,
    vu.id_vehiculo AS id_vehiculo_usado,
    mu.marca       AS marca_vehiculo_usado,
    vu.modelo      AS modelo_vehiculo_usado,
    vu.anio        AS anio_vehiculo_usado
  FROM movimiento m
  JOIN metodos_pago mp ON m.id_metodo = mp.id_metodo
  JOIN venta_auto va   ON m.id_venta_auto = va.id_venta_auto
  JOIN usuarios u      ON va.id_usuario = u.id_usuario
  JOIN vehiculos v     ON va.id_vehiculo = v.id_vehiculo
  JOIN marcas mv       ON v.id_marca = mv.id_marca
  LEFT JOIN vehiculos vu ON m.id_vehiculo_entregado = vu.id_vehiculo
  LEFT JOIN marcas mu    ON vu.id_marca = mu.id_marca
  WHERE m.fecha >= p_desde
    AND m.fecha < DATE_ADD(p_hasta, INTERVAL 1 DAY)
    AND u.id_usuario = p_id_usuario
  ORDER BY m.fecha DESC, m.id_movimiento DESC;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetPlanesPago` ()   BEGIN
    SELECT 
        id_plan,
        cuotas,
        interes,
        min_entrega
    FROM planes_pago
    ORDER BY cuotas, id_plan;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetResumenVentasByRangoFechas` (IN `p_desde` DATE, IN `p_hasta` DATE)   BEGIN
  SELECT
    COUNT(*)                                              AS cantidad_ventas,
    COALESCE(SUM(va.total_pagado), 0)                     AS monto_total,
    COALESCE(AVG(va.total_pagado), 0)                     AS monto_promedio,
    COALESCE(SUM(CASE WHEN va.estado_venta = 'APROBADA'
                      THEN va.total_pagado END), 0)       AS monto_aprobadas,
    COALESCE(SUM(CASE WHEN va.estado_venta = 'PENDIENTE'
                      THEN va.total_pagado END), 0)       AS monto_pendientes,
    COALESCE(SUM(CASE WHEN va.estado_venta = 'RECHAZADA'
                      THEN va.total_pagado END), 0)       AS monto_rechazadas
  FROM venta_auto va
  WHERE va.fecha BETWEEN p_desde AND p_hasta;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetResumenVentasUsuarioByRangoFechas` (IN `p_id_usuario` INT, IN `p_desde` DATE, IN `p_hasta` DATE)   BEGIN
  IF p_id_usuario IS NULL OR p_id_usuario <= 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'p_id_usuario es obligatorio y debe ser > 0';
  END IF;

  SELECT
    COUNT(*)                                              AS cantidad_ventas,
    COALESCE(SUM(va.total_pagado), 0)                     AS monto_total,
    COALESCE(AVG(va.total_pagado), 0)                     AS monto_promedio,
    COALESCE(SUM(CASE WHEN va.estado_venta = 'APROBADA'
                      THEN va.total_pagado END), 0)       AS monto_aprobadas,
    COALESCE(SUM(CASE WHEN va.estado_venta = 'PENDIENTE'
                      THEN va.total_pagado END), 0)       AS monto_pendientes,
    COALESCE(SUM(CASE WHEN va.estado_venta = 'RECHAZADA'
                      THEN va.total_pagado END), 0)       AS monto_rechazadas
  FROM venta_auto va
  WHERE va.fecha BETWEEN p_desde AND p_hasta
    AND va.id_usuario = p_id_usuario;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetTiposVehiculo` ()   BEGIN
    SELECT 
        id_tipo_vehiculo,
        nombre
    FROM tipos_vehiculo
    ORDER BY nombre;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetTracciones` ()   BEGIN
    SELECT 
        id_traccion,
        nombre
    FROM tracciones
    ORDER BY nombre;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetTransmisiones` ()   BEGIN
    SELECT 
        id_transmision,
        nombre
    FROM transmisiones
    ORDER BY nombre;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetUsuarios` ()   BEGIN
    SELECT 
        u.id_usuario,
        u.nombre,
        u.telefono,
        u.email,
        u.id_rol,
        r.rol
    FROM usuarios u
    LEFT JOIN roles r ON u.id_rol = r.id_rol
    ORDER BY u.nombre;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetVehiculoAniosDisponibles` ()   BEGIN
    SELECT DISTINCT
        anio
    FROM vehiculos
    WHERE anio IS NOT NULL
    ORDER BY anio DESC;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetVehiculoById` (IN `p_id` INT)   BEGIN
    SELECT 
        v.id_vehiculo,
        v.modelo,
        v.anio,
        v.precio,
        v.estado,
        v.origen,
        v.es_usado,
        v.km,
        v.puertas,

        v.id_marca,
        m.marca,

        v.id_combustible,
        c.nombre AS combustible,

        v.id_color,
        col.nombre AS color,

        v.id_tipo_vehiculo,
        tv.nombre AS tipo_vehiculo,

        v.id_transmision,
        tr.nombre AS transmision,

        v.id_traccion,
        tc.nombre AS traccion,

        v.id_direccion,
        d.nombre AS direccion,

        (
            SELECT url_imagen
            FROM vehiculos_imagenes vi
            WHERE vi.id_vehiculo = v.id_vehiculo
              AND vi.img_perfil = 1
            LIMIT 1
        ) AS imagen_perfil
    FROM vehiculos v
    JOIN marcas m           ON v.id_marca = m.id_marca
    JOIN combustibles c     ON v.id_combustible = c.id_combustible
    LEFT JOIN colores col           ON v.id_color = col.id_color
    LEFT JOIN tipos_vehiculo tv     ON v.id_tipo_vehiculo = tv.id_tipo_vehiculo
    LEFT JOIN transmisiones tr      ON v.id_transmision = tr.id_transmision
    LEFT JOIN tracciones tc         ON v.id_traccion = tc.id_traccion
    LEFT JOIN direcciones d         ON v.id_direccion = d.id_direccion
    WHERE v.id_vehiculo = p_id;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetVehiculoImagenes` (IN `p_id` INT)   BEGIN
    SELECT 
        id_imagen,
        url_imagen,
        orden,
        img_perfil
    FROM vehiculos_imagenes
    WHERE id_vehiculo = p_id
    ORDER BY img_perfil DESC, orden ASC;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetVehiculos` ()   BEGIN
    SELECT 
        v.id_vehiculo,
        m.marca,
        v.modelo,
        v.precio,
        c.nombre AS combustible,
        v.estado,
        v.origen,
        v.es_usado,
        (
            SELECT url_imagen
            FROM vehiculos_imagenes
            WHERE id_vehiculo = v.id_vehiculo
              AND img_perfil = 1
            LIMIT 1
        ) AS imagen
    FROM vehiculos v
    JOIN marcas m ON v.id_marca = m.id_marca
    JOIN combustibles c ON v.id_combustible = c.id_combustible
    WHERE v.estado IN ('EN_STOCK', 'EN_EVALUACION');
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetVentas` (IN `p_desde` DATE, IN `p_hasta` DATE)   BEGIN
    SELECT
        va.id_venta_auto,
        va.fecha,
        va.total_pagado,
        va.estado_venta,
        va.id_plan,
        p.cuotas,
        p.interes,
        
        u.id_usuario       AS id_cliente,
        u.nombre           AS nombre_cliente,
        u.telefono,
        u.email,
        
        v.id_vehiculo,
        m.marca,
        v.modelo,
        v.anio,
        v.precio           AS precio_publicado
    FROM venta_auto va
    JOIN usuarios u   ON va.id_usuario  = u.id_usuario
    JOIN vehiculos v  ON va.id_vehiculo = v.id_vehiculo
    JOIN marcas m     ON v.id_marca     = m.id_marca
    LEFT JOIN planes_pago p 
           ON va.id_plan = p.id_plan
    WHERE va.fecha BETWEEN p_desde AND p_hasta
    ORDER BY va.fecha DESC, va.id_venta_auto DESC;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetVentasByRangoFechas` (IN `p_desde` DATE, IN `p_hasta` DATE)   BEGIN
  SELECT
    va.id_venta_auto,
    va.fecha,
    va.total_pagado,
    va.estado_venta,
    va.id_plan,
    p.cuotas,
    p.interes,
    u.id_usuario AS id_cliente,
    u.nombre     AS nombre_cliente,
    u.telefono,
    u.email,
    v.id_vehiculo,
    m.marca,
    v.modelo,
    v.anio,
    v.precio     AS precio_publicado
  FROM venta_auto va
  JOIN usuarios  u ON va.id_usuario  = u.id_usuario
  JOIN vehiculos v ON va.id_vehiculo = v.id_vehiculo
  JOIN marcas    m ON v.id_marca     = m.id_marca
  LEFT JOIN planes_pago p ON va.id_plan = p.id_plan
  WHERE va.fecha BETWEEN p_desde AND p_hasta
  ORDER BY va.fecha DESC, va.id_venta_auto DESC;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetVentasResumen` (IN `p_desde` DATE, IN `p_hasta` DATE)   BEGIN
    SELECT
        COUNT(*)                                              AS cantidad_ventas,
        COALESCE(SUM(va.total_pagado), 0)                     AS monto_total,
        COALESCE(AVG(va.total_pagado), 0)                     AS monto_promedio,
        COALESCE(SUM(CASE WHEN va.estado_venta = 'APROBADA' 
                          THEN va.total_pagado END), 0)       AS monto_aprobadas,
        COALESCE(SUM(CASE WHEN va.estado_venta = 'PENDIENTE' 
                          THEN va.total_pagado END), 0)       AS monto_pendientes,
        COALESCE(SUM(CASE WHEN va.estado_venta = 'RECHAZADA' 
                          THEN va.total_pagado END), 0)       AS monto_rechazadas
    FROM venta_auto va
    WHERE va.fecha BETWEEN p_desde AND p_hasta;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GetVentasUsuarioByRangoFechas` (IN `p_id_usuario` INT, IN `p_desde` DATE, IN `p_hasta` DATE)   BEGIN
  IF p_id_usuario IS NULL OR p_id_usuario <= 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'p_id_usuario es obligatorio y debe ser > 0';
  END IF;

  SELECT
    va.id_venta_auto,
    va.fecha,
    va.total_pagado,
    va.estado_venta,
    va.id_plan,
    p.cuotas,
    p.interes,
    u.id_usuario AS id_cliente,
    u.nombre     AS nombre_cliente,
    u.telefono,
    u.email,
    v.id_vehiculo,
    m.marca,
    v.modelo,
    v.anio,
    v.precio     AS precio_publicado
  FROM venta_auto va
  JOIN usuarios  u ON va.id_usuario  = u.id_usuario
  JOIN vehiculos v ON va.id_vehiculo = v.id_vehiculo
  JOIN marcas    m ON v.id_marca     = m.id_marca
  LEFT JOIN planes_pago p ON va.id_plan = p.id_plan
  WHERE va.fecha BETWEEN p_desde AND p_hasta
    AND u.id_usuario = p_id_usuario
  ORDER BY va.fecha DESC, va.id_venta_auto DESC;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `InactivarVehiculoPublicacion` (IN `p_id_vehiculo` INT)   BEGIN
    DECLARE v_existe_vehiculo INT DEFAULT 0;
    DECLARE v_estado_actual VARCHAR(20);

    IF p_id_vehiculo IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Parámetro id_vehiculo es obligatorio';
    END IF;

    SELECT COUNT(*), MAX(estado) INTO v_existe_vehiculo, v_estado_actual
    FROM vehiculos
    WHERE id_vehiculo = p_id_vehiculo;

    IF v_existe_vehiculo = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El vehículo especificado no existe';
    END IF;

    -- Opcional: no permitir inactivar si ya está vendido
    IF v_estado_actual = 'VENDIDO' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No se puede inactivar un vehículo ya vendido';
    END IF;

    UPDATE vehiculos
    SET estado = 'INACTIVO'
    WHERE id_vehiculo = p_id_vehiculo;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `LoginUsuario` (IN `p_email` VARCHAR(100))   BEGIN
    IF p_email IS NULL OR TRIM(p_email) = '' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'EMAIL_REQUERIDO';
    END IF;

    SELECT 
        u.id_usuario,
        u.nombre,
        u.email,
        u.id_rol,
        c.password_hash,
        c.es_activa,
        c.creada_en
    FROM usuarios u
    JOIN usuarios_credenciales c 
        ON u.id_usuario = c.id_usuario
    WHERE u.email = p_email
      AND c.es_activa = 1
    ORDER BY c.creada_en DESC
    LIMIT 1;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `PagarCuota` (IN `p_id_cuota` INT, IN `p_id_metodo` INT, IN `p_monto` DECIMAL(12,2))   BEGIN
    DECLARE v_id_venta INT;
    DECLARE v_monto_cuota DECIMAL(12,2);
    DECLARE v_pagada TINYINT(1);

    IF p_id_cuota IS NULL OR p_id_cuota <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El id de cuota es obligatorio y debe ser mayor a 0';
    END IF;

    IF p_id_metodo IS NULL OR p_id_metodo <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El método de pago es obligatorio';
    END IF;

    -- Traer datos de la cuota
    SELECT id_venta_auto, monto, pagada
    INTO v_id_venta, v_monto_cuota, v_pagada
    FROM cuotas_venta
    WHERE id_cuota = p_id_cuota;

    IF v_id_venta IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La cuota indicada no existe';
    END IF;

    IF v_pagada = 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La cuota ya está pagada';
    END IF;

    -- Validar que el método exista
    IF NOT EXISTS (SELECT 1 FROM metodos_pago WHERE id_metodo = p_id_metodo) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El método de pago indicado no existe';
    END IF;

    -- Si no mandan monto, usamos el monto de la cuota
    IF p_monto IS NULL OR p_monto <= 0 THEN
        SET p_monto = v_monto_cuota;
    END IF;

    -- Insertar movimiento tipo CUOTA
    INSERT INTO movimiento (
        id_venta_auto,
        id_metodo,
        tipo_movimiento,
        total,
        fecha,
        id_vehiculo_entregado
    ) VALUES (
        v_id_venta,
        p_id_metodo,
        'CUOTA',
        p_monto,
        NOW(),
        NULL
    );

    -- Marcar cuota como pagada
    UPDATE cuotas_venta
    SET pagada = 1
    WHERE id_cuota = p_id_cuota;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `PayCuotaVenta` (IN `p_id_venta` INT, IN `p_id_cuota` INT, IN `p_id_metodo` INT, IN `p_monto` DECIMAL(12,2))   BEGIN
    DECLARE v_monto DECIMAL(12,2);
    DECLARE v_fecha DATE;

    -- Tomamos datos de la cuota (y bloqueamos fila)
    SELECT monto, fecha_vencimiento
    INTO v_monto, v_fecha
    FROM cuotas_venta
    WHERE id_cuota = p_id_cuota
      AND id_venta_auto = p_id_venta
    FOR UPDATE;

    IF v_monto IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cuota no encontrada para esa venta';
    END IF;

    -- Marcamos cuota pagada
    UPDATE cuotas_venta
    SET pagada = 1
    WHERE id_cuota = p_id_cuota
      AND id_venta_auto = p_id_venta;

    -- Insertamos movimiento de CUOTA
    INSERT INTO movimiento (
        id_venta_auto,
        id_metodo,
        tipo_movimiento,
        total,
        fecha,
        id_vehiculo_entregado
    )
    VALUES (
        p_id_venta,
        p_id_metodo,
        'CUOTA',
        COALESCE(p_monto, v_monto),
        NOW(),
        NULL
    );

    -- Actualizamos total_pagado en la venta
    UPDATE venta_auto
    SET total_pagado = total_pagado + COALESCE(p_monto, v_monto)
    WHERE id_venta_auto = p_id_venta;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `ReordenarVehiculoImagen` (IN `p_id_vehiculo` INT, IN `p_id_imagen` INT, IN `p_nuevo_orden` INT)   BEGIN
    DECLARE v_existe_vehiculo INT DEFAULT 0;
    DECLARE v_existe_imagen INT DEFAULT 0;
    DECLARE v_orden_actual INT DEFAULT 0;
    DECLARE v_cantidad INT DEFAULT 0;

    -- Validaciones básicas de nulos
    IF p_id_vehiculo IS NULL OR p_id_imagen IS NULL OR p_nuevo_orden IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Parámetros obligatorios nulos';
    END IF;

    -- Validación de rango de orden
    IF p_nuevo_orden <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El nuevo orden debe ser mayor a 0';
    END IF;

    -- Verificar que exista el vehículo
    SELECT COUNT(*) INTO v_existe_vehiculo
    FROM vehiculos
    WHERE id_vehiculo = p_id_vehiculo;

    IF v_existe_vehiculo = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El vehículo especificado no existe';
    END IF;

    -- Cantidad de imágenes del vehículo
    SELECT COUNT(*) INTO v_cantidad
    FROM vehiculos_imagenes
    WHERE id_vehiculo = p_id_vehiculo;

    IF v_cantidad = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El vehículo no tiene imágenes para reordenar';
    END IF;

    -- Validar que el nuevo orden no supere la cantidad
    IF p_nuevo_orden > v_cantidad THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El nuevo orden supera la cantidad de imágenes';
    END IF;

    -- Validar que la imagen pertenezca al vehículo
    SELECT COUNT(*) INTO v_existe_imagen
    FROM vehiculos_imagenes
    WHERE id_imagen = p_id_imagen
      AND id_vehiculo = p_id_vehiculo;

    IF v_existe_imagen = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La imagen no pertenece al vehículo indicado';
    END IF;

    -- Orden actual de la imagen
    SELECT orden INTO v_orden_actual
    FROM vehiculos_imagenes
    WHERE id_imagen = p_id_imagen;

    -- Si el orden no cambia, no hacemos nada
    IF p_nuevo_orden <> v_orden_actual THEN

        -- Mover hacia arriba en la lista
        IF p_nuevo_orden < v_orden_actual THEN
            UPDATE vehiculos_imagenes
            SET orden = orden + 1
            WHERE id_vehiculo = p_id_vehiculo
              AND orden >= p_nuevo_orden
              AND orden < v_orden_actual;

        -- Mover hacia abajo en la lista
        ELSEIF p_nuevo_orden > v_orden_actual THEN
            UPDATE vehiculos_imagenes
            SET orden = orden - 1
            WHERE id_vehiculo = p_id_vehiculo
              AND orden <= p_nuevo_orden
              AND orden > v_orden_actual;
        END IF;

        -- Finalmente, asignar el nuevo orden a la imagen seleccionada
        UPDATE vehiculos_imagenes
        SET orden = p_nuevo_orden
        WHERE id_imagen = p_id_imagen;
    END IF;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `SearchVehiculos` (IN `p_id_marca` INT, IN `p_precio_min` DECIMAL(12,2), IN `p_precio_max` DECIMAL(12,2), IN `p_id_combustible` INT, IN `p_es_usado` TINYINT, IN `p_anio_min` INT, IN `p_anio_max` INT, IN `p_origen` VARCHAR(20), IN `p_id_color` INT, IN `p_id_tipo_vehiculo` INT, IN `p_id_transmision` INT, IN `p_id_traccion` INT, IN `p_id_direccion` INT, IN `p_km_min` INT, IN `p_km_max` INT, IN `p_puertas_min` TINYINT, IN `p_puertas_max` TINYINT, IN `p_page` INT, IN `p_page_size` INT)   BEGIN
    DECLARE v_offset INT DEFAULT 0;
    DECLARE v_limit  INT DEFAULT 20;

    -- Normalizar page
    IF p_page IS NOT NULL AND p_page > 0 THEN
        SET v_offset = (p_page - 1) * p_page_size;
    ELSE
        SET v_offset = 0;
    END IF;

    -- Normalizar page_size (límite razonable)
    IF p_page_size IS NOT NULL AND p_page_size > 0 AND p_page_size <= 100 THEN
        SET v_limit = p_page_size;
    ELSE
        SET v_limit = 20;
    END IF;

    -- Total para paginación
    SELECT COUNT(*) AS total
    FROM vehiculos v
    WHERE v.estado IN ('EN_STOCK', 'EN_EVALUACION')
      AND (p_id_marca         IS NULL OR v.id_marca         = p_id_marca)
      AND (p_id_combustible   IS NULL OR v.id_combustible   = p_id_combustible)
      AND (p_es_usado         IS NULL OR v.es_usado         = p_es_usado)
      AND (p_origen           IS NULL OR v.origen           = p_origen)
      AND (p_precio_min       IS NULL OR v.precio           >= p_precio_min)
      AND (p_precio_max       IS NULL OR v.precio           <= p_precio_max)
      AND (p_anio_min         IS NULL OR v.anio             >= p_anio_min)
      AND (p_anio_max         IS NULL OR v.anio             <= p_anio_max)
      AND (p_id_color         IS NULL OR v.id_color         = p_id_color)
      AND (p_id_tipo_vehiculo IS NULL OR v.id_tipo_vehiculo = p_id_tipo_vehiculo)
      AND (p_id_transmision   IS NULL OR v.id_transmision   = p_id_transmision)
      AND (p_id_traccion      IS NULL OR v.id_traccion      = p_id_traccion)
      AND (p_id_direccion     IS NULL OR v.id_direccion     = p_id_direccion)
      AND (p_km_min           IS NULL OR v.km               >= p_km_min)
      AND (p_km_max           IS NULL OR v.km               <= p_km_max)
      AND (p_puertas_min      IS NULL OR v.puertas          >= p_puertas_min)
      AND (p_puertas_max      IS NULL OR v.puertas          <= p_puertas_max);

    -- Página de resultados
    SELECT
        v.id_vehiculo,
        m.marca,
        v.modelo,
        v.anio,
        v.precio,
        c.nombre AS combustible,
        v.estado,
        v.origen,
        v.es_usado,
        v.km,
        v.puertas,
        col.nombre AS color,
        tv.nombre  AS tipo_vehiculo,
        tr.nombre  AS transmision,
        tc.nombre  AS traccion,
        d.nombre   AS direccion,
        (
            SELECT url_imagen
            FROM vehiculos_imagenes vi
            WHERE vi.id_vehiculo = v.id_vehiculo
              AND vi.img_perfil = 1
            LIMIT 1
        ) AS imagen
    FROM vehiculos v
    JOIN marcas m           ON v.id_marca = m.id_marca
    JOIN combustibles c     ON v.id_combustible = c.id_combustible
    LEFT JOIN colores col           ON v.id_color = col.id_color
    LEFT JOIN tipos_vehiculo tv     ON v.id_tipo_vehiculo = tv.id_tipo_vehiculo
    LEFT JOIN transmisiones tr      ON v.id_transmision = tr.id_transmision
    LEFT JOIN tracciones tc         ON v.id_traccion = tc.id_traccion
    LEFT JOIN direcciones d         ON v.id_direccion = d.id_direccion
    WHERE v.estado IN ('EN_STOCK', 'EN_EVALUACION')
      AND (p_id_marca         IS NULL OR v.id_marca         = p_id_marca)
      AND (p_id_combustible   IS NULL OR v.id_combustible   = p_id_combustible)
      AND (p_es_usado         IS NULL OR v.es_usado         = p_es_usado)
      AND (p_origen           IS NULL OR v.origen           = p_origen)
      AND (p_precio_min       IS NULL OR v.precio           >= p_precio_min)
      AND (p_precio_max       IS NULL OR v.precio           <= p_precio_max)
      AND (p_anio_min         IS NULL OR v.anio             >= p_anio_min)
      AND (p_anio_max         IS NULL OR v.anio             <= p_anio_max)
      AND (p_id_color         IS NULL OR v.id_color         = p_id_color)
      AND (p_id_tipo_vehiculo IS NULL OR v.id_tipo_vehiculo = p_id_tipo_vehiculo)
      AND (p_id_transmision   IS NULL OR v.id_transmision   = p_id_transmision)
      AND (p_id_traccion      IS NULL OR v.id_traccion      = p_id_traccion)
      AND (p_id_direccion     IS NULL OR v.id_direccion     = p_id_direccion)
      AND (p_km_min           IS NULL OR v.km               >= p_km_min)
      AND (p_km_max           IS NULL OR v.km               <= p_km_max)
      AND (p_puertas_min      IS NULL OR v.puertas          >= p_puertas_min)
      AND (p_puertas_max      IS NULL OR v.puertas          <= p_puertas_max)
    ORDER BY v.id_vehiculo DESC
    LIMIT v_offset, v_limit;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `SetVehiculoImagenPerfil` (IN `p_id_vehiculo` INT, IN `p_id_imagen` INT)   BEGIN
    DECLARE v_existe_vehiculo INT DEFAULT 0;
    DECLARE v_existe_imagen INT DEFAULT 0;

    IF p_id_vehiculo IS NULL OR p_id_imagen IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Parámetros obligatorios nulos';
    END IF;

    SELECT COUNT(*) INTO v_existe_vehiculo
    FROM vehiculos
    WHERE id_vehiculo = p_id_vehiculo;

    IF v_existe_vehiculo = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El vehículo especificado no existe';
    END IF;

    SELECT COUNT(*) INTO v_existe_imagen
    FROM vehiculos_imagenes
    WHERE id_imagen = p_id_imagen
      AND id_vehiculo = p_id_vehiculo;

    IF v_existe_imagen = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La imagen no pertenece al vehículo indicado';
    END IF;

    -- Sacar perfil a todas
    UPDATE vehiculos_imagenes
    SET img_perfil = 0
    WHERE id_vehiculo = p_id_vehiculo;

    -- Marcar como perfil la elegida
    UPDATE vehiculos_imagenes
    SET img_perfil = 1
    WHERE id_vehiculo = p_id_vehiculo
      AND id_imagen = p_id_imagen;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `UpdateVehiculoDatos` (IN `p_id_vehiculo` INT, IN `p_id_marca` INT, IN `p_modelo` VARCHAR(100), IN `p_precio` DECIMAL(12,2), IN `p_id_combustible` INT, IN `p_origen` VARCHAR(20), IN `p_es_usado` TINYINT, IN `p_anio` SMALLINT, IN `p_id_color` INT, IN `p_id_tipo_vehiculo` INT, IN `p_id_transmision` INT, IN `p_id_traccion` INT, IN `p_km` INT, IN `p_puertas` TINYINT, IN `p_id_direccion` INT)   BEGIN
  DECLARE v_existe_vehiculo INT DEFAULT 0;

  IF p_id_vehiculo IS NULL
     OR p_id_marca IS NULL
     OR p_modelo IS NULL
     OR p_precio IS NULL
     OR p_id_combustible IS NULL
     OR p_origen IS NULL
     OR p_es_usado IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Parámetros obligatorios nulos';
  END IF;

  IF p_precio <= 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El precio debe ser mayor que 0';
  END IF;

  IF p_origen NOT IN ('AGENCIA','USADO_CLIENTE') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Origen de vehículo inválido';
  END IF;

  IF p_es_usado NOT IN (0,1) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Valor de es_usado inválido';
  END IF;

  SELECT COUNT(*) INTO v_existe_vehiculo
  FROM vehiculos
  WHERE id_vehiculo = p_id_vehiculo;

  IF v_existe_vehiculo = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El vehículo especificado no existe';
  END IF;

  UPDATE vehiculos
  SET
    id_marca         = p_id_marca,
    modelo           = p_modelo,
    precio           = p_precio,
    id_combustible   = p_id_combustible,
    origen           = p_origen,
    es_usado         = p_es_usado,
    anio             = p_anio,
    id_color         = p_id_color,
    id_tipo_vehiculo = p_id_tipo_vehiculo,
    id_transmision   = p_id_transmision,
    id_traccion      = p_id_traccion,
    km               = p_km,
    puertas          = p_puertas,
    id_direccion     = p_id_direccion
  WHERE id_vehiculo = p_id_vehiculo;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `UpdateVehiculoEstado` (IN `p_id_vehiculo` INT, IN `p_estado` VARCHAR(20))   BEGIN
    DECLARE v_existe_vehiculo INT DEFAULT 0;

    IF p_id_vehiculo IS NULL OR p_estado IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Parámetros obligatorios nulos';
    END IF;

    -- Validar estado
    IF p_estado NOT IN ('EN_EVALUACION','EN_STOCK','VENDIDO','RECHAZADO','INACTIVO') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Estado de vehículo inválido';
    END IF;

    SELECT COUNT(*) INTO v_existe_vehiculo
    FROM vehiculos
    WHERE id_vehiculo = p_id_vehiculo;

    IF v_existe_vehiculo = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El vehículo especificado no existe';
    END IF;

    UPDATE vehiculos
    SET estado = p_estado
    WHERE id_vehiculo = p_id_vehiculo;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `colores`
--

CREATE TABLE `colores` (
  `id_color` int NOT NULL,
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `colores`
--

INSERT INTO `colores` (`id_color`, `nombre`) VALUES
(1, 'Blanco'),
(2, 'Negro'),
(3, 'Gris'),
(4, 'Rojo'),
(5, 'Azul'),
(6, 'Plateado');

-- --------------------------------------------------------

--
-- Table structure for table `combustibles`
--

CREATE TABLE `combustibles` (
  `id_combustible` int NOT NULL,
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `combustibles`
--

INSERT INTO `combustibles` (`id_combustible`, `nombre`) VALUES
(1, 'Nafta'),
(2, 'Diésel'),
(3, 'Híbrido'),
(4, 'Eléctrico');

-- --------------------------------------------------------

--
-- Table structure for table `cuotas_venta`
--

CREATE TABLE `cuotas_venta` (
  `id_cuota` int NOT NULL,
  `id_venta_auto` int NOT NULL,
  `nro_cuota` int NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `pagada` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cuotas_venta`
--

INSERT INTO `cuotas_venta` (`id_cuota`, `id_venta_auto`, `nro_cuota`, `monto`, `fecha_vencimiento`, `pagada`) VALUES
(31, 5, 1, 583333.33, '2025-12-21', 1),
(32, 5, 2, 583333.33, '2026-01-21', 1),
(33, 5, 3, 583333.33, '2026-02-21', 0),
(34, 5, 4, 583333.33, '2026-03-21', 0),
(35, 5, 5, 583333.33, '2026-04-21', 0),
(36, 5, 6, 583333.33, '2026-05-21', 0);

-- --------------------------------------------------------

--
-- Table structure for table `direcciones`
--

CREATE TABLE `direcciones` (
  `id_direccion` int NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `direcciones`
--

INSERT INTO `direcciones` (`id_direccion`, `nombre`) VALUES
(4, 'Eléctrica'),
(3, 'Electrohidráulica'),
(2, 'Hidráulica'),
(1, 'Mecánica');

-- --------------------------------------------------------

--
-- Table structure for table `marcas`
--

CREATE TABLE `marcas` (
  `id_marca` int NOT NULL,
  `marca` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `marcas`
--

INSERT INTO `marcas` (`id_marca`, `marca`) VALUES
(1, 'Toyota'),
(2, 'Ford'),
(3, 'Volkswagen'),
(4, 'Chevrolet'),
(5, 'Peugeot'),
(6, 'Renault');

-- --------------------------------------------------------

--
-- Table structure for table `metodos_pago`
--

CREATE TABLE `metodos_pago` (
  `id_metodo` int NOT NULL,
  `metodo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `metodos_pago`
--

INSERT INTO `metodos_pago` (`id_metodo`, `metodo`) VALUES
(1, 'EFECTIVO'),
(3, 'ENTREGA AUTO'),
(2, 'TRANSFERENCIA');

-- --------------------------------------------------------

--
-- Table structure for table `movimiento`
--

CREATE TABLE `movimiento` (
  `id_movimiento` int NOT NULL,
  `id_venta_auto` int NOT NULL,
  `id_metodo` int NOT NULL,
  `tipo_movimiento` enum('ENTRADA','CUOTA','OTRO') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'ENTRADA',
  `total` decimal(12,2) NOT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_vehiculo_entregado` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `movimiento`
--

INSERT INTO `movimiento` (`id_movimiento`, `id_venta_auto`, `id_metodo`, `tipo_movimiento`, `total`, `fecha`, `id_vehiculo_entregado`) VALUES
(1, 1, 1, 'ENTRADA', 6000000.00, '2025-11-17 16:05:43', NULL),
(2, 1, 2, 'ENTRADA', 6000000.00, '2025-11-17 16:05:43', NULL),
(6, 3, 1, 'ENTRADA', 80000000.00, '2025-11-20 19:57:34', NULL),
(8, 5, 1, 'ENTRADA', 3000000.00, '2025-11-20 20:27:20', NULL),
(9, 5, 2, 'CUOTA', 583333.33, '2025-11-20 20:50:14', NULL),
(10, 5, 1, 'CUOTA', 583333.33, '2025-11-25 03:15:27', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `planes_pago`
--

CREATE TABLE `planes_pago` (
  `id_plan` int NOT NULL,
  `cuotas` int NOT NULL,
  `interes` decimal(5,2) NOT NULL DEFAULT '0.00',
  `min_entrega` decimal(5,2) NOT NULL DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `planes_pago`
--

INSERT INTO `planes_pago` (`id_plan`, `cuotas`, `interes`, `min_entrega`) VALUES
(1, 12, 10.00, 20.00),
(2, 24, 20.00, 30.00),
(3, 6, 0.00, 10.00);

-- --------------------------------------------------------

--
-- Table structure for table `planes_usuarios`
--

CREATE TABLE `planes_usuarios` (
  `id_plan` int NOT NULL,
  `id_usuario` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `planes_usuarios`
--

INSERT INTO `planes_usuarios` (`id_plan`, `id_usuario`) VALUES
(1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id_rol` int NOT NULL,
  `rol` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id_rol`, `rol`) VALUES
(1, 'ADMIN'),
(2, 'VENDEDOR'),
(3, 'CLIENTE'),
(4, 'ADMIN'),
(5, 'VENDEDOR'),
(6, 'CLIENTE');

-- --------------------------------------------------------

--
-- Table structure for table `tipos_vehiculo`
--

CREATE TABLE `tipos_vehiculo` (
  `id_tipo_vehiculo` int NOT NULL,
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tipos_vehiculo`
--

INSERT INTO `tipos_vehiculo` (`id_tipo_vehiculo`, `nombre`) VALUES
(1, 'Auto'),
(2, 'Camioneta'),
(3, 'SUV'),
(4, 'Moto'),
(5, 'Utilitario');

-- --------------------------------------------------------

--
-- Table structure for table `tracciones`
--

CREATE TABLE `tracciones` (
  `id_traccion` int NOT NULL,
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tracciones`
--

INSERT INTO `tracciones` (`id_traccion`, `nombre`) VALUES
(1, '4x2'),
(2, '4x4'),
(3, 'Integral');

-- --------------------------------------------------------

--
-- Table structure for table `transmisiones`
--

CREATE TABLE `transmisiones` (
  `id_transmision` int NOT NULL,
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transmisiones`
--

INSERT INTO `transmisiones` (`id_transmision`, `nombre`) VALUES
(1, 'Manual'),
(2, 'Automática'),
(3, 'CVT');

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `telefono` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_rol` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `telefono`, `email`, `id_rol`) VALUES
(1, 'Juan Pérez', '1122334455', 'juan@gmail.com', 3),
(2, 'María Gómez', '1199887766', 'maria@gmail.com', 3),
(3, 'Carlos López', '1133445566', 'carlos@gmail.com', 3),
(4, 'Ana Romero', '1144556677', 'ana@gmail.com', 1),
(5, 'Lucía Díaz', '1188776655', 'lucia@gmail.com', 2),
(6, 'Pedro Torres', '1166554433', 'pedro@gmail.com', 2),
(7, 'Florencia Ruiz', '1177665544', 'flor@gmail.com', 3);

-- --------------------------------------------------------

--
-- Table structure for table `usuarios_credenciales`
--

CREATE TABLE `usuarios_credenciales` (
  `id_credencial` int NOT NULL,
  `id_usuario` int NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `creada_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `es_activa` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuarios_credenciales`
--

INSERT INTO `usuarios_credenciales` (`id_credencial`, `id_usuario`, `password_hash`, `creada_en`, `es_activa`) VALUES
(1, 1, '$2b$10$YtQmuxBTtAOQfLirHLle1.mY/P6KnRusNhZK.MoK8VR6tk3lD4hwC', '2025-11-18 20:50:06', 0),
(2, 5, '$2b$10$MqwE1Nfk/LqSMGCg.OR5nOH6brX8UOLxQCXLQxeRsb5VQXcolQ/u.', '2025-11-19 04:21:35', 0),
(3, 4, '$2b$10$pYR6KbNdlFCJb0qkINS/9uC0s7QI9lcI4vUHrjCcygvUzdGaYH/9e', '2025-11-19 04:21:46', 0),
(4, 1, '$2b$10$f/Rt0bZLD8bVdxnlh1KZYO7TYrO6W6ltPxKxasHf1JhHoZ9vTzjcK', '2025-11-19 04:21:50', 1),
(5, 2, '$2b$10$6NGzfyJGnqDQvWN9OzK/.O7gvwZ52MntwT.dHFmYDKcp77JCXupfC', '2025-11-19 04:21:54', 1),
(6, 3, '$2b$10$HPQelSXEBrQpLThC4TMpL.tipKjKK7cgVcKQqgV9Ycd067tr5VM/S', '2025-11-19 04:21:57', 1),
(7, 4, '$2b$10$MwbpY3a7XYG3DQBIn4EJtOlagOShTm/3QdopJtoTAM6meMqG3Fe9y', '2025-11-19 04:22:01', 1),
(8, 5, '$2b$10$JxYK5UwHRAORd475/sZN5uusK2DZW1O0tjk9ElRb6UFFWKR/C5pt6', '2025-11-19 04:22:06', 1),
(9, 6, '$2b$10$IezC6ZcJHiZr5PSN9zJGa.3xrJFsB0sAL/nhwKsIkgiq/tqfSVz8C', '2025-11-19 04:22:11', 1),
(10, 7, '$2b$10$WUIqhRKc1tJ5TaQin74YfOF5WGky2eo8rikTigd77nxEcybvj6MSq', '2025-11-19 04:22:15', 1);

-- --------------------------------------------------------

--
-- Table structure for table `vehiculos`
--

CREATE TABLE `vehiculos` (
  `id_vehiculo` int NOT NULL,
  `id_marca` int NOT NULL,
  `modelo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `anio` smallint UNSIGNED DEFAULT NULL,
  `id_color` int DEFAULT NULL,
  `id_tipo_vehiculo` int DEFAULT NULL,
  `id_transmision` int DEFAULT NULL,
  `id_traccion` int DEFAULT NULL,
  `km` int UNSIGNED DEFAULT NULL,
  `puertas` tinyint UNSIGNED DEFAULT NULL,
  `id_direccion` int DEFAULT NULL,
  `precio` decimal(12,2) NOT NULL,
  `id_combustible` int NOT NULL,
  `estado` enum('EN_EVALUACION','EN_STOCK','VENDIDO','RECHAZADO','INACTIVO') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'EN_STOCK',
  `origen` enum('AGENCIA','USADO_CLIENTE') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'AGENCIA',
  `es_usado` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehiculos`
--

INSERT INTO `vehiculos` (`id_vehiculo`, `id_marca`, `modelo`, `anio`, `id_color`, `id_tipo_vehiculo`, `id_transmision`, `id_traccion`, `km`, `puertas`, `id_direccion`, `precio`, `id_combustible`, `estado`, `origen`, `es_usado`) VALUES
(1, 1, 'Corolla 2.0 XEi', 2022, 1, 1, 2, 1, 0, 4, 2, 12000000.00, 1, 'VENDIDO', 'AGENCIA', 0),
(2, 1, 'Yaris 1.5 XS', 2021, 2, 1, 1, 1, 15000, 4, 1, 9500000.00, 1, 'EN_STOCK', 'AGENCIA', 0),
(3, 2, 'Fiesta 1.6 SE', 2016, 3, 1, 1, 1, 85000, 5, 1, 3800000.00, 1, 'EN_EVALUACION', 'USADO_CLIENTE', 1),
(4, 3, 'Golf 2.0 GTI', 2019, 4, 1, 2, 1, 30000, 5, 2, 8000000.00, 1, 'VENDIDO', 'AGENCIA', 0),
(5, 4, 'Onix LT 1.4', 2020, 5, 1, 1, 1, 40000, 5, 1, 6500000.00, 1, 'VENDIDO', 'AGENCIA', 0),
(6, 5, '208 Feline 1.6', 2021, 6, 1, 2, 1, 20000, 5, 2, 7200000.00, 1, 'EN_STOCK', 'AGENCIA', 0),
(7, 6, 'Kangoo Express 1.6', 2020, 1, 5, 1, 1, 60000, 4, 1, 9000000.00, 2, 'EN_STOCK', 'AGENCIA', 0),
(8, 2, 'Ranger 3.2 Ltd', 2023, 2, 2, 2, 2, 5000, 4, 2, 25000000.00, 2, 'EN_STOCK', 'AGENCIA', 0),
(9, 3, 'Bora 1.8T', 2013, 3, 1, 1, 1, 120000, 4, 1, 3200000.00, 1, 'EN_STOCK', 'USADO_CLIENTE', 1),
(10, 4, 'Cruze 1.8 LTZ', 2017, 4, 1, 2, 1, 70000, 4, 1, 5700000.00, 1, 'EN_STOCK', 'AGENCIA', 0);

-- --------------------------------------------------------

--
-- Table structure for table `vehiculos_imagenes`
--

CREATE TABLE `vehiculos_imagenes` (
  `id_imagen` int NOT NULL,
  `id_vehiculo` int NOT NULL,
  `url_imagen` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `orden` int DEFAULT '0',
  `img_perfil` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehiculos_imagenes`
--

INSERT INTO `vehiculos_imagenes` (`id_imagen`, `id_vehiculo`, `url_imagen`, `orden`, `img_perfil`) VALUES
(2, 1, 'https://ik.imagekit.io/solvegadev/toyota-corolla.webp', 1, 1),
(3, 1, 'https://ik.imagekit.io/solvegadev/Toyota_Corolla_Altis_GR_Sport_(front).webp', 2, 0),
(4, 10, 'https://ik.imagekit.io/solvegadev/vehiculos/10/cruze_IIDxXUn0g.webp', 1, 1),
(5, 10, 'https://ik.imagekit.io/solvegadev/vehiculos/10/cruze2_rnan8lcOD.webp', 2, 0),
(6, 10, 'https://ik.imagekit.io/solvegadev/vehiculos/10/cruze3_J7rdtzmHuw.webp', 3, 0),
(7, 9, 'https://ik.imagekit.io/solvegadev/vehiculos/9/bora_Qh2QFPWc1.webp', 1, 1),
(8, 9, 'https://ik.imagekit.io/solvegadev/vehiculos/9/bora2_Ha0zBRbV6.webp', 2, 0),
(9, 9, 'https://ik.imagekit.io/solvegadev/vehiculos/9/bora3_wt0yTR_f-.webp', 3, 0),
(10, 8, 'https://ik.imagekit.io/solvegadev/vehiculos/8/ranger_buGNqBZXh.webp', 1, 1),
(11, 8, 'https://ik.imagekit.io/solvegadev/vehiculos/8/ranger2_h32K7t3dF.webp', 2, 0),
(12, 8, 'https://ik.imagekit.io/solvegadev/vehiculos/8/ranger3_UfytKEDzc.webp', 3, 0),
(13, 7, 'https://ik.imagekit.io/solvegadev/vehiculos/7/kangoo_YCOl6OEXf.webp', 1, 1),
(14, 7, 'https://ik.imagekit.io/solvegadev/vehiculos/7/kangoo2_jh_LD7RjJ.webp', 2, 0),
(15, 6, 'https://ik.imagekit.io/solvegadev/vehiculos/6/2082_aI-k3PgtSZ.webp', 1, 1),
(16, 6, 'https://ik.imagekit.io/solvegadev/vehiculos/6/208_5SEsRvLWyg.webp', 2, 0),
(17, 5, 'https://ik.imagekit.io/solvegadev/vehiculos/5/onix_TaoqjB0RVc.webp', 1, 1),
(18, 5, 'https://ik.imagekit.io/solvegadev/vehiculos/5/onix2_OxT12zS2oa.webp', 2, 0),
(19, 4, 'https://ik.imagekit.io/solvegadev/vehiculos/4/golf_0CDrNTmj15.webp', 1, 1),
(20, 4, 'https://ik.imagekit.io/solvegadev/vehiculos/4/golf2_VfSNgFRMO.webp', 2, 0),
(21, 3, 'https://ik.imagekit.io/solvegadev/vehiculos/3/fiesta_Yxng6vRlA.webp', 1, 1),
(22, 3, 'https://ik.imagekit.io/solvegadev/vehiculos/3/fiesta2_mxsa9qhSy.webp', 2, 0),
(23, 2, 'https://ik.imagekit.io/solvegadev/vehiculos/2/yaris_Nv7qQqe25.webp', 1, 1),
(24, 2, 'https://ik.imagekit.io/solvegadev/vehiculos/2/yaris2_EFWInzrc6.webp', 2, 0);

-- --------------------------------------------------------

--
-- Table structure for table `venta_auto`
--

CREATE TABLE `venta_auto` (
  `id_venta_auto` int NOT NULL,
  `id_vehiculo` int NOT NULL,
  `id_usuario` int NOT NULL,
  `id_plan` int DEFAULT NULL,
  `fecha` date NOT NULL,
  `total_pagado` decimal(12,2) NOT NULL,
  `estado_venta` enum('PENDIENTE','APROBADA','RECHAZADA') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'PENDIENTE',
  `id_usuario_aprueba` int DEFAULT NULL,
  `fecha_aprobacion` datetime DEFAULT NULL,
  `motivo_rechazo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `venta_auto`
--

INSERT INTO `venta_auto` (`id_venta_auto`, `id_vehiculo`, `id_usuario`, `id_plan`, `fecha`, `total_pagado`, `estado_venta`, `id_usuario_aprueba`, `fecha_aprobacion`, `motivo_rechazo`) VALUES
(1, 1, 1, NULL, '2025-02-01', 12000000.00, 'APROBADA', NULL, NULL, NULL),
(2, 2, 2, 2, '2025-02-02', 9500000.00, 'APROBADA', NULL, NULL, NULL),
(3, 4, 5, NULL, '2025-11-20', 80000000.00, 'PENDIENTE', NULL, NULL, NULL),
(5, 5, 3, 3, '2025-11-21', 3000000.00, 'PENDIENTE', NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `colores`
--
ALTER TABLE `colores`
  ADD PRIMARY KEY (`id_color`);

--
-- Indexes for table `combustibles`
--
ALTER TABLE `combustibles`
  ADD PRIMARY KEY (`id_combustible`);

--
-- Indexes for table `cuotas_venta`
--
ALTER TABLE `cuotas_venta`
  ADD PRIMARY KEY (`id_cuota`),
  ADD KEY `fk_cuota_venta` (`id_venta_auto`);

--
-- Indexes for table `direcciones`
--
ALTER TABLE `direcciones`
  ADD PRIMARY KEY (`id_direccion`),
  ADD UNIQUE KEY `uq_direcciones_nombre` (`nombre`);

--
-- Indexes for table `marcas`
--
ALTER TABLE `marcas`
  ADD PRIMARY KEY (`id_marca`);

--
-- Indexes for table `metodos_pago`
--
ALTER TABLE `metodos_pago`
  ADD PRIMARY KEY (`id_metodo`),
  ADD UNIQUE KEY `metodo` (`metodo`);

--
-- Indexes for table `movimiento`
--
ALTER TABLE `movimiento`
  ADD PRIMARY KEY (`id_movimiento`),
  ADD KEY `fk_movimiento_venta` (`id_venta_auto`),
  ADD KEY `fk_movimiento_metodo` (`id_metodo`),
  ADD KEY `fk_mov_vehiculo_entregado` (`id_vehiculo_entregado`);

--
-- Indexes for table `planes_pago`
--
ALTER TABLE `planes_pago`
  ADD PRIMARY KEY (`id_plan`);

--
-- Indexes for table `planes_usuarios`
--
ALTER TABLE `planes_usuarios`
  ADD PRIMARY KEY (`id_plan`,`id_usuario`),
  ADD KEY `fk_planes_usuarios_usuario` (`id_usuario`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`);

--
-- Indexes for table `tipos_vehiculo`
--
ALTER TABLE `tipos_vehiculo`
  ADD PRIMARY KEY (`id_tipo_vehiculo`);

--
-- Indexes for table `tracciones`
--
ALTER TABLE `tracciones`
  ADD PRIMARY KEY (`id_traccion`);

--
-- Indexes for table `transmisiones`
--
ALTER TABLE `transmisiones`
  ADD PRIMARY KEY (`id_transmision`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_usuarios_rol` (`id_rol`);

--
-- Indexes for table `usuarios_credenciales`
--
ALTER TABLE `usuarios_credenciales`
  ADD PRIMARY KEY (`id_credencial`),
  ADD KEY `fk_credenciales_usuario` (`id_usuario`);

--
-- Indexes for table `vehiculos`
--
ALTER TABLE `vehiculos`
  ADD PRIMARY KEY (`id_vehiculo`),
  ADD KEY `idx_vehiculos_anio` (`anio`),
  ADD KEY `idx_vehiculos_precio` (`precio`),
  ADD KEY `idx_vehiculos_estado` (`estado`),
  ADD KEY `idx_vehiculos_marca` (`id_marca`),
  ADD KEY `idx_vehiculos_combustible` (`id_combustible`),
  ADD KEY `idx_vehiculos_color` (`id_color`),
  ADD KEY `idx_vehiculos_tipo` (`id_tipo_vehiculo`),
  ADD KEY `idx_vehiculos_transmision` (`id_transmision`),
  ADD KEY `idx_vehiculos_traccion` (`id_traccion`),
  ADD KEY `idx_vehiculos_km` (`km`),
  ADD KEY `idx_vehiculos_puertas` (`puertas`),
  ADD KEY `idx_vehiculos_direccion` (`id_direccion`);

--
-- Indexes for table `vehiculos_imagenes`
--
ALTER TABLE `vehiculos_imagenes`
  ADD PRIMARY KEY (`id_imagen`),
  ADD KEY `fk_imagen_vehiculo` (`id_vehiculo`);

--
-- Indexes for table `venta_auto`
--
ALTER TABLE `venta_auto`
  ADD PRIMARY KEY (`id_venta_auto`),
  ADD KEY `fk_venta_vehiculo` (`id_vehiculo`),
  ADD KEY `fk_venta_usuario` (`id_usuario`),
  ADD KEY `fk_venta_plan` (`id_plan`),
  ADD KEY `fk_venta_usuario_aprueba` (`id_usuario_aprueba`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `colores`
--
ALTER TABLE `colores`
  MODIFY `id_color` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `combustibles`
--
ALTER TABLE `combustibles`
  MODIFY `id_combustible` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `cuotas_venta`
--
ALTER TABLE `cuotas_venta`
  MODIFY `id_cuota` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `direcciones`
--
ALTER TABLE `direcciones`
  MODIFY `id_direccion` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `marcas`
--
ALTER TABLE `marcas`
  MODIFY `id_marca` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `metodos_pago`
--
ALTER TABLE `metodos_pago`
  MODIFY `id_metodo` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `movimiento`
--
ALTER TABLE `movimiento`
  MODIFY `id_movimiento` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `planes_pago`
--
ALTER TABLE `planes_pago`
  MODIFY `id_plan` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tipos_vehiculo`
--
ALTER TABLE `tipos_vehiculo`
  MODIFY `id_tipo_vehiculo` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tracciones`
--
ALTER TABLE `tracciones`
  MODIFY `id_traccion` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `transmisiones`
--
ALTER TABLE `transmisiones`
  MODIFY `id_transmision` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `usuarios_credenciales`
--
ALTER TABLE `usuarios_credenciales`
  MODIFY `id_credencial` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `vehiculos`
--
ALTER TABLE `vehiculos`
  MODIFY `id_vehiculo` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `vehiculos_imagenes`
--
ALTER TABLE `vehiculos_imagenes`
  MODIFY `id_imagen` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `venta_auto`
--
ALTER TABLE `venta_auto`
  MODIFY `id_venta_auto` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cuotas_venta`
--
ALTER TABLE `cuotas_venta`
  ADD CONSTRAINT `fk_cuota_venta` FOREIGN KEY (`id_venta_auto`) REFERENCES `venta_auto` (`id_venta_auto`);

--
-- Constraints for table `movimiento`
--
ALTER TABLE `movimiento`
  ADD CONSTRAINT `fk_mov_vehiculo_entregado` FOREIGN KEY (`id_vehiculo_entregado`) REFERENCES `vehiculos` (`id_vehiculo`),
  ADD CONSTRAINT `fk_movimiento_metodo` FOREIGN KEY (`id_metodo`) REFERENCES `metodos_pago` (`id_metodo`),
  ADD CONSTRAINT `fk_movimiento_venta` FOREIGN KEY (`id_venta_auto`) REFERENCES `venta_auto` (`id_venta_auto`);

--
-- Constraints for table `planes_usuarios`
--
ALTER TABLE `planes_usuarios`
  ADD CONSTRAINT `fk_planes_usuarios_plan` FOREIGN KEY (`id_plan`) REFERENCES `planes_pago` (`id_plan`),
  ADD CONSTRAINT `fk_planes_usuarios_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Constraints for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`);

--
-- Constraints for table `usuarios_credenciales`
--
ALTER TABLE `usuarios_credenciales`
  ADD CONSTRAINT `fk_credenciales_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Constraints for table `vehiculos`
--
ALTER TABLE `vehiculos`
  ADD CONSTRAINT `fk_vehiculo_combustible` FOREIGN KEY (`id_combustible`) REFERENCES `combustibles` (`id_combustible`),
  ADD CONSTRAINT `fk_vehiculo_marca` FOREIGN KEY (`id_marca`) REFERENCES `marcas` (`id_marca`),
  ADD CONSTRAINT `fk_vehiculos_color` FOREIGN KEY (`id_color`) REFERENCES `colores` (`id_color`),
  ADD CONSTRAINT `fk_vehiculos_direccion` FOREIGN KEY (`id_direccion`) REFERENCES `direcciones` (`id_direccion`),
  ADD CONSTRAINT `fk_vehiculos_tipo` FOREIGN KEY (`id_tipo_vehiculo`) REFERENCES `tipos_vehiculo` (`id_tipo_vehiculo`),
  ADD CONSTRAINT `fk_vehiculos_traccion` FOREIGN KEY (`id_traccion`) REFERENCES `tracciones` (`id_traccion`),
  ADD CONSTRAINT `fk_vehiculos_transmision` FOREIGN KEY (`id_transmision`) REFERENCES `transmisiones` (`id_transmision`);

--
-- Constraints for table `vehiculos_imagenes`
--
ALTER TABLE `vehiculos_imagenes`
  ADD CONSTRAINT `fk_imagen_vehiculo` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos` (`id_vehiculo`);

--
-- Constraints for table `venta_auto`
--
ALTER TABLE `venta_auto`
  ADD CONSTRAINT `fk_venta_plan` FOREIGN KEY (`id_plan`) REFERENCES `planes_pago` (`id_plan`),
  ADD CONSTRAINT `fk_venta_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `fk_venta_usuario_aprueba` FOREIGN KEY (`id_usuario_aprueba`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `fk_venta_vehiculo` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos` (`id_vehiculo`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
