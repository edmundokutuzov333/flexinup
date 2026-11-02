# Flexinup

1. Objetivo

Cria uma landing page de uma só página, mobile-first (90% do tráfego vem de telemóvel), para o lançamento da música "I'M FLEXIN UP'" do artista Khriys com INF8M8US, em www.flexinup.com.

O site tem 3 funções:

Dar uma experiência imersiva de lançamento (intro, bastidores, 3D, prémios).
Permitir que o visitante grave um vídeo de 30s no próprio site, com a música e o filtro oficial DV camera. Esta é a função principal.
Gerar partilha viral: o visitante descarrega, publica e faz tag ao Khriys.

Idioma: Português (Moçambique), com microcopy curta, seca e de rua. O nome da música e os créditos ficam sempre em inglês.

2. Direção de arte

Conceito: "Flex na escuridão." É um quarto escuro onde só o ouro, o dinheiro e a luz do telemóvel brilham. O visual é trap raiz com estética opium: gótico, agressivo, minimalista, com tipografia e elementos distorcidos e cru de propósito.

Paleta

Preto profundo #050505 (fundo), grafite #0E0E0E (superfícies)
Ouro #D4AF37 com brilho #FFD86B (joias, CTAs, destaques)
Verde night-vision #39FF7A (só no filtro, HUD e pequenos acentos)
Vermelho REC #FF2A2A (apenas indicador de gravação)
Branco osso #EDEDED (texto)

Tipografia

Títulos: fonte gótica/blackletter ou display condensada ultra-bold (ex.: UnifrakturCook, "Pirata One" ou "Anton"), com letter-spacing apertado e leve glitch em hover.
Corpo e HUD: monoespaçada (ex.: "Space Mono" ou "JetBrains Mono"), com ar de câmara de vigilância.
Nunca mais de 2 famílias.

Textura e efeitos globais (todos leves, via CSS ou canvas, sem peso):

Grão de filme animado a 8–10% de opacidade
Vinheta óptica forte e exposição com flicker subtil nos cantos
Scanlines subtis nas secções de vídeo
Cursor customizado (cruz de mira dourada) no desktop
Pequenos símbolos opium: cruzes, estrelas de 4 pontas, números em fonte pixel nos cantos
Texto que "falha" (glitch RGB-split) em hover e em transições

Movimento: rápido e seco. Cortes e snap, sem easing suave. Ouro com brilho (shimmer) que passa em loop. Parallax discreto.

Os anexos desta mensagem são os assets: KHRYIS.webp e INF8M8US.webp (retratos dos artistas recortados, com acessórios de ouro, para o hero), DINHEIRO.webp (notas de mil meticais) e GOYARD.png (bolsa Goyard) para a secção de prémios 3D. O áudio da música e os vídeos de bastidores ainda não existem: cria placeholders num único ficheiro de configuração, fáceis de preencher depois, incluindo handles e links finais (Spotify, Apple Music, YouTube, Audiomack, Instagram).

3. Fluxo da página
Ecrã 0: Gate "ENTER" (obrigatório)

Os browsers bloqueiam áudio automático. O ecrã inicial é um fundo preto com um botão central "ENTER" em ouro, a pulsar como um coração, e o texto "Som ligado. Luzes apagadas." O toque no botão desbloqueia o áudio e inicia a intro.

Intro (máx. 8–10 segundos, com botão "SKIP" discreto)
Toca o início da música ("intro do beat").
Joias (correntes, relógios, anéis) rondam o ecrã em 3D ou 2.5D, com desfoque de movimento, brilho e flares dourados, em sincronia com as batidas.
Cortes rápidos, glitch, zoom, flashes brancos curtos.
Texto gigante a aparecer em sequência: I'M FLEXIN UP'.
Fecha com um smash cut para o logo/título e a entrada na página.
Depois da primeira visita, a intro só repete se o utilizador quiser ("Ver intro de novo").

