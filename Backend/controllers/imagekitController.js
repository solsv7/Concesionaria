const imagekit = require("../config/imagekit");

exports.getAuth = (req, res) => {
  try {
    const result = imagekit.getAuthenticationParameters();
    res.json(result);
  } catch (err) {
    console.error("Error generando auth de ImageKit:", err);
    res.status(500).json({ message: "Error generando autenticación" });
  }
};
