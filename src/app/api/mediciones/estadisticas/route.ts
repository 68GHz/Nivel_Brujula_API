import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/middleware/auth-guard";
import { adminFirestore } from "@/lib/firebase-admin";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");

  if (!tipo || !["nivel", "rumbo", "altitud"].includes(tipo)) {
    return NextResponse.json(
      { error: "Parámetro 'tipo' inválido o faltante (nivel, rumbo, altitud)" },
      { status: 400 }
    );
  }

  try {
    const db = adminFirestore();
    const snapshot = await db
      .collection(`usuarios/${user.uid}/medicion`)
      .where("tipo", "==", tipo)
      .where("deleted_at", "==", null)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({
        tipo,
        total: 0,
        min: null,
        max: null,
        promedio: null,
      });
    }

    const valores: number[] = [];
    snapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      if (typeof data.valor === "number") {
        valores.push(data.valor);
      }
    });

    if (valores.length === 0) {
      return NextResponse.json({
        tipo,
        total: 0,
        min: null,
        max: null,
        promedio: null,
      });
    }

    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const sum = valores.reduce((acc, curr) => acc + curr, 0);
    const promedio = parseFloat((sum / valores.length).toFixed(2));

    return NextResponse.json({
      tipo,
      total: valores.length,
      min,
      max,
      promedio,
    });
  } catch (error) {
    const msg = (error as Error).message || "Error al calcular estadísticas";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
