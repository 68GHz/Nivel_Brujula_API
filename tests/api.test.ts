import { describe, it, expect, vi } from "vitest";
import { MedicionInputSchema, CalibracionInputSchema } from "../src/schemas/medicion.schema";
import { GET as getAuthYo } from "../src/app/api/auth/yo/route";
import { GET as getEstadisticas } from "../src/app/api/mediciones/estadisticas/route";
import { NextRequest } from "next/server";

vi.mock("@/middleware/auth-guard", () => ({
  verifyAuth: vi.fn(async (req: NextRequest) => {
    const auth = req.headers.get("Authorization");
    if (auth === "Bearer valid-token") {
      return { uid: "user_test_123", email: "test@example.com", rol: "user" };
    }
    return null;
  }),
}));

describe("1. Validación de esquemas Zod (Criterio 11)", () => {
  it("acepta ángulos de nivel válidos entre -90 y 90 grados", () => {
    const validLevel = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      tipo: "nivel",
      valor: 45.5,
      unidad: "grados",
      nota: "Mesa de trabajo",
      lat: 4.6097,
      lng: -74.0817,
      medida_en: new Date().toISOString(),
    };
    const result = MedicionInputSchema.safeParse(validLevel);
    expect(result.success).toBe(true);
  });

  it("rechaza ángulos de nivel fuera de rango (> 90)", () => {
    const invalidLevel = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      tipo: "nivel",
      valor: 110,
      unidad: "grados",
      medida_en: new Date().toISOString(),
    };
    const result = MedicionInputSchema.safeParse(invalidLevel);
    expect(result.success).toBe(false);
  });

  it("rechaza rumbos fuera del rango 0..360", () => {
    const invalidCompass = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      tipo: "rumbo",
      valor: 400,
      unidad: "grados",
      medida_en: new Date().toISOString(),
    };
    const result = MedicionInputSchema.safeParse(invalidCompass);
    expect(result.success).toBe(false);
  });

  it("valida rangos estrictos de calibración (-10 a 10)", () => {
    expect(CalibracionInputSchema.safeParse({ offset_x: 2.5, offset_y: -1.2 }).success).toBe(true);
    expect(CalibracionInputSchema.safeParse({ offset_x: 15, offset_y: 0 }).success).toBe(false);
  });
});

describe("2. Pruebas de Rutas API: Autenticación y Autorización", () => {
  it("responde 401 si no se envía Bearer token en /api/auth/yo", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/yo");
    const res = await getAuthYo(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("No autorizado");
  });

  it("responde 200 y el usuario correspondiente con Bearer token válido", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/yo", {
      headers: { Authorization: "Bearer valid-token" },
    });
    const res = await getAuthYo(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.usuario.id).toBe("user_test_123");
  });

  it("responde 400 en /api/mediciones/estadisticas si el parámetro tipo es inválido", async () => {
    const req = new NextRequest("http://localhost:3000/api/mediciones/estadisticas?tipo=invalido", {
      headers: { Authorization: "Bearer valid-token" },
    });
    const res = await getEstadisticas(req);
    expect(res.status).toBe(400);
  });
});
