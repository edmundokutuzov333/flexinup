import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/flex/LegalPage";

const T = "Privacidade — I'M FLEXIN UP'";
const D = "Como o site I'M FLEXIN UP' trata a câmara, o microfone e os dados de inscrição no challenge.";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/privacidade" }],
  }),
  component: Page,
});

function Page() {
  return (
    <LegalPage title="Privacidade">
      <section>
        <h2>Câmara e microfone</h2>
        <p>A câmara (e o microfone, se o ligares) só é usada para gravar o teu vídeo. Tudo corre no teu dispositivo. Nenhuma imagem, som ou vídeo é enviado para servidores.</p>
      </section>
      <section>
        <h2>Inscrição no ranking</h2>
        <p>Guardamos o teu @ do Instagram, o link do post, o contacto (opcional) e a data. Guardamos também uma impressão anónima do IP (hash) para travar spam.</p>
        <p>O @ e o link aparecem publicamente na grelha de participantes. O contacto nunca é público e só serve para falar com o vencedor.</p>
      </section>
      <section>
        <h2>Prazo</h2>
        <p>Os dados são apagados até 90 dias depois do anúncio do vencedor. Para apagar antes, fala connosco pelo Instagram.</p>
      </section>
    </LegalPage>
  );
}
