[Regresar](../README.md)

# Diseño de Base de Datos

## Diagrama Entidad Relación
![](./imgs/diagramaER.png)

### Estructura del Modelo

El modelo consta de las siguientes tablas:
- **Tipo_CI**: Almacena los tipos de CIs (Hardware, Software, Base de Datos).
- **CI**: Contiene los ítems de configuración con atributos como `nombre_ci`, `id_tipo_ci`, `ambiente`, y otros campos opcionales.
- **Relacion_CI**: Registra relaciones entre CIs (por ejemplo, padre/hijo).
- **Auditoria**: Registra los cambios (creación, actualización, eliminación) en los CIs.
- **Documentacion**: Almacena enlaces a documentación asociada a un CI.
- **Incidentes_Problemas**: Registra enlaces a incidentes o problemas relacionados con un CI.


### Justificación del Modelo
1. **No normalización completa en `Auditoria`**:
   - **Eliminación de la clave foránea en `id_ci`**:
     - La tabla `Auditoria` no tiene una clave foránea hacia `CI(id_ci)` para permitir que los registros de auditoría persistan incluso después de que un CI sea eliminado. Esto es crucial para cumplir con el requisito de mantener un historial completo de cambios, ya que la auditoría debe ser inmutable.
     - En lugar de depender de una clave foránea, se agregó el campo `nombre_ci` (redundante con `CI.nombre_ci`) para identificar el CI asociado, incluso si ya no existe. Esto introduce una leve desnormalización, pero asegura que los registros sean legibles y útiles sin depender de la existencia del CI.
    - **Razones**:
     - La integridad referencial estricta no es necesaria para la auditoría, ya que su propósito es histórico. Mantener una clave foránea con `ON DELETE CASCADE` eliminaría los registros de auditoría, lo cual es indeseable. Usar `ON DELETE SET NULL` dejaría `id_ci` como `NULL`, perdiendo contexto. La solución de eliminar la clave foránea y agregar `nombre_ci` equilibra funcionalidad y simplicidad.
     - La desnormalización con `nombre_ci` reduce la necesidad de consultas adicionales a `CI` para obtener el nombre, mejorando el rendimiento en consultas de auditoría.
2. **Campos opcionales en `CI`**:
   - La tabla `CI` incluye múltiples campos opcionales (`descripcion`, `numero_serie`, `version`, etc.) que podrían haberse normalizado en tablas separadas (por ejemplo, una tabla para atributos específicos de Hardware o Software). Sin embargo, se optó por mantenerlos en una sola tabla.
   - **Justificación**:
     - La normalización completa (por ejemplo, tablas separadas por tipo de CI) aumentaría la complejidad de las consultas y el mantenimiento, sin beneficios significativos para el caso de uso del CMDB.
     - Los campos opcionales permiten flexibilidad para diferentes tipos de CIs, y las validaciones en el controlador (`ciController.js`) aseguran que los campos obligatorios por tipo (por ejemplo, `numero_serie` para Hardware) se proporcionen.
     - Esto simplifica las operaciones CRUD y reduce la cantidad de uniones (JOINs) necesarias en las consultas.

[Regresar](../README.md)