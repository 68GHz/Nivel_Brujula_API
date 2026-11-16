import { NextRequest, NextResponse } from "next/server";
import { AuthLoginSchema } from "@/schemas/medicion.schema";
import { loginConEmail } from "@/lib/firebase-rest-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AuthLoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Datos de login inválidos",
          detalles: parsed.error.issues.map((i) => ({
            campo: i.path.join("."),
            mensaje: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const res = await loginConEmail(parsed.data.email, parsed.data.password);
    return NextResponse.json(res, { status: 200 });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message = (error as Error).message || "Credenciales inválidas";
    return NextResponse.json({ error: message }, { status });
  }
}
