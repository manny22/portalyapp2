# Instrucciones para el Backend - Crear Residente

## Endpoint

```
POST /api/v1/residents
```

---

## Lo que recibe el Backend (Request Body)

```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "phone": "310 123 4567",
  "unitId": "unit-1",
  "propertyId": "1"
}
```

**Campos:**
- `firstName` - string, requerido
- `lastName` - string, requerido
- `email` - string, requerido (formato email válido)
- `phone` - string, opcional
- `unitId` - string, requerido (ID de la unidad)
- `propertyId` - string, requerido (ID de la propiedad)

---

## Lo que debe hacer el Backend

1. Recibir los 6 datos del cuerpo de la solicitud
2. Guardar el residente con esos datos exactos
3. Asignarle un `id` único (UUID o lo que uses)
4. Establecer `isActive` como `true` por defecto
5. Registrar `createdAt` y `updatedAt` con la fecha/hora actual

**No valides:**
- Si el usuario existe o no
- Si el email está duplicado (a menos que sea un constraint de BD)
- Nada especial, solo guarda los datos

---

## Lo que debe devolver el Backend (Response Body)

```json
{
  "id": "resident-uuid-123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "phone": "310 123 4567",
  "unitId": "unit-1",
  "propertyId": "1",
  "isActive": true,
  "createdAt": "2026-08-17T10:30:00Z",
  "updatedAt": "2026-08-17T10:30:00Z"
}
```

**Status HTTP:** `201 Created`

---

## Manejo de Errores

| Caso | Status | Respuesta |
|------|--------|-----------|
| Validación fallida (campos inválidos) | `400` | `{ "error": "descripción del error" }` |
| Fallo al guardar en BD | `500` | `{ "error": "Error al guardar residente" }` |

---

## Resumen

**Entrada:** 6 campos simples  
**Proceso:** Guardar en la BD  
**Salida:** El residente guardado con id, timestamps y isActive

Eso es todo. Sin lógica especial, sin validaciones de usuario, solo guardar.