Secção 1: Hero
Título I'M FLEXIN UP' gigante, com efeito metálico dourado e brilho.
Khriys x INF8M8US por baixo.
Fotos PNG recortadas dos dois artistas (anexos), grandes, sobrepostas ao título (uma por lado, com o texto atrás e as cabeças a "quebrar" a tipografia).
Animação das fotos:
Respiração subtil (escala 1.00→1.02)
Parallax com o movimento do rato ou o giroscópio
Brilho dourado: máscara sobre as zonas das correntes e relógios, com sparkles animados (partículas de 4 pontas a cintilar em loop)
Glitch pontual (a cada poucos segundos)
Botão-herói gigante: "FAZ O TEU FLEX →" (leva à secção do challenge).
Botão secundário: "Ouvir agora" (player da música).

Secção 2: THE CHALLENGE (a mais importante)

Ocupa um ecrã inteiro, bem destacada e visualmente diferente das outras (moldura ouro, fundo com verde night-vision, a pulsar).

Título: "FAZ O TEU FLEX. 30 SEGUNDOS."

Passos (3 ícones): 1) Filma. 2) Partilha com tag @khriys. 3) Ganha.

Botão principal enorme: "FILMAR AGORA".

Experiência de gravação (modal em ecrã inteiro, formato vertical 9:16):

Pede permissão de câmara, com um texto de preparação antes do pedido do browser ("Precisamos da câmara para o filtro. Nada é enviado para servidores.").
Pré-visualização ao vivo já com o filtro oficial aplicado.
Botão grande de gravar. Contagem 3-2-1 com glitch.
Durante 30s a música toca (o refrão/trecho principal) e o vídeo é gravado. Barra de progresso fina em ouro, tempo no canto em fonte mono.
No fim: pré-visualização do resultado, com botões "DESCARREGAR", "PARTILHAR" e "REFAZER".
Depois de descarregar: ecrã de sucesso com a legenda pronta a copiar, por exemplo:
I'M FLEXIN UP' 🔥 @khriys x @inf8m8us — ouve já em flexinup.com #FlexinUp #Khriys
(os handles do Instagram vão como variáveis fáceis de editar.)

Câmara frontal por defeito, com botão para trocar. Se a câmara for negada ou não existir: mensagem clara e amigável, com alternativa ("Abre no telemóvel").

Secção 3: Prémios (3D)
Título: "O QUE ESTÁ EM JOGO".
Duas peças em 3D, uma por prémio (usa os PNG anexos das notas de mil meticais e da bolsa Goyard):
Notas de mil meticais: a pairar e rodar lentamente, com chuva de notas ao fundo em loop leve, brilho e reflexo.
Bolsa Goyard: a rodar com luz de estúdio dourada, com reflexo no chão escuro.
Texto: 5.000 MT + Bolsa Goyard original.
Interação: o utilizador pode rodar o modelo com o dedo ou o rato. Em hover/toque, o modelo "salta" e solta sparkles.
Regras resumidas (em cards simples):
Segue o Khriys no Instagram (obrigatório).
Publica o teu vídeo e faz tag ao khriys.
Ganha quem tiver mais likes no vídeo, mas só se estiver a seguir o Khriys.
Link para "Regulamento completo".

Secção 4: Submissão ("Entra no ranking")

Formulário curto (3 campos):

@ do Instagram @khriys_say_chris
Link da publicação https://www.instagram.com/reel/DZHSr3fNAfF/?exln=YjljMmRqOGNweWN3

Os dados guardam-se no backend (Supabase). Confirmação com mensagem e animação. Depois da submissão, mostra uma grelha com os vídeos/handles inscritos (apenas links e @, não alojar os vídeos).

Secção 5: Bastidores
Galeria de vídeo vertical e horizontal do estúdio, com efeito de snap-scroll horizontal.
Cada clip em autoplay mudo, loop, com filtro grão e vinheta. Toque para ver em ecrã inteiro com som.
Legendas curtas em fonte mono ("STUDIO · 03:14AM · TAKE 7").
Carregamento lazy: só carrega o clip quando estiver perto do ecrã.
(Enquanto os vídeos de bastidores não existem, usa placeholders elegantes com o mesmo estilo.)

