import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/flex/LegalPage";
import { formatDatePt, site } from "@/config/site";

const T = "Regulamento — I'M FLEXIN UP' Challenge";
const D = "Regras do challenge I'M FLEXIN UP': quem pode participar, como se ganha, verificação, desempate e desqualificação.";

export const Route = createFileRoute("/regulamento")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/regulamento" }],
  }),
  component: Page,
});

function Page() {
  const c = site.challenge;
  const k = site.handles.khriys;
  return (
    <LegalPage title="Regulamento">
      <section>
        <h2>Datas</h2>
        <ul>
          <li>Início: {formatDatePt(c.startDate)}</li>
          <li>Fecho: {formatDatePt(c.endDate)}, 23:59 (hora de Maputo)</li>
          <li>Anúncio do vencedor: {formatDatePt(c.announceDate)}</li>
        </ul>
      </section>
      <section>
        <h2>Prémios</h2>
        <p>{c.prizeMoney} + {c.prizeItem}. Um vencedor. O prémio não é trocável por dinheiro.</p>
      </section>
      <section>
        <h2>Como participar</h2>
        <ul>
          <li>Seguir @{k} no Instagram (obrigatório até ao anúncio).</li>
          <li>Gravar um vídeo com a música I'M FLEXIN UP' (o filtro do site é recomendado).</li>
          <li>Publicar no Instagram com tag @{k}, conta e post públicos.</li>
          <li>Inscrever o @ e o link do post na secção "Entra no ranking".</li>
        </ul>
      </section>
      <section>
        <h2>Como se ganha</h2>
        <p>Ganha o vídeo com mais likes à data de fecho, desde que a conta siga @{k}.</p>
        <p>O site não verifica likes nem seguidores. A verificação é manual, feita pela equipa na data de fecho, com o perfil público e o post visível. Posts privados, apagados ou inacessíveis não contam.</p>
      </section>
      <section>
        <h2>Desempate</h2>
        <p>Em caso de empate, ganha o vídeo publicado primeiro. Se persistir, decide a equipa do Khriys pela criatividade.</p>
      </section>
      <section>
        <h2>Desqualificação</h2>
        <ul>
          <li>Contas falsas, likes comprados ou bots.</li>
          <li>Conteúdo ofensivo, violento ou que use a imagem de terceiros sem autorização.</li>
          <li>Várias contas da mesma pessoa.</li>
        </ul>
      </section>
      <section>
        <h2>Contacto com o vencedor</h2>
        <p>O vencedor é anunciado no Instagram @{k} e contactado por mensagem direta e pelo contacto inscrito. Tem 7 dias para responder; sem resposta, o prémio passa ao seguinte.</p>
      </section>
    </LegalPage>
  );
}
