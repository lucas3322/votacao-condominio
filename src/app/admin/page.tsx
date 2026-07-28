import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginAdmin, logoutAdmin } from "../actions";

type Props = { searchParams: Promise<{ erro?: string; pagina?: string }> };

const PAGE_SIZE = 20;

function pageItems(current: number, total: number) {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  return [...pages].filter(page => page >= 1 && page <= total).sort((a, b) => a - b);
}

export default async function Admin({ searchParams }: Props) {
  const admin = await isAdmin();
  const params = await searchParams;
  if (!admin) return (
    <main className="login-shell">
      <Link href="/" className="brand"><span>C</span>Condomínio em Conjunto</Link>
      <section className="login-card">
        <p className="eyebrow">ACESSO RESTRITO</p><h1>Área do administrador</h1>
        <p>Entre para acompanhar as adesões por serviço e exportar o relatório.</p>
        {params.erro && <div className="alert error">Usuário ou senha incorretos.</div>}
        <form action={loginAdmin}>
          <label>Usuário<input name="username" autoComplete="username" required /></label>
          <label>Senha<input name="password" type="password" autoComplete="current-password" required /></label>
          <button className="primary">Entrar no painel →</button>
        </form>
        <Link href="/" className="back">← Voltar para a enquete</Link>
      </section>
    </main>
  );

  const totalVotes = await prisma.vote.count();
  const totalPages = Math.max(1, Math.ceil(totalVotes / PAGE_SIZE));
  const requestedPage = Number.parseInt(params.pagina || "1", 10);
  const currentPage = Math.min(Math.max(Number.isFinite(requestedPage) ? requestedPage : 1, 1), totalPages);
  const [summaryVotes, votes] = await Promise.all([
    prisma.vote.findMany({ select: { services: true, windowCount: true } }),
    prisma.vote.findMany({
      orderBy: [{ tower: "asc" }, { apartment: "asc" }],
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  const windows = summaryVotes.reduce((sum, vote) => sum + vote.windowCount, 0);
  const serviceLabels: Record<string, string> = { BLACKOUT: "Cortina blackout", BLIND: "Persiana", WALLPAPER: "Papel de parede", CURTAIN: "Cortina", OTHER: "Outros" };
  const serviceTotals = Object.entries(serviceLabels).map(([key, label]) => ({
    key, label, people: summaryVotes.filter(v => v.services.includes(key)).length,
    windows: summaryVotes.filter(v => v.services.includes(key)).reduce((sum, v) => sum + v.windowCount, 0),
  }));
  const visiblePages = pageItems(currentPage, totalPages);
  const firstRecord = totalVotes ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const lastRecord = Math.min(currentPage * PAGE_SIZE, totalVotes);

  return (
    <main className="dashboard">
      <header className="dash-head"><div><p className="eyebrow">PAINEL MASTER</p><h1>Adesões por serviço</h1><p>Quantidades para organizar o pedido coletivo.</p></div><div className="dash-actions"><a href="/api/report" className="export">↓ Exportar CSV</a><form action={logoutAdmin}><button className="logout">Sair</button></form></div></header>
      <section className="stats">
        <article><span>ADESÕES</span><strong>{totalVotes}</strong><p>apartamentos participantes</p></article>
        <article><span>JANELAS</span><strong>{windows}</strong><p>itens informados</p></article>
        {serviceTotals.map(service => <article key={service.key}><span>{service.label.toUpperCase()}</span><strong>{service.people}</strong><p>pessoas · {service.windows} janelas</p></article>)}
      </section>
      <section className="table-card"><div className="table-title"><h2>Respostas por apartamento</h2><span>{totalVotes} registros</span></div>
        <div className="table-wrap"><table><thead><tr><th>Morador</th><th>Unidade</th><th>Telefone</th><th>Janelas</th><th>Serviços</th><th>Sacada</th><th>Atualizado</th></tr></thead>
        <tbody>{votes.map(v => <tr key={v.id}><td><strong>{v.name}</strong></td><td>{v.tower} · {v.apartment}</td><td>{v.phone}</td><td>{v.windowCount}</td><td><div className="pills">{v.services.map(s => <span className="pill" key={s}>{serviceLabels[s] || s}</span>)}</div></td><td>{v.hasBalcony ? "Sim" : "Não"}</td><td>{v.updatedAt.toLocaleDateString("pt-BR")}</td></tr>)}</tbody></table>{!votes.length && <div className="empty">Nenhuma resposta recebida ainda.</div>}</div>
        {totalVotes > 0 && <nav className="pagination" aria-label="Paginação das respostas">
          <p>Exibindo {firstRecord}–{lastRecord} de {totalVotes}</p>
          <div className="pagination-controls">
            {currentPage > 1 ? <Link href={`/admin?pagina=${currentPage - 1}`} className="page-nav" aria-label="Página anterior">← Anterior</Link> : <span className="page-nav disabled">← Anterior</span>}
            <div className="page-numbers">
              {visiblePages.map((page, index) => <span key={page} className="page-item">
                {index > 0 && page - visiblePages[index - 1] > 1 && <span className="ellipsis">…</span>}
                {page === currentPage ? <span className="page-number current" aria-current="page">{page}</span> : <Link href={`/admin?pagina=${page}`} className="page-number">{page}</Link>}
              </span>)}
            </div>
            {currentPage < totalPages ? <Link href={`/admin?pagina=${currentPage + 1}`} className="page-nav" aria-label="Próxima página">Próxima →</Link> : <span className="page-nav disabled">Próxima →</span>}
          </div>
        </nav>}
      </section>
      <Link href="/" className="back">← Ver formulário de adesão</Link>
    </main>
  );
}
