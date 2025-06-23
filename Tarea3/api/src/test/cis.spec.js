const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

beforeAll(async () => {
  await db.query(`
    CREATE TEMPORARY TABLE Tipo_CI (
      id_tipo_ci INT AUTO_INCREMENT PRIMARY KEY,
      nombre_tipo VARCHAR(50) UNIQUE NOT NULL
    )
  `);
  await db.query(`
    CREATE TEMPORARY TABLE CI (
      id_ci INT AUTO_INCREMENT PRIMARY KEY,
      nombre_ci VARCHAR(255) UNIQUE NOT NULL,
      id_tipo_ci INT,
      descripcion TEXT,
      numero_serie VARCHAR(100),
      version VARCHAR(50),
      fecha_adquisicion DATETIME DEFAULT CURRENT_TIMESTAMP,
      estado_actual ENUM('Activo', 'Inactivo', 'En Mantenimiento', 'Retirado'),
      ubicacion_fisica VARCHAR(255),
      propietario_responsable VARCHAR(255),
      niveles_seguridad ENUM('Alto', 'Medio', 'Bajo'),
      cumplimiento ENUM('Cumple', 'No Cumple', 'Pendiente'),
      estado_configuracion ENUM('Aprobado', 'Pendiente', 'Rechazado'),
      numero_licencia VARCHAR(100),
      fecha_vencimiento DATE,
      ambiente ENUM('DEV', 'QA', 'PROD') NOT NULL
    )
  `);
  await db.query(`
    CREATE TEMPORARY TABLE Auditoria (
      id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
      id_ci INT NULL,
      nombre_ci VARCHAR(255),
      fecha_cambio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      descripcion_cambio TEXT,
      usuario VARCHAR(100) NOT NULL
    )
  `);
  await db.query(`INSERT INTO Tipo_CI (nombre_tipo) VALUES ('Hardware')`);
});

afterAll(async () => {
  await db.query('DROP TEMPORARY TABLE IF EXISTS Auditoria');
  await db.query('DROP TEMPORARY TABLE IF EXISTS CI');
  await db.query('DROP TEMPORARY TABLE IF EXISTS Tipo_CI');
  await db.end();
});

describe('CI API', () => {
  test('Debería crear un CI (Hardware)', async () => {
    const ci = {
      nombre_ci: 'PruebaCI',
      id_tipo_ci: 1,
      numero_serie: 'SN123',
      ubicacion_fisica: 'Sala1',
      ambiente: 'DEV'
    };
    const res = await request(app).post('/cmdb/cis').send(ci);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id_ci');

    // Verificar auditoría
    const [auditoria] = await db.query('SELECT * FROM Auditoria WHERE id_ci = ?', [res.body.id_ci]);
    expect(auditoria.length).toBe(1);
    expect(auditoria[0].nombre_ci).toBe('PruebaCI');
    expect(auditoria[0].descripcion_cambio).toBe('Creación de CI');
  });

  test('Debería fallar al crear un CI sin campos obligatorios', async () => {
    const ci = { nombre_ci: 'PruebaCI' };
    const res = await request(app).post('/cmdb/cis').send(ci);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('Debería obtener un CI por ID', async () => {
    const ci = {
      nombre_ci: 'PruebaCI2',
      id_tipo_ci: 1,
      numero_serie: 'SN456',
      ubicacion_fisica: 'Sala2',
      ambiente: 'DEV'
    };
    const createRes = await request(app).post('/cmdb/cis').send(ci);
    const id = createRes.body.id_ci;
    const res = await request(app).get(`/cmdb/cis/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.nombre_ci).toBe('PruebaCI2');
  });

  test('Debería actualizar un CI', async () => {
    const ci = {
      nombre_ci: 'PruebaCI3',
      id_tipo_ci: 1,
      numero_serie: 'SN789',
      ubicacion_fisica: 'Sala3',
      ambiente: 'DEV'
    };
    const createRes = await request(app).post('/cmdb/cis').send(ci);
    const id = createRes.body.id_ci;
    const update = { nombre_ci: 'PruebaCI3Updated', ambiente: 'PROD' };
    const res = await request(app).put(`/cmdb/cis/${id}`).send(update);
    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toBe('CI actualizado exitosamente');

    // Verificar auditoría
    const [auditoria] = await db.query('SELECT * FROM Auditoria WHERE id_ci = ? AND descripcion_cambio = ?', [id, 'Actualización de CI']);
    expect(auditoria.length).toBe(1);
    expect(auditoria[0].nombre_ci).toBe('PruebaCI3Updated');
  });

  test('Debería eliminar un CI y conservar auditoría', async () => {
    const ci = {
      nombre_ci: 'PruebaCI4',
      id_tipo_ci: 1,
      numero_serie: 'SN012',
      ubicacion_fisica: 'Sala4',
      ambiente: 'DEV'
    };
    const createRes = await request(app).post('/cmdb/cis').send(ci);
    const id = createRes.body.id_ci;
    const res = await request(app).delete(`/cmdb/cis/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toBe('CI eliminado exitosamente');

    // Verificar que la auditoría persiste
    const [auditoria] = await db.query('SELECT * FROM Auditoria WHERE nombre_ci = ?', ['PruebaCI4']);
    expect(auditoria.length).toBeGreaterThan(0);
    expect(auditoria.some(a => a.descripcion_cambio === 'Eliminación de CI')).toBe(true);
  });
});