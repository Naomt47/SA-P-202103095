[Regresar](../README.md)

# Instalación

## Requisitos Previos

1. **Node.js**:
   - Versión: 16.x o superior.
   - Descarga e instalación: [https://nodejs.org](https://nodejs.org).
   - Verifica la instalación:
     ```bash
     node --version
     npm --version
     ```

2. **MySQL**:
   - Versión: 8.0 o superior.
   - Descarga e instalación: [https://dev.mysql.com/downloads/](https://dev.mysql.com/downloads/).
   - Verifica la instalación:
     ```bash
     mysql --version

## Pasos de Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/Naomt47/SA-P-202103095.git
   cd Tarea3/api
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar base de datos:
   - Crear una base de datos en MySQL: `CREATE DATABASE cmdb;`
   - Ejecutar el script de creación de tablas:
     ```bash
     mysql -u root -p cmdb < src/models/init.sql
     ```
4. Crear archivo `.env` en la raíz del proyecto:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_contraseña
   DB_NAME=cmdb
   PORT=3000
   ```
5. Ekecutar scripts de carga inicial:
   ```bash
   npm run seed
   ```

## Ejecución
- Iniciar el servidor (con recarga automática):
  ```bash
  npm run dev
  ```
- Ejecutar pruebas:
  ```bash
  npm test
  ```


[Regresar](../README.md)