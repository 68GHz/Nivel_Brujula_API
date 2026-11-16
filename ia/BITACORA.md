# Bitácora de Configuración de IA - Nivel_Burbuja_API

## 1. Propósito
Establecer las restricciones de seguridad, gobernanza y reglas de codificación para el asistente de IA en el repositorio de la API Backend (`Nivel_Burbuja_API`), cumpliendo con la Sección 14 de las especificaciones del proyecto y `AGENTS.md`.

## 2. Restricciones Verificadas
1. **Acceso a Secretos Bloqueado:** Ningún archivo `.env`, `.env.*`, `*.pem`, `*.key`, `*firebase-adminsdk*.json` puede ser leído, consultado ni versionado.
2. **Límites de Directorio:** El asistente no interactúa ni modifica archivos fuera de la raíz del proyecto.
3. **Calidad de Código Estricta:** Tipado TypeScript sin `any`, complejidad ciclomática <= 10, sin `console.log`.
4. **Verificación de Reglas de Firestore:** Acceso cliente directo bloqueado (`allow read, write: if false;`). Todo acceso mediado por la API.

## 3. Decisiones de Arquitectura
- Framework: Next.js 16 con App Router (Route Handlers en runtime Node.js).
- Autenticación: Delegada a Firebase Auth mediante REST API (registro/login) y validación de tokens Bearer con Firebase Admin SDK.
- Base de datos: Cloud Firestore mediado exclusivamente vía Admin SDK.
- Validación: Zod en todos los endpoints antes de interactuar con la base de datos.
- Testing: Vitest para pruebas unitarias de controladores, middleware de autenticación y validación de esquemas.