Secção 6: Ouvir + Links
Player customizado da música (play/pause, onda animada).
Botões de streaming (Spotify, Apple Music, YouTube, Audiomack): placeholders para eu preencher.
Instagram do Khriys em destaque com botão "SEGUIR".
Rodapé

Khriys x INF8M8US, créditos, regulamento, política de privacidade, "© 2026".

4. O vídeo que o utilizador grava (identidade do filtro)

O vídeo final tem de parecer de câmara de visão noturna, bem editado e pronto para publicar.

Filtro (WebGL, shader em tempo real no canvas)

Imagem low-light de câmara digital antiga, com verdes sujos, cinzentos e highlights amarelo-oliva
Sombras esmagadas, contraste irregular, highlights queimados e halation suave
Ruído de sensor, grain temporal e textura de compressão
Scanlines/interlace subtil, smear cromático e instabilidade horizontal ocasional
Vinheta forte
Oscilação de exposição e pequenos signal tears, com intensidade reactiva à batida do beat
Efeito de olhos/luzes a "estourar" quando há fontes de luz (bloom em pontos brilhantes)

Overlay gráfico permanente (queimado no vídeo)

O vídeo contém apenas três linhas de identidade: I'M FLEXIN UP / Ouça já em www.flexinup.site / Khriys x INF8M8US
Topo, centro e grande: I'M FLEXIN UP'
Logo abaixo: "Ouça já em www.flexinup.com"
Rodapé: Khriys x INF8M8US
Sem HUD técnico, timecode, ISO, bateria, marcas de enquadramento ou indicadores adicionais
Tudo dentro da safe zone do Instagram/TikTok (margens de ~10% e longe da zona de botões e legenda)

Fim do vídeo (últimos 2s): flash branco e cartão final com o título + URL.

5. Requisitos técnicos (críticos)

Performance (não pode travar)

Mobile-first. Meta: LCP < 2.5s em 4G e 60 fps na página, ≥ 30 fps no filtro.
O filtro corre numa só pass de shader WebGL2 (sem processamento por pixel em JavaScript).
Resolução de captura 720×1280 a 30 fps, com devicePixelRatio limitado a 2. Se o frame time subir demais, baixa automaticamente a qualidade do filtro (grão, bloom) sem avisar o utilizador.
Modelos 3D: como só tenho PNG, renderiza as notas e a bolsa com three.js / react-three-fiber como planos/sprites com iluminação, reflexo e partículas em vez de modelos .glb, com Suspense e placeholder leve, carregados só quando a secção entra no ecrã.
Vídeos dos bastidores comprimidos (H.264, ~1–2 Mbps, versões 480p/720p), preload="none" e poster leve.
Imagens dos artistas em WebP/AVIF com várias resoluções.
Animações com transform/opacity apenas. Respeitar prefers-reduced-motion (versão calma, sem glitch).
Um único bundle enxuto, sem bibliotecas pesadas desnecessárias.

Gravação

getUserMedia (câmara frontal, vertical) → texture WebGL → filtro → canvas.
canvas.captureStream(30) + trilho de áudio da música (via AudioContext → MediaStreamDestination, para a música ficar gravada limpa, sem depender do microfone) → MediaRecorder.
Microfone opcional e desligado por defeito (para quem quer cantar/falar por cima). Aviso: "Usa auscultadores se ligares o microfone."
Formato preferido: MP4/H.264 + AAC (MediaRecorder.isTypeSupported), porque o Instagram aceita melhor. Fallback: WebM. Se só houver WebM, converter no cliente apenas se for necessário e leve; caso contrário, avisar de forma simples.
Duração fixa de 30s, com paragem automática. Revogar as URLs de objeto (revokeObjectURL) depois de usar, para não gastar memória.
Partilhar: usar a Web Share API com ficheiro quando disponível (telemóvel), com download direto como alternativa em todos os dispositivos.
Nada do vídeo é enviado para servidores: tudo corre no dispositivo. Dizer isto na interface.

