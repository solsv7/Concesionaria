--Querys pedidas:


-- 1 Todas las ventas realizadas por un mismo cliente
SELECT
    va.id_venta_auto,
    va.fecha,
    va.total_pagado,
    va.estado_venta,
    va.id_plan,
    u.id_usuario,
    u.nombre AS cliente,
    u.email,
    u.telefono
FROM venta_auto va
JOIN usuarios u ON va.id_usuario = u.id_usuario
WHERE va.id_usuario =  
      3;               
 




-- 2 Todos los vehículos con año mayor a 2020
SELECT  id_vehiculo,
        marca,
        modelo,
        anio,
        precio,
        estado
FROM vehiculos
WHERE anio > 2020;

-- con mas detalle: 
SELECT
    v.id_vehiculo,
    m.marca,
    v.modelo,
    v.anio,
    v.precio,
    c.nombre AS combustible,
    col.nombre AS color,
    tv.nombre AS tipo_vehiculo,
    tr.nombre AS transmision,
    tc.nombre AS traccion,
    d.nombre AS direccion,
    v.km,
    v.puertas,
    v.origen,
    v.es_usado,
    v.estado
FROM vehiculos v
JOIN marcas m               ON v.id_marca = m.id_marca
JOIN combustibles c         ON v.id_combustible = c.id_combustible
LEFT JOIN colores col        ON v.id_color = col.id_color
LEFT JOIN tipos_vehiculo tv  ON v.id_tipo_vehiculo = tv.id_tipo_vehiculo
LEFT JOIN transmisiones tr   ON v.id_transmision = tr.id_transmision
LEFT JOIN tracciones tc      ON v.id_traccion = tc.id_traccion
LEFT JOIN direcciones d      ON v.id_direccion = d.id_direccion
WHERE v.anio > 2020
ORDER BY v.anio DESC, v.id_vehiculo;



-- Todas las ventas que tengan como forma de pago “Efectivo”
SELECT DISTINCT
    va.id_venta_auto,
    va.fecha,
    va.total_pagado,
    va.estado_venta,
    u.id_usuario AS id_cliente,
    u.nombre AS cliente,
    u.email,
    u.telefono,
    v.id_vehiculo,
    m.marca,
    v.modelo,
    v.anio,
    v.precio AS precio_publicado
FROM venta_auto va
JOIN movimiento mov   ON va.id_venta_auto = mov.id_venta_auto
JOIN metodos_pago mp  ON mov.id_metodo = mp.id_metodo
JOIN usuarios u       ON va.id_usuario = u.id_usuario
JOIN vehiculos v      ON va.id_vehiculo = v.id_vehiculo
JOIN marcas m         ON v.id_marca = m.id_marca
WHERE mp.metodo = 'EFECTIVO'
ORDER BY va.fecha DESC, va.id_venta_auto DESC;
