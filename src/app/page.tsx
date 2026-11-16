import React from "react";

export default function Home() {
  return (
    <div style={{
      fontFamily: "system-ui, -apple-system, sans-serif",
      backgroundColor: "#0F172A",
      color: "#F8FAFC",
      minHeight: "100vh",
      padding: "2rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <header style={{ textAlign: "center", marginBottom: "2.5rem", maxWidth: "800px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#38BDF8", marginBottom: "0.5rem" }}>
          Nivel de Burbuja y Brújula — API Cloud
        </h1>
        <p style={{ color: "#94A3B8", fontSize: "1.1rem" }}>
          Servicio backend en Next.js desplegado en Vercel, mediador de Firebase Authentication y Cloud Firestore.
        </p>
        <div style={{
          display: "inline-block",
          marginTop: "1rem",
          padding: "0.35rem 1rem",
          backgroundColor: "#065F46",
          color: "#34D399",
          borderRadius: "9999px",
          fontWeight: "600",
          fontSize: "0.85rem"
        }}>
          ● API ACTIVA Y EN LÍNEA
        </div>
      </header>

      <main style={{ maxWidth: "800px", width: "100%" }}>
        <section style={{
          backgroundColor: "#1E293B",
          borderRadius: "12px",
          padding: "1.5rem",
          border: "1px solid #334155",
          marginBottom: "1.5rem"
        }}>
          <h2 style={{ fontSize: "1.3rem", color: "#F1F5F9", marginBottom: "1rem" }}>
            📌 Endpoints Disponibles
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <EndpointRow method="GET" path="/api/health" desc="Diagnóstico de estado y hora del servidor" />
            <EndpointRow method="POST" path="/api/auth/registro" desc="Registro de usuario con correo y contraseña (≥8 caracteres)" />
            <EndpointRow method="POST" path="/api/auth/login" desc="Autenticación de usuario; entrega token ID y refreshToken" />
            <EndpointRow method="POST" path="/api/auth/refresh" desc="Renovación de token de sesión expirado" />
            <EndpointRow method="GET" path="/api/auth/yo" desc="Perfil verificado del usuario autenticado (Bearer ID token)" />
            <EndpointRow method="GET" path="/api/mediciones?since=" desc="Sincronización incremental de mediciones privadas" />
            <EndpointRow method="POST" path="/api/mediciones" desc="Guardar nueva medición (nivel, rumbo, altitud)" />
            <EndpointRow method="PUT" path="/api/mediciones/[id]" desc="Actualizar o reemplazar medición existente" />
            <EndpointRow method="DELETE" path="/api/mediciones/[id]" desc="Borrado lógico de una medición" />
            <EndpointRow method="GET" path="/api/mediciones/estadisticas?tipo=" desc="Cálculo de mínimo, máximo y promedio por tipo" />
            <EndpointRow method="GET / PUT" path="/api/ajustes/calibracion" desc="Lectura y guardado de calibración del cero (offset X/Y)" />
          </div>
        </section>

        <section style={{
          backgroundColor: "#1E293B",
          borderRadius: "12px",
          padding: "1.5rem",
          border: "1px solid #334155"
        }}>
          <h2 style={{ fontSize: "1.3rem", color: "#F1F5F9", marginBottom: "0.5rem" }}>
            🔒 Reglas de Seguridad Activas
          </h2>
          <ul style={{ color: "#94A3B8", fontSize: "0.95rem", lineHeight: "1.6", paddingLeft: "1.2rem" }}>
            <li>Todas las credenciales y llaves privadas viven exclusivamente en las variables de entorno de Vercel.</li>
            <li>Cloud Firestore bloquea accesos directos de clientes: <code>allow read, write: if false;</code>.</li>
            <li>Validación estricta de esquemas de datos con Zod en todas las peticiones entrantes.</li>
          </ul>
        </section>
      </main>

      <footer style={{ marginTop: "3rem", color: "#64748B", fontSize: "0.85rem" }}>
        Proyecto 32 · Nivel de burbuja y brújula del constructor
      </footer>
    </div>
  );
}

function EndpointRow({ method, path, desc }: { method: string; path: string; desc: string }) {
  const isGet = method.includes("GET");
  const isPost = method.includes("POST");
  const isDelete = method.includes("DELETE");

  let badgeColor = "#0284C7";
  if (isGet) badgeColor = "#10B981";
  else if (isPost) badgeColor = "#3B82F6";
  else if (isDelete) badgeColor = "#EF4444";

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      backgroundColor: "#0F172A",
      padding: "0.75rem 1rem",
      borderRadius: "8px",
      border: "1px solid #334155"
    }}>
      <span style={{
        backgroundColor: badgeColor,
        color: "#FFFFFF",
        padding: "0.2rem 0.5rem",
        borderRadius: "4px",
        fontWeight: "bold",
        fontSize: "0.75rem",
        minWidth: "60px",
        textAlign: "center"
      }}>
        {method}
      </span>
      <span style={{ color: "#E2E8F0", fontFamily: "monospace", fontSize: "0.9rem", flex: 1 }}>
        {path}
      </span>
      <span style={{ color: "#94A3B8", fontSize: "0.8rem" }}>
        {desc}
      </span>
    </div>
  );
}
