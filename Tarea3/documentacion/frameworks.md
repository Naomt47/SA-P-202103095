# Herramientas Utilizadas

El desarrollo del CMDB se basó en MySQL como sistema de gestión de bases de datos y Node.js como entorno de ejecución para el backend.

## MySQL

- MySQL es un sistema de gestión de bases de datos relacional (RDBMS) ampliamente utilizado, con una larga trayectoria en entornos empresariales. Su estabilidad y robustez lo hacen ideal para un CMDB, donde la integridad de los datos es importante.
- Soporta transacciones ACID, lo que garantiza operaciones confiables en la creación, actualización y eliminación de CIs, especialmente en un sistema con múltiples tablas relacionadas.

## Node.js
- Node.js utiliza un modelo de E/S no bloqueante basado en eventos, lo que permite manejar múltiples solicitudes concurrentes de manera eficiente. Esto es ideal para una API RESTful como la del CMDB, que puede recibir múltiples solicitudes de clientes simultáneamente.
- El uso de `async/await` en `ciController.js` y `relacionController.js` simplifica la gestión de operaciones asíncronas con la base de datos.
- La estructura modular del proyecto (controladores, configuración de base de datos, etc.) aprovecha la flexibilidad de Node.js para organizar el código de manera clara y mantenible.
- Node.js se integra fácilmente con MySQL a través de bibliotecas como `mysql2`, que soporta consultas parametrizadas para prevenir inyecciones SQL, como se implementó en `ciController.js` y `seed.js`.