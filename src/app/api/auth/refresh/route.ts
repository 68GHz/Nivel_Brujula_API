import { NextRequest, NextResponse } from "next/server";
import { AuthRefreshSchema } from "@/schemas/medicion.schema";
import { renovarToken } from "@/lib/firebase-rest-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AuthRefreshSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Datos de refresco inválidos",
          detalles: parsed.error.issues.map((i) => ({
            campo: i.path.join("."),
            mensaje: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const res = await renovarToken(parsed.data.refreshToken);
    return NextResponse.json(res, { status: 200 });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message = (error as Error).message || "Token de refresco inválido";
    return NextResponse.json({ error: message }, { status });
  }
}
