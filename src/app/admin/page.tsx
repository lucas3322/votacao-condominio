import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginAdmin, logoutAdmin } from "../actions";

type Props = { searchParams: Promise<{ erro?: string }> };

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

  const votes = await prisma.vote.findMany({ orderBy: [{ tower: "asc" }, { apartment: "asc" }] });
  const windows = votes.reduce((sum, v) => sum + v.windowCount, 0);
  const curtainPeople = votes.filter(v => v.windowChoice === "CURTAIN" || v.balconyChoice === "CURTAIN").length;
  const blindPeople = votes.filter(v => v.windowChoice === "BLIND" || v.balconyChoice === "BLIND").length;
  const curtainWindows = votes.filter(v => v.windowChoice === "CURTAIN").reduce((s, v) => s + v.windowCount, 0);
  const blindWindows = votes.filter(v => v.windowChoice === "BLIND").reduce((s, v) => s + v.windowCount, 0);
  const curtainBalconies = votes.filter(v => v.balconyChoice === "CURTAIN").length;
  const blindBalconies = votes.filter(v => v.balconyChoice === "BLIND").length;

  return (
    <main className="dashboard">
      <header className="dash-head"><div><p className="eyebrow">PAINEL MASTER</p><h1>Adesões por serviço</h1><p>Quantidades para organizar o pedido coletivo.</p></div><div className="dash-actions"><a href="/api/report" className="export">↓ Exportar CSV</a><form action={logoutAdmin}><button className="logout">Sair</button></form></div></header>
      <section className="stats">
        <article><span>ADESÕES</span><strong>{votes.length}</strong><p>apartamentos participantes</p></article>
        <article><span>ITENS TOTAIS</span><strong>{windows + curtainBalconies + blindBalconies}</strong><p>janelas e portas</p></article>
        <article><span>PESSOAS · CORTINA</span><strong>{curtainPeople}</strong><p>{curtainWindows} janelas · {curtainBalconies} portas</p></article>
        <article><span>PESSOAS · PERSIANA</span><strong>{blindPeople}</strong><p>{blindWindows} janelas · {blindBalconies} portas</p></article>
        <article><span>PORTAS DE SACADA</span><strong>{curtainBalconies + blindBalconies}</strong><p>{curtainBalconies} cortina · {blindBalconies} persiana</p></article>
      </section>
      <section className="table-card"><div className="table-title"><h2>Respostas por apartamento</h2><span>{votes.length} registros</span></div>
        <div className="table-wrap"><table><thead><tr><th>Morador</th><th>Unidade</th><th>Telefone</th><th>Janelas</th><th>Preferência</th><th>Sacada</th><th>Atualizado</th></tr></thead>
        <tbody>{votes.map(v => <tr key={v.id}><td><strong>{v.name}</strong></td><td>{v.tower} · {v.apartment}</td><td>{v.phone}</td><td>{v.windowCount}</td><td><span className={`pill ${v.windowChoice.toLowerCase()}`}>{v.windowChoice === "CURTAIN" ? "Cortina" : v.windowChoice === "BLIND" ? "Persiana" : "Nenhuma"}</span></td><td>{v.hasBalcony ? (v.balconyChoice === "CURTAIN" ? "Sim · Cortina" : v.balconyChoice === "BLIND" ? "Sim · Persiana" : "Sim") : "Não"}</td><td>{v.updatedAt.toLocaleDateString("pt-BR")}</td></tr>)}</tbody></table>{!votes.length && <div className="empty">Nenhuma resposta recebida ainda.</div>}</div>
      </section>
      <Link href="/" className="back">← Ver formulário de adesão</Link>
    </main>
  );
}
