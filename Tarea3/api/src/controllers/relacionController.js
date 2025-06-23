const pool = require('../config/db');

const createRelacion = async (req, res) => {
  const { id_ci_origen, id_ci_destino, tipo_relacion } = req.body;
  if (!id_ci_origen || !id_ci_destino || !tipo_relacion) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO Relacion_CI (id_ci_origen, id_ci_destino, tipo_relacion)
       VALUES (?, ?, ?)`,
      [id_ci_origen, id_ci_destino, tipo_relacion]
    );
    res.status(201).json({ id_relacion: result.insertId, mensaje: 'Relación creada exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createRelacion };