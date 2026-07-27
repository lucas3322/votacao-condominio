import Link from "next/link";
import { saveVote } from "./actions";

type Props = { searchParams: Promise<{ sucesso?: string; erro?: string }> };

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <main className="page-shell">
      <header className="topbar">
        <Link href="/" className="brand"><span>C</span>Condomínio em Conjunto</Link>
        <Link href="/admin" className="admin-link">Área do administrador</Link>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">LEVANTAMENTO DE ADESÃO</p>
          <h1>Cortinas e persianas,<br />sem complicação.</h1>
          <p className="hero-copy">Informe quais serviços deseja contratar. Vamos reunir as quantidades de moradores, janelas e portas de sacada para organizar o pedido coletivo.</p>
          <div className="steps">
            <span><b>1</b> Identifique-se</span><span><b>2</b> Informe as janelas</span><span><b>3</b> Confirme</span>
          </div>
        </div>
        <aside className="info-card">
          <span className="info-icon">i</span>
          <div><strong>Não é uma votação</strong><p>Nenhuma opção precisa vencer. O objetivo é somar corretamente quantas pessoas desejam cada serviço.</p></div>
        </aside>
      </section>

      <section className="form-card" id="votar">
        <div className="form-heading"><div><span>01</span><h2>Seu apartamento</h2></div><p>Todos os campos marcados são obrigatórios.</p></div>
        {params.sucesso && <div className="alert success">✓ Adesão salva! Você poderá atualizá-la quando quiser.</div>}
        {params.erro === "ocupado" && <div className="alert error">Este apartamento já respondeu com outro telefone. Fale com o administrador para corrigir.</div>}
        {params.erro && params.erro !== "ocupado" && <div className="alert error">Confira os dados e tente novamente.</div>}
        <form action={saveVote}>
          <div className="grid two">
            <label>Nome completo<input name="name" placeholder="Ex.: Maria Silva" required /></label>
            <label>Telefone / WhatsApp<input name="phone" inputMode="tel" placeholder="(11) 99999-9999" required /></label>
            <label>Torre / bloco<input name="tower" placeholder="Ex.: Torre A" required /></label>
            <label>Apartamento<input name="apartment" placeholder="Ex.: 312" required /></label>
          </div>
          <div className="divider" />
          <div className="form-heading compact"><div><span>02</span><h2>O que você precisa?</h2></div></div>
          <div className="grid two">
            <label>Quantidade de janelas<input name="windowCount" type="number" min="1" max="30" defaultValue="1" required /></label>
            <label>Preferência para as janelas<select name="windowChoice" required><option value="CURTAIN">Cortina</option><option value="BLIND">Persiana</option><option value="NONE">Ainda não quero</option></select></label>
            <fieldset><legend>O apartamento tem sacada?</legend><div className="radio-row"><label><input type="radio" name="hasBalcony" value="yes" required /> Sim</label><label><input type="radio" name="hasBalcony" value="no" /> Não</label></div></fieldset>
            <label>Preferência para a porta da sacada<select name="balconyChoice"><option value="NONE">Não preciso / não se aplica</option><option value="CURTAIN">Cortina</option><option value="BLIND">Persiana</option></select></label>
          </div>
          <label>Observações (opcional)<textarea name="notes" placeholder="Alguma medida, detalhe ou observação importante?" rows={3} /></label>
          <button type="submit" className="primary">Registrar meu interesse <span>→</span></button>
          <p className="privacy">Seus dados serão usados somente para organizar este pedido coletivo.</p>
        </form>
      </section>
      <footer>Condomínio em Conjunto · Quantidades organizadas para o pedido coletivo.</footer>
    </main>
  );
}
