const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { signToken } = require("../config/jwt");

const sendError = (res, status, code, message) => {
  return res.status(status).json({ code, message });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "Email y contraseña requeridos"
    );
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  try {
    const [resultSets] = await pool.query("CALL LoginUsuario(?)", [
      normalizedEmail,
    ]);


    let user = null;

    if (Array.isArray(resultSets)) {
      if (Array.isArray(resultSets[0])) {
        user = resultSets[0][0] || null;
      } else {
        user = resultSets[0] || null;
      }
    } else {
      user = resultSets || null;
    }

    if (!user) {
      return sendError(
        res,
        401,
        "AUTH_INVALID_CREDENTIALS",
        "Credenciales inválidas"
      );
    }

    if (!user.password_hash) {
      return sendError(
        res,
        403,
        "PASSWORD_NOT_SET",
        "La cuenta no tiene contraseña configurada. Contacte al administrador."
      );
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return sendError(
        res,
        401,
        "AUTH_INVALID_CREDENTIALS",
        "Credenciales inválidas"
      );
    }

    const token = signToken({
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      id_rol: user.id_rol,
    });

    return res.json({
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        id_rol: user.id_rol,
      },
    });
  } catch (err) {
    console.error("Error en login:", err);

    if (err.sqlState === "45000") {
      const msg = (err.message || "").toUpperCase();
      if (msg.includes("EMAIL_REQUERIDO")) {
        return sendError(
          res,
          400,
          "VALIDATION_ERROR",
          "El email es obligatorio"
        );
      }

      return sendError(
        res,
        401,
        "AUTH_INVALID_CREDENTIALS",
        "Credenciales inválidas"
      );
    }

    return sendError(
      res,
      500,
      "INTERNAL_SERVER_ERROR",
      "Error interno de servidor"
    );
  }
};

exports.actualizarPassword = async (req, res) => {
  const { id_usuario, nuevaPassword } = req.body;

  if (!id_usuario || !nuevaPassword) {
    return sendError(res, 400, "VALIDATION_ERROR", "Datos incompletos");
  }

  if (nuevaPassword.length < 6) {
    return sendError(res, 400, "PASSWORD_WEAK", "La contraseña es muy corta");
  }

  try {
    const passwordHash = await bcrypt.hash(nuevaPassword, 10);

    await pool.query("CALL ActualizarPasswordUsuario(?, ?)", [
      id_usuario,
      passwordHash,
    ]);

    return res.json({
      message: "Contraseña actualizada exitosamente",
    });
  } catch (err) {
    console.error(err);

    if (err.sqlState === "45000") {
      const msg = err.message.toUpperCase();

      if (msg.includes("ID_USUARIO_REQUERIDO"))
        return sendError(res, 400, "VALIDATION_ERROR", "Falta el ID del usuario");

      if (msg.includes("PASSWORD_HASH_INVALIDO"))
        return sendError(res, 400, "VALIDATION_ERROR", "Hash de contraseña inválido");
    }

    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Error interno de servidor");
  }
};

