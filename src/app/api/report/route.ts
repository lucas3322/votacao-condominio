import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const cell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET() {
  if (!(await isAdmin())) return new Response("Não autorizado", { status: 401 });
  const votes = await prisma.vote.findMany({ orderBy: [{ tower: "asc" }, { apartment: "asc" }] });
  const header = ["Nome", "Telefone", "Torre", "Apartamento", "Janelas", "Preferência janelas", "Tem sacada", "Preferência sacada", "Observações", "Atualizado em"];
  const labels = { CURTAIN: "Cortina", BLIND: "Persiana", NONE: "Nenhuma" };
  const rows = votes.map(v => [v.name, v.phone, v.tower, v.apartment, v.windowCount, labels[v.windowChoice], v.hasBalcony ? "Sim" : "Não", v.balconyChoice ? labels[v.balconyChoice] : "", v.notes, v.updatedAt.toLocaleString("pt-BR")]);
  const csv = "\uFEFF" + [header, ...rows].map(row => row.map(cell).join(";")).join("\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="relatorio-enquete.csv"' } });
}
