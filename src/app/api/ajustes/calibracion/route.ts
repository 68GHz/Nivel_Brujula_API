import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/middleware/auth-guard";
import { adminFirestore } from "@/lib/firebase-admin";
import { CalibracionInputSchema } from "@/schemas/medicion.schema";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const db = adminFirestore();
    const docRef = db.doc(`usuarios/${user.uid}/ajustes/calibracion`);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({
        offset_x: 0,
        offset_y: 0,
        updated_at: null,
      });
    }

    return NextResponse.json(doc.data());
  } catch (error) {
    const msg = (error as Error).message || "Error al obtener calibración";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = CalibracionInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Datos de calibración inválidos",
          detalles: parsed.error.issues.map((i) => ({
            campo: i.path.join("."),
            mensaje: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const db = adminFirestore();
    const now = new Date().toISOString();
    const docRef = db.doc(`usuarios/${user.uid}/ajustes/calibracion`);

    const data = {
      offset_x: parsed.data.offset_x,
      offset_y: parsed.data.offset_y,
      updated_at: now,
    };

    await docRef.set(data, { merge: true });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const msg = (error as Error).message || "Error al guardar calibración";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