Áudio: só inicia após interação do utilizador. Controlo de mute sempre visível. A música tem de estar em MP3/AAC otimizado, com o trecho de 30s já cortado para o challenge. Como ainda não tenho o ficheiro de áudio, cria o pipeline completo com um placeholder de áudio silencioso ou tom gerado, fácil de substituir pelo MP3 final.

Compatibilidade: iOS Safari, Android Chrome e desktop. Testar MediaRecorder no Safari. Se o dispositivo não suportar, mostrar uma mensagem clara em vez de uma falha.

SEO e partilha: título e descrição, Open Graph e Twitter Card com imagem forte (1200×630), favicon dourado, lang="pt".

Backend: Supabase para as submissões (tabela entries: handle IG, link do post, contacto, data, estado). Painel simples e protegido para a equipa validar. Proteção anti-spam (limite por IP e honeypot).

6. Design de UX, CX e Service Design

UX

O botão "FILMAR AGORA" fica visível desde o hero (CTA fixo no telemóvel, discreto, depois do scroll) e é o maior elemento da página.
Máximo 3 toques entre abrir o site e começar a gravar.
Estados claros em todos os passos: a pedir permissão, a carregar o filtro, a gravar, pronto, erro.
Feedback imediato (vibração curta no telemóvel quando começa/acaba a gravação).
Alvos de toque ≥ 48px. Contraste de texto acessível (ouro/branco sobre preto). Legendas e alternativas em texto para o essencial.
Navegação por âncoras (mini-menu fixo, minimalista).

CX (experiência de ponta a ponta)

Cada passo tem um "momento de prazer": a intro, o primeiro frame do filtro, a contagem, o ecrã de sucesso com o brilho dourado.
Linguagem de equipa, direta e confiante, sem formalidade.
Mostrar prova social: "X pessoas já entraram" (contador real vindo do backend) e a grelha de participantes.

Service Design (o que acontece por trás)

Ciclo completo: descoberta (redes do artista) → site → gravação → publicação com tag → submissão do link → verificação pela equipa → ranking por likes → anúncio do vencedor.
Mostrar no site as datas: início, fim do challenge e data do anúncio.
O site não consegue verificar likes nem se a pessoa segue o Khriys. A verificação é manual, feita pela equipa na data de fecho, com o perfil público e o post visível. Deixar isso explícito no regulamento, tal como os critérios de desempate, a desqualificação (contas falsas, likes comprados) e como o vencedor é contactado.
Página de regulamento e privacidade (câmara, dados de contacto).

7. Ativos
Já fornecidos como anexos: PNG do Khriys e do INF8M8US (com acessórios de ouro), PNG das notas de mil meticais e da bolsa Goyard.
Faltam (usar placeholders editáveis no ficheiro de configuração): áudio da música (e o trecho de 30s), vídeos de bastidores, handles e links finais.

8. Resultado esperado

Um site sombrio, rápido e inesquecível, que faz o visitante sentir que está a entrar no mundo do Khriys e quer filmar o seu flex em segundos. A prioridade, por ordem: (1) a gravação com filtro funciona e é fluida, (2) a página não trava, (3) o visual é impecável.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://flexinup.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6d19a1dc-c6b9-4a80-9d96-f15f380e3156).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Requires Node.js 24.x and Bun. The repository uses the committed `bun.lock` lockfile.

```sh
git clone <this-repository-url>
cd flexinup
bun install --frozen-lockfile
bun run dev
```

Production build:

```sh
bun run build
```

## Vercel production

The production deployment is connected to this GitHub repository and tracks `main`.

- Framework preset: `tanstack-start-lovable`
- Root directory: repository root
- Node.js runtime: `24.x`
- Install command: `bun install --frozen-lockfile`
- Build command: `bun run build`

The Vercel project requires these environment variables for the Supabase-backed ranking, submissions and team panel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_CODE`

Keep secret keys encrypted in Vercel. Never commit their values to this repository.
