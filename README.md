# Marcos Climatização e Elétrica — site + painel admin

Segunda instalação da mesma arquitetura usada no projeto **Ateliê do Chapéu / Queiroz Hats**
(Node.js + Express + Turso/libSQL + Cloudinary + Render), adaptada pra um negócio de instalação e
manutenção de ar-condicionado **e serviços elétricos em geral**.

> Nome anterior do projeto: "Marquinhos Climatização" (só ar-condicionado). Renomeado pra "Marcos
> Climatização e Elétrica" quando o escopo do negócio cresceu pra incluir elétrica residencial e
> comercial em geral — todas as referências ao nome antigo foram substituídas no site, no painel e no
> banco de dados.

## Diferenças em relação ao template original

- **"Antes e Depois" virou "Trabalhos Concluídos"** — mesma mecânica (2 fotos + título + descrição),
  só que reaproveitando o conceito pra ar-condicionado/elétrica (aparelho sujo antes / limpo depois,
  parede vazia antes / split instalado depois, quadro velho antes / novo depois) em vez de chapéus.
- **"Mural de Achados" foi mantido**, renomeado só pra "Achados" no site — revenda de ar-condicionado
  usado de cliente, mesma mecânica exata do Queiroz Hats (nome, categoria, preço, foto, botão de
  WhatsApp, frase configurável quando não há nenhum ativo).
- **Nova seção "Agenda" (privada, só no painel)** — calendário mensal onde o dono clica num dia e
  anota compromissos (horário, cliente, telefone, serviço/endereço, observações). Não aparece no site
  público em nenhum momento, é só uma ferramenta de organização pro dono.
- **Serviços agrupados por categoria** — cada serviço tem um campo `categoria`
  (`climatizacao` ou `eletrica`); o site mostra dois grupos com subtítulo ("Climatização" /
  "Elétrica em Geral") em vez de uma grade única, e o painel tem um seletor de categoria por linha.

## Estrutura

```
index.html                        site público
assets/css/style.css               visual azul/marinho
assets/img/hero-bg.jpg             foto de fundo do hero
assets/js/config.js                dados da empresa (gerado pelo painel — não editar à mão)
assets/js/servicos.js              lista de serviços (gerado pelo painel)
assets/js/trabalhos.js             trabalhos concluídos (gerado pelo painel)
assets/js/achados.js               achados (gerado pelo painel)
assets/js/app.js                   lógica de renderização do site
assets/js/assistente.js            widget flutuante "falar no WhatsApp"
admin-backend/                     painel do dono (Node + Express + Turso/libSQL + Cloudinary)
```

Fotos de trabalhos/achados (e a logo) não ficam em `assets/img/` — vão pro Cloudinary e o banco guarda
a URL completa. `hero-bg.jpg` é a única imagem que fica local mesmo (faz parte do design, não é
conteúdo cadastrável pelo painel).

## Painel do dono

7 seções: Dados da empresa, Horários, Serviços (com categoria), Trabalhos Concluídos, Achados,
**Agenda (privada)**, Trocar senha.

## Como rodar

```
cd admin-backend
npm install
node server.js
```
Requer **Node.js 18+**. Sem nenhuma variável de banco/imagem configurada no `.env`, roda 100% local
(banco em arquivo, upload de fotos indisponível até configurar o Cloudinary).

- Site: `http://localhost:5800/`
- Painel: `http://localhost:5800/admin` (login: `admin` / senha em `ADMIN_PASS` no `.env`)

Atualmente reaproveitando a **mesma conta Cloudinary** do projeto Queiroz Hats (pasta separada
`marcos-climatizacao/` dentro dela) — funciona bem pros dois enquanto o volume for pequeno, mas dá
pra separar numa conta própria depois só trocando 3 linhas no `.env` (ver `.env.example`).

## Como publicar de graça (mesmo passo a passo do projeto anterior)

Ver o README do projeto **Ateliê do Chapéu / Queiroz Hats** (seção "Como publicar de graça" e "Lições
aprendidas nesta publicação") pro passo a passo completo de Turso, Cloudinary, Render e domínio —
inclui armadilhas reais já resolvidas que se aplicam aqui também:

- **Render**: deixar o "Root Directory" **em branco** desde o início (não configurar como
  `admin-backend`) e usar `cd admin-backend && npm install` / `cd admin-backend && node server.js`
  como Build/Start Command — evita o bug de auto-deploy silencioso descoberto no projeto anterior.
- **`app.set('trust proxy', 1)`** já está no código deste projeto desde o início (aprendido da vez
  passada), então login em produção atrás do proxy do Render já deve funcionar de primeira.
- Qualquer arquivo de verificação solto na raiz (Google Search Console etc.) deve ter uma rota
  explícita própria — nunca `express.static` apontando pra raiz do projeto inteiro.

## Lições desta entrega

- **Logo com fundo sólido: sempre conferir se há margem vazia embutida no arquivo antes de aplicar.**
  Uma logo com fundo azul-marinho veio com bastante espaço vazio ao redor do desenho (comum em
  exports de design), então mesmo aumentando bastante o tamanho no CSS, o desenho continuava parecendo
  pequeno. Resolvido com `sharp().trim({ background: '#0B2545', threshold: 10 })` — como o fundo era
  uma cor sólida uniforme (diferente do caso do Queiroz Hats, que era foto/print de celular com UI no
  meio), o `trim()` funcionou de primeira. Também foi preciso ajustar a cor de fundo do cabeçalho do
  site pra bater exatamente com o fundo da logo, senão aparecia uma "moldura" sutil.
- **Renomear o negócio no meio do projeto: verificar se o banco de dev já tem dado real antes de
  resetar.** Ao trocar de "Marquinhos" (só ar-condicionado) pra "Marcos Climatização e Elétrica"
  (+ elétrica em geral), o arquivo do banco local também mudou de nome (`marquinhos.sqlite` →
  `marcos.sqlite`), o que faria o servidor recriar um banco vazio do zero. Antes de apagar o banco
  antigo, veio a checagem: como não havia nenhum trabalho/achado/compromisso real cadastrado ainda
  (só dado de teste), foi seguro resetar. Se houvesse conteúdo real, o caminho certo seria renomear o
  arquivo (preservando os dados) e rodar uma migração (`ALTER TABLE ... ADD COLUMN categoria ...`) em
  vez de recriar o schema do zero.

## Testado até agora
- Site e painel rodados e navegados de verdade num navegador (Chromium via Playwright), várias vezes
  ao longo da entrega, incluindo depois do rebrand completo
- Login, CRUD de Trabalhos Concluídos (com upload real de foto antes/depois), CRUD de Achados (com
  upload de foto, preço, categoria) e CRUD de Agenda (criar/remover compromisso) testados ponta a
  ponta, sem erros no console
- Serviços agrupados por categoria (Climatização / Elétrica em Geral) testados no site e no painel,
  incluindo salvar a categoria de um serviço e confirmar que persiste após recarregar a página
- Logo real aplicada e testada (upload real pro Cloudinary) — **pendente trocar pela nova logo** que
  ainda será enviada, já que o nome da empresa mudou
- Foto de fundo do hero aplicada e testada

## Não testado / próximos passos
- Nova logo (nome mudou pra "Marcos") ainda não foi enviada — o badge com iniciais "MC" está sendo
  usado como fallback enquanto isso
- Conteúdo ainda é placeholder no resto — falta WhatsApp real, endereço real, fotos reais de trabalhos
  concluídos e achados de verdade
- Turso, Render, domínio próprio: ainda não configurados — projeto só roda localmente até agora, sem
  repositório no GitHub ainda
