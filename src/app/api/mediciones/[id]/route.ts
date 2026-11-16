import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/middleware/auth-guard";
import { adminFirestore } from "@/lib/firebase-admin";
import { MedicionInputSchema } from "@/schemas/medicion.schema";

export const runtime = "nodejs";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = MedicionInputSchema.safeParse({ ...body, id });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Datos de medición inválidos",
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
    const docRef = db.doc(`usuarios/${user.uid}/medicion/${id}`);

    const existing = await docRef.get();
    const created_at = existing.exists ? existing.data()?.created_at || now : now;

    const docData = {
      ...parsed.data,
      id,
      created_at,
      updated_at: now,
      deleted_at: null,
    };

    await docRef.set(docData);

    return NextResponse.json(docData, { status: 200 });
  } catch (error) {
    const msg = (error as Error).message || "Error al actualizar medición";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const db = adminFirestore();
    const docRef = db.doc(`usuarios/${user.uid}/medicion/${id}`);
    const existing = await docRef.get();

    if (!existing.exists) {
      return NextResponse.json({ error: "Medición no encontrada" }, { status: 404 });
    }

    const now = new Date().toISOString();
    await docRef.update({
      deleted_at: now,
      updated_at: now,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const msg = (error as Error).message || "Error al eliminar medición";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
