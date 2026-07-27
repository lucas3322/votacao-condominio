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
          <p className="eyebrow">PEDIDO COLETIVO DO CONDOMÍNIO</p>
          <h1>Quais serviços você tem interesse?</h1>
          <p className="hero-copy">Selecione uma ou mais opções e informe os detalhes do apartamento. Assim conseguimos levantar as quantidades exatas para cada fornecedor.</p>
          <div className="steps">
            <span><b>1</b> Identifique-se</span><span><b>2</b> Informe as janelas</span><span><b>3</b> Confirme</span>
          </div>
        </div>
        <aside className="info-card">
          <span className="info-icon">i</span>
          <div><strong>Levantamento de interesse</strong><p>Não existe opção vencedora. Cada serviço será contabilizado separadamente.</p></div>
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
          <div className="form-heading compact"><div><span>02</span><h2>Serviços de interesse</h2></div></div>
          <fieldset className="services-field">
            <legend>Selecione uma ou mais opções</legend>
            <div className="service-options">
              <label><input type="checkbox" name="services" value="BLACKOUT" /><span><b>Cortina blackout</b><small>Bloqueio de luz para quartos e salas</small></span></label>
              <label><input type="checkbox" name="services" value="BLIND" /><span><b>Persiana</b><small>Modelos sob medida para suas janelas</small></span></label>
              <label><input type="checkbox" name="services" value="WALLPAPER" /><span><b>Papel de parede</b><small>Aplicação decorativa nos ambientes</small></span></label>
              <label><input type="checkbox" name="services" value="CURTAIN" /><span><b>Cortina</b><small>Cortinas tradicionais sob medida</small></span></label>
              <label><input type="checkbox" name="services" value="OTHER" /><span><b>Outros</b><small>Descreva sua necessidade nas observações</small></span></label>
            </div>
          </fieldset>
          <div className="grid two">
            <label>Quantidade de janelas<input name="windowCount" type="number" min="1" max="30" defaultValue="1" required /></label>
            <fieldset><legend>O apartamento tem sacada?</legend><div className="radio-row"><label><input type="radio" name="hasBalcony" value="yes" required /> Sim</label><label><input type="radio" name="hasBalcony" value="no" /> Não</label></div></fieldset>
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
