import { z } from "zod";

export const MedicionTipoSchema = z.enum(["nivel", "rumbo", "altitud"]);
export type MedicionTipo = z.infer<typeof MedicionTipoSchema>;

export const MedicionUnidadSchema = z.enum(["grados", "metros", "hPa"]);
export type MedicionUnidad = z.infer<typeof MedicionUnidadSchema>;

export const MedicionInputSchema = z.object({
  id: z.string().uuid(),
  tipo: MedicionTipoSchema,
  valor: z.number().finite().refine((val) => !Number.isNaN(val), "El valor debe ser un número válido"),
  unidad: MedicionUnidadSchema,
  nota: z.string().max(250).nullable().optional().default(null),
  lat: z.number().min(-90).max(90).nullable().optional().default(null),
  lng: z.number().min(-180).max(180).nullable().optional().default(null),
  medida_en: z.string().datetime(),
}).refine((data) => {
  if (data.tipo === "nivel") {
    return data.valor >= -90 && data.valor <= 90 && data.unidad === "grados";
  }
  if (data.tipo === "rumbo") {
    return data.valor >= 0 && data.valor <= 360 && data.unidad === "grados";
  }
  if (data.tipo === "altitud") {
    return data.valor >= -500 && data.valor <= 9000 && (data.unidad === "metros" || data.unidad === "hPa");
  }
  return true;
}, {
  message: "El valor y unidad no coinciden con los rangos permitidos para el tipo de medición",
});

export const CalibracionInputSchema = z.object({
  offset_x: z.number().min(-10).max(10),
  offset_y: z.number().min(-10).max(10),
});

export const AuthRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const AuthLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const AuthRefreshSchema = z.object({
  refreshToken: z.string().min(1, "El refreshToken es requerido"),
});
