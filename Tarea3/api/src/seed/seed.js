const pool = require('../config/db');

async function seedDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Eliminar datos existentes
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE Auditoria');
    await connection.query('TRUNCATE TABLE Relacion_CI');
    await connection.query('TRUNCATE TABLE Documentacion');
    await connection.query('TRUNCATE TABLE Incidentes_Problemas');
    await connection.query('TRUNCATE TABLE CI');
    await connection.query('TRUNCATE TABLE Tipo_CI');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Insertar tipos de CI
    console.log('Insertando tipos de CI...');
    await connection.query(
      `INSERT INTO Tipo_CI (nombre_tipo) VALUES ('Hardware'), ('Software'), ('Base de Datos')`
    );

    // 3. Insertar 11 CIs
    console.log('Insertando CIs...');
    const [ciResult] = await connection.query(`
      INSERT INTO CI (nombre_ci, id_tipo_ci, descripcion, numero_serie, version, fecha_adquisicion,
                      estado_actual, ubicacion_fisica, propietario_responsable, niveles_seguridad,
                      cumplimiento, estado_configuracion, numero_licencia, fecha_vencimiento, ambiente)
      VALUES
        ('Servidor1', 1, 'Servidor de aplicaciones', 'SN123456', 'v1.0', '2022-01-01',
         'Activo', 'Sala de Servidores 1', 'Equipo de Infraestructura', 'Alto',
         'Cumple', 'Aprobado', 'ABC123', '2023-01-01', 'PROD'),
        ('Aplicacion1', 2, 'Aplicación de contabilidad', NULL, 'v2.5', '2022-03-15',
         'Activo', NULL, 'Equipo de Desarrollo', 'Medio',
         'Cumple', 'Aprobado', 'XYZ456', '2024-01-01', 'PROD'),
        ('BaseDatos1', 3, 'Base de datos principal', NULL, 'v12.0', '2021-12-01',
         'Activo', 'Sala de Servidores 1', 'Equipo de Infraestructura', 'Alto',
         'Cumple', 'Aprobado', NULL, NULL, 'PROD'),
        ('Servidor2', 1, 'Servidor secundario', 'SN789012', 'v1.1', '2022-06-01',
         'Activo', 'Sala de Servidores 2', 'Equipo de Infraestructura', 'Medio',
         'Cumple', 'Aprobado', 'DEF456', '2023-06-01', 'PROD'),
        ('Servidor3', 1, 'Servidor de pruebas', 'SN345678', 'v1.2', '2023-01-01',
         'Inactivo', 'Sala de Servidores 3', 'Equipo de QA', 'Bajo',
         'Pendiente', 'Pendiente', 'GHI789', '2024-01-01', 'QA'),
        ('Aplicacion2', 2, 'Aplicación de CRM', NULL, 'v3.0', '2023-03-01',
         'Activo', NULL, 'Equipo de Desarrollo', 'Medio',
         'No Cumple', 'Aprobado', 'JKL012', '2024-03-01', 'DEV'),
        ('Aplicacion3', 2, 'Aplicación de inventario', NULL, 'v1.5', '2022-09-01',
         'En Mantenimiento', NULL, 'Equipo de Operaciones', 'Alto',
         'Cumple', 'Rechazado', 'MNO345', '2023-09-01', 'PROD'),
        ('BaseDatos2', 3, 'Base de datos secundaria', NULL, 'v11.0', '2022-12-01',
         'Activo', 'Sala de Servidores 2', 'Equipo de Infraestructura', 'Alto',
         'Cumple', 'Aprobado', NULL, NULL, 'QA'),
        ('BaseDatos3', 3, 'Base de datos de pruebas', NULL, 'v10.0', '2023-02-01',
         'Inactivo', 'Sala de Servidores 3', 'Equipo de QA', 'Bajo',
         'Pendiente', 'Pendiente', NULL, NULL, 'DEV'),
        ('Router1', 1, 'Router principal', 'SN901234', 'v2.0', '2022-11-01',
         'Activo', 'Sala de Redes 1', 'Equipo de Redes', 'Alto',
         'Cumple', 'Aprobado', 'PQR678', '2023-11-01', 'PROD'),
        ('Firewall1', 1, 'Firewall de red', 'SN567890', 'v1.5', '2023-04-01',
         'Activo', 'Sala de Redes 2', 'Equipo de Redes', 'Alto',
         'Cumple', 'Aprobado', 'STU901', '2024-04-01', 'DEV')
    `);
    console.log(`Insertados ${ciResult.affectedRows} CIs`);

    // 4. Verificar que los CIs existen
    const [cis] = await connection.query('SELECT id_ci, nombre_ci FROM CI');
    console.log('CIs insertados:', cis);

    // 5. Insertar relaciones
    console.log('Insertando relaciones...');
    const [relResult] = await connection.query(
      `INSERT INTO Relacion_CI (id_ci_origen, id_ci_destino, tipo_relacion)
       VALUES
         (1, 2, 'Padre'), (2, 1, 'Hijo'),
         (1, 3, 'Padre'), (3, 1, 'Hijo'),
         (4, 6, 'Padre'), (6, 4, 'Hijo'),
         (5, 8, 'Padre'), (8, 5, 'Hijo'),
         (10, 11, 'Padre'), (11, 10, 'Hijo')
      `
    );
    console.log(`Insertadas ${relResult.affectedRows} relaciones`);

    // 6. Insertar auditoría
    console.log('Insertando auditoría...');
    await connection.query(
      `INSERT INTO Auditoria (id_ci, nombre_ci, fecha_cambio, descripcion_cambio, usuario)
       VALUES
         (1, 'Servidor1', NOW(), 'Creación inicial', 'system'),
         (2, 'Aplicacion1', NOW(), 'Creación inicial', 'system'),
         (3, 'BaseDatos1', NOW(), 'Creación inicial', 'system'),
         (4, 'Servidor2', NOW(), 'Creación inicial', 'system'),
         (5, 'Servidor3', NOW(), 'Creación inicial', 'system'),
         (6, 'Aplicacion2', NOW(), 'Creación inicial', 'system'),
         (7, 'Aplicacion3', NOW(), 'Creación inicial', 'system'),
         (8, 'BaseDatos2', NOW(), 'Creación inicial', 'system'),
         (9, 'BaseDatos3', NOW(), 'Creación inicial', 'system'),
         (10, 'Router1', NOW(), 'Creación inicial', 'system'),
         (11, 'Firewall1', NOW(), 'Creación inicial', 'system'),
         (1, 'Servidor1', NOW(), 'Creación de relación Padre con Aplicacion1', 'system'),
         (1, 'Servidor1', NOW(), 'Creación de relación Padre con BaseDatos1', 'system'),
         (4, 'Servidor2', NOW(), 'Creación de relación Padre con Aplicacion2', 'system'),
         (5, 'Servidor3', NOW(), 'Creación de relación Padre con BaseDatos2', 'system'),
         (10, 'Router1', NOW(), 'Creación de relación Padre con Firewall1', 'system')
    `);

    // 7. Insertar documentación
    console.log('Insertando documentación...');
    await connection.query(
      `INSERT INTO Documentacion (id_ci, enlace_documentacion)
       VALUES
         (1, 'http://docs/servidor1'),
         (2, 'http://docs/aplicacion1'),
         (4, 'http://docs/servidor2'),
         (6, 'http://docs/aplicacion2'),
         (8, 'http://docs/basedatos2'),
         (10, 'http://docs/router1')
    `);

    // 8. Insertar incidentes
    console.log('Insertando incidentes...');
    await connection.query(
      `INSERT INTO Incidentes_Problemas (id_ci, enlace_incidente_problema)
       VALUES
         (1, 'http://incidentes/inc1'),
         (2, 'http://incidentes/inc2'),
         (4, 'http://incidentes/inc3'),
         (7, 'http://incidentes/inc4'),
         (10, 'http://incidentes/inc5')
    `);

    await connection.commit();
    console.log('Base de datos poblada exitosamente');
  } catch (error) {
    await connection.rollback();
    console.error('Error al poblar la base de datos:', error);
    throw error;
  } finally {
    connection.release();
    pool.end();
  }
}

seedDatabase();