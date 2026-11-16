import { NextRequest, NextResponse } from "next/server";
import { AuthRegisterSchema } from "@/schemas/medicion.schema";
import { registrarConEmail } from "@/lib/firebase-rest-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AuthRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Datos de registro inválidos",
          detalles: parsed.error.issues.map((i) => ({
            campo: i.path.join("."),
            mensaje: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const res = await registrarConEmail(parsed.data.email, parsed.data.password);
    return NextResponse.json(res, { status: 201 });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message = (error as Error).message || "Error interno del servidor";
    return NextResponse.json({ error: message }, { status });
  }
}
