import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/middleware/auth-guard";
import { adminFirestore } from "@/lib/firebase-admin";
import { MedicionInputSchema } from "@/schemas/medicion.schema";
import type { Query, QueryDocumentSnapshot } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const since = searchParams.get("since");

  try {
    const db = adminFirestore();
    let query: Query = db.collection(`usuarios/${user.uid}/medicion`);

    if (since) {
      query = query.where("updated_at", ">", since).orderBy("updated_at", "asc");
    } else {
      query = query.orderBy("updated_at", "asc");
    }

    const snapshot = await query.limit(500).get();
    const items = snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data());

    return NextResponse.json({
      items,
      servidor_ahora: new Date().toISOString(),
    });
  } catch (error) {
    const msg = (error as Error).message || "Error al obtener mediciones";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = MedicionInputSchema.safeParse(body);

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
    const docRef = db.doc(`usuarios/${user.uid}/medicion/${parsed.data.id}`);

    const existing = await docRef.get();
    const created_at = existing.exists ? existing.data()?.created_at || now : now;

    const docData = {
      ...parsed.data,
      created_at,
      updated_at: now,
      deleted_at: null,
    };

    await docRef.set(docData);

    return NextResponse.json(docData, { status: 200 });
  } catch (error) {
    const msg = (error as Error).message || "Error al guardar medición";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
