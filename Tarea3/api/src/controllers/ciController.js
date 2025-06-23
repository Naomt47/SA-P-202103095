const pool = require('../config/db');

const tipoCIRequerimientos = {
  1: ['numero_serie', 'ubicacion_fisica'], // Hardware
  2: ['version', 'numero_licencia'],      // Software
  3: ['version']                          // Base de Datos
};

const createCI = async (req, res) => {
  const {
    nombre_ci, id_tipo_ci, descripcion, numero_serie, version, fecha_adquisicion,
    estado_actual, ubicacion_fisica, propietario_responsable, niveles_seguridad,
    cumplimiento, estado_configuracion, numero_licencia, fecha_vencimiento, ambiente
  } = req.body;

  // Validar campos obligatorios
  if (!nombre_ci || !id_tipo_ci || !ambiente) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: nombre_ci, id_tipo_ci, ambiente' });
  }
  if (!['DEV', 'QA', 'PROD'].includes(ambiente)) {
    return res.status(400).json({ error: 'Ambiente inválido. Debe ser DEV, QA o PROD' });
  }

  // Validar campos obligatorios por tipo de CI
  const requerimientos = tipoCIRequerimientos[id_tipo_ci];
  if (requerimientos) {
    for (const campo of requerimientos) {
      if (!req.body[campo]) {
        return res.status(400).json({ error: `Campo obligatorio faltante para tipo ${id_tipo_ci}: ${campo}` });
      }
    }
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Consulta INSERT fija
    const [result] = await connection.query(
      `INSERT INTO CI (
        nombre_ci, id_tipo_ci, descripcion, numero_serie, version, fecha_adquisicion,
        estado_actual, ubicacion_fisica, propietario_responsable, niveles_seguridad,
        cumplimiento, estado_configuracion, numero_licencia, fecha_vencimiento, ambiente
      ) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre_ci,
        id_tipo_ci,
        descripcion || null,
        numero_serie || null,
        version || null,
        estado_actual || null,
        ubicacion_fisica || null,
        propietario_responsable || null,
        niveles_seguridad || null,
        cumplimiento || null,
        estado_configuracion || null,
        numero_licencia || null,
        fecha_vencimiento || null,
        ambiente
      ]
    );

    // Registrar en Auditoria
    await connection.query(
      `INSERT INTO Auditoria (id_ci, nombre_ci, fecha_cambio, descripcion_cambio, usuario)
       VALUES (?, ?, NOW(), ?, ?)`,
      [result.insertId, nombre_ci, 'Creación de CI', 'system']
    );

    await connection.commit();
    res.status(201).json({ id_ci: result.insertId, mensaje: 'CI creado exitosamente' });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
      return res.status(400).json({ error: 'Valor inválido para un campo ENUM' });
    }
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
};

const getCI = async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT * FROM CI WHERE id_ci = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ error: 'CI no encontrado' });
    }

    const [relaciones] = await connection.query(
      'SELECT id_ci_destino, tipo_relacion FROM Relacion_CI WHERE id_ci_origen = ?', [id]
    );
    const [documentacion] = await connection.query(
      'SELECT enlace_documentacion FROM Documentacion WHERE id_ci = ?', [id]
    );
    const [incidentes] = await connection.query(
      'SELECT enlace_incidente_problema FROM Incidentes_Problemas WHERE id_ci = ?', [id]
    );

    const ci = {
      ...rows[0],
      relaciones: relaciones,
      documentacion: documentacion.map(doc => doc.enlace_documentacion),
      incidentes_problemas: incidentes.map(inc => inc.enlace_incidente_problema)
    };

    res.json(ci);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

const updateCI = async (req, res) => {
  const { id } = req.params;
  const {
    nombre_ci, id_tipo_ci, descripcion, numero_serie, version, fecha_adquisicion,
    estado_actual, ubicacion_fisica, propietario_responsable, niveles_seguridad,
    cumplimiento, estado_configuracion, numero_licencia, fecha_vencimiento, ambiente
  } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query('SELECT * FROM CI WHERE id_ci = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ error: 'CI no encontrado' });
    }

    // Validar campos obligatorios por tipo de CI
    const idTipoCi = id_tipo_ci || rows[0].id_tipo_ci;
    const requerimientos = tipoCIRequerimientos[idTipoCi];
    if (requerimientos) {
      for (const campo of requerimientos) {
        if (!(campo in req.body) && !rows[0][campo]) {
          return res.status(400).json({ error: `Campo obligatorio faltante para tipo ${idTipoCi}: ${campo}` });
        }
      }
    }

    // Validar ambiente si se proporciona
    if (ambiente && !['DEV', 'QA', 'PROD'].includes(ambiente)) {
      return res.status(400).json({ error: 'Ambiente inválido' });
    }

    await connection.query(
      `UPDATE CI SET
        nombre_ci = COALESCE(?, nombre_ci),
        id_tipo_ci = COALESCE(?, id_tipo_ci),
        descripcion = ?,
        numero_serie = ?,
        version = ?,
        fecha_adquisicion = COALESCE(?, fecha_adquisicion),
        estado_actual = ?,
        ubicacion_fisica = ?,
        propietario_responsable = ?,
        niveles_seguridad = ?,
        cumplimiento = ?,
        estado_configuracion = ?,
        numero_licencia = ?,
        fecha_vencimiento = ?,
        ambiente = COALESCE(?, ambiente)
       WHERE id_ci = ?`,
      [
        nombre_ci,
        id_tipo_ci,
        descripcion !== undefined ? descripcion : rows[0].descripcion,
        numero_serie !== undefined ? numero_serie : rows[0].numero_serie,
        version !== undefined ? version : rows[0].version,
        fecha_adquisicion,
        estado_actual !== undefined ? estado_actual : rows[0].estado_actual,
        ubicacion_fisica !== undefined ? ubicacion_fisica : rows[0].ubicacion_fisica,
        propietario_responsable !== undefined ? propietario_responsable : rows[0].propietario_responsable,
        niveles_seguridad !== undefined ? niveles_seguridad : rows[0].niveles_seguridad,
        cumplimiento !== undefined ? cumplimiento : rows[0].cumplimiento,
        estado_configuracion !== undefined ? estado_configuracion : rows[0].estado_configuracion,
        numero_licencia !== undefined ? numero_licencia : rows[0].numero_licencia,
        fecha_vencimiento !== undefined ? fecha_vencimiento : rows[0].fecha_vencimiento,
        ambiente,
        id
      ]
    );

    // Registrar en Auditoria
    await connection.query(
      `INSERT INTO Auditoria (id_ci, nombre_ci, fecha_cambio, descripcion_cambio, usuario)
       VALUES (?, ?, NOW(), ?, ?)`,
      [id, nombre_ci || rows[0].nombre_ci, 'Actualización de CI', 'system']
    );

    await connection.commit();
    res.json({ mensaje: 'CI actualizado exitosamente' });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
      return res.status(400).json({ error: 'Valor inválido para un campo ENUM' });
    }
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
};

const deleteCI = async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query('SELECT nombre_ci FROM CI WHERE id_ci = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ error: 'CI no encontrado' });
    }

    const nombre_ci = rows[0].nombre_ci;

    // Registrar en Auditoria
    await connection.query(
      `INSERT INTO Auditoria (id_ci, nombre_ci, fecha_cambio, descripcion_cambio, usuario)
       VALUES (?, ?, NOW(), ?, ?)`,
      [id, nombre_ci, 'Eliminación de CI', 'system']
    );

    await connection.query('DELETE FROM CI WHERE id_ci = ?', [id]);

    await connection.commit();
    res.json({ mensaje: 'CI eliminado exitosamente' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

const searchCIs = async (req, res) => {
  const { nombre_ci, id_tipo_ci, ambiente, estado_actual } = req.query;
  let query = 'SELECT * FROM CI WHERE 1=1';
  const params = [];

  if (nombre_ci) {
    query += ' AND nombre_ci LIKE ?';
    params.push(`%${nombre_ci}%`);
  }
  if (id_tipo_ci) {
    query += ' AND id_tipo_ci = ?';
    params.push(id_tipo_ci);
  }
  if (ambiente) {
    query += ' AND ambiente = ?';
    params.push(ambiente);
  }
  if (estado_actual) {
    query += ' AND estado_actual = ?';
    params.push(estado_actual);
  }

  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createCI, getCI, updateCI, deleteCI, searchCIs };