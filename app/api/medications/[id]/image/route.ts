import { getCurrentSession } from "@/src/lib/auth";
import { getPrisma } from "@/src/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentSession();

  if (!session) {
    return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { id } = await params;
  const medication = await getPrisma().medication.findFirst({
    where: { id, userId: session.id },
    select: { image: true, imageType: true },
  });

  if (!medication?.image || !medication.imageType) {
    return Response.json({ error: "Kein Packungsbild gefunden." }, { status: 404 });
  }

  return new Response(Buffer.from(medication.image), {
    headers: {
      "Content-Type": medication.imageType,
      "Cache-Control": "private, no-store",
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  });
}
