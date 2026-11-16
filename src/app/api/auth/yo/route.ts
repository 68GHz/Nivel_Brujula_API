import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/middleware/auth-guard";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return NextResponse.json({
    usuario: {
      id: user.uid,
      email: user.email,
      rol: user.rol,
    },
  });
}
