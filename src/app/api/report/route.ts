import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const cell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET() {
  if (!(await isAdmin())) return new Response("Não autorizado", { status: 401 });
  const votes = await prisma.vote.findMany({ orderBy: [{ tower: "asc" }, { apartment: "asc" }] });
  const header = ["Nome", "Telefone", "Torre", "Apartamento", "Janelas", "Serviços", "Tem sacada", "Observações", "Atualizado em"];
  const labels: Record<string, string> = { BLACKOUT: "Cortina blackout", BLIND: "Persiana", WALLPAPER: "Papel de parede", CURTAIN: "Cortina", OTHER: "Outros" };
  const rows = votes.map(v => [v.name, v.phone, v.tower, v.apartment, v.windowCount, v.services.map(s => labels[s] || s).join(", "), v.hasBalcony ? "Sim" : "Não", v.notes, v.updatedAt.toLocaleString("pt-BR")]);
  const csv = "\uFEFF" + [header, ...rows].map(row => row.map(cell).join(";")).join("\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="relatorio-enquete.csv"' } });
}
