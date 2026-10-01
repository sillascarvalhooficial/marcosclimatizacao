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
- **Selo de qualidade e banner de urgência (opcionais)** — dois campos de texto livre em "Dados da
  empresa" (`seloQualidade`, `urgenciaTexto`). Cada um só aparece no site quando preenchido; vazio,
  fica escondido automaticamente. Pensados pra reforçar confiança na parte elétrica (mais sensível a
  segurança do que ar-condicionado) sem forçar informação que o dono ainda não tem pra dar.

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

**"Esqueci minha senha" (2026-10-01):** a tela de login tem um link que redefine a senha do painel sem
precisar da senha atual, usando a `MASTER_RESET_PASSWORD` do `.env` (mesma senha mestre em todos os
projetos — só o Sillas sabe). Serve pra quando o cliente esquece a senha dele. **Lembrar de configurar
`MASTER_RESET_PASSWORD` também nas variáveis de ambiente do Render**, senão o reset falha em produção.

Atualmente reaproveitando a **mesma conta Cloudinary** do projeto Queiroz Hats (pasta separada
`marcos-climatizacao/` dentro dela) — funciona bem pros dois enquanto o volume for pequeno, mas dá
pra separar numa conta própria depois só trocando 3 linhas no `.env` (ver `.env.example`).

Domínio comprado inicialmente foi diferente do planejado no meio da entrega (`marcosclimatizacao.com.br`
→ `mhclima.com.br`, decisão do dono) — sem problema, o processo de apontar domínio no Render/registro.br
é o mesmo independente do nome escolhido.

## Status (2026-09-28) — publicado e em produção

Projeto publicado seguindo o mesmo playbook do Queiroz Hats. Site, painel, banco (Turso), imagens
(Cloudinary) e domínio próprio testados de ponta a ponta em produção, não só localmente.

- Site no ar: **https://mhclima.com.br** (também responde em `https://www.mhclima.com.br` e em
  `https://marcosclimatizacao.onrender.com`)
- Repositório: `github.com/sillascarvalhooficial/marcosclimatizacao`
- Banco: Turso (`marcos-climatizacao.aws-us-east-1.turso.io`), com os dados reais que já existiam no
  banco local (logo, WhatsApp, Instagram, selo de qualidade, horário) migrados — não foi um reseed do
  zero, ver lição abaixo
- Login testado em produção (sessão persistindo atrás do proxy do Render, graças ao `trust proxy`
  configurado desde o início)
- UptimeRobot configurado (monitor HTTP/S a cada 5 min em `https://mhclima.com.br`)
- **Google Search Console verificado**, com `robots.txt` e `sitemap.xml` (rotas explícitas, mesmo
  padrão do arquivo de verificação — nunca `express.static` na raiz) e indexação da home solicitada
  manualmente via "Inspeção de URL" (acelera a página aparecer nas buscas, em vez de esperar o
  rastreamento espontâneo do Google)

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
- **Campo novo numa tabela que já existe com dado real → sempre migração, nunca reset.** Foi o caso
  do `seloQualidade`/`urgenciaTexto`: dessa vez a tabela `loja` já tinha a logo real aplicada, então
  em vez de recriar o schema, `criarSchema()` roda um `ALTER TABLE loja ADD COLUMN ...` dentro de um
  `try/catch` (ignora erro se a coluna já existe) toda vez que o servidor sobe. Funciona tanto pra
  banco novo (a coluna já nasce na `CREATE TABLE`, o `ALTER` falha silenciosamente) quanto pra banco
  antigo (a coluna é adicionada na hora). Esse padrão deve ser reaproveitado pra qualquer campo novo
  daqui pra frente.
- **Não inventar selo/certificação: perguntar o que o dono realmente tem.** Antes de escrever o texto
  do "selo de qualidade", perguntei ao usuário qual credencial real ele possui (curso técnico, NR-10,
  anos de experiência, garantia formal) em vez de supor. Ele tinha curso técnico + NR-10, então foi
  isso que entrou no selo. Alegar uma certificação que o cliente não tem seria enganoso — e no ramo
  elétrico, especificamente, pode ter implicação de segurança/responsabilidade real.
- **Campo opcional "vazio por padrão, dono ativa quando quiser"**: a urgência elétrica foi implementada
  mas deixada em branco de propósito, a pedido do usuário — ele mesmo decide quando (e se) vai
  oferecer atendimento de urgência, então o valor por padrão nunca deve ser um texto genérico
  inventado pra "preencher o espaço".
- **Altura fixa de logo no CSS não escala entre designs diferentes.** A logo nova tem 3 linhas de
  texto empilhadas (nome + "Climatização" + "Elétrica em Geral"), mais alta proporcionalmente que a
  logo anterior. Com a mesma `height` fixa no CSS (170px) que funcionava pra logo antiga, a nova
  ficava com a largura resultante bem menor, sobrando um vão vazio grande no cabeçalho até o botão
  do WhatsApp — o usuário chamou isso de "parece que está um buraco". Resolvido aumentando a altura
  pra 210px (a largura acompanha, mesma proporção). Lição: ao trocar de logo, sempre conferir o
  resultado visual completo do cabeçalho, não só se a imagem em si carregou certo — a altura ideal
  depende da proporção específica de cada design.
- **Banco local com dado real → migrar pro Turso, nunca deixar `seedInicial()` rodar de novo lá.**
  Diferente do Queiroz Hats (que começou com Turso desde o início, tudo placeholder), este projeto já
  tinha logo, WhatsApp, Instagram, selo de qualidade e horário reais no banco local quando chegou a
  hora de publicar. Simplesmente configurar `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` e subir pro Render
  teria disparado `seedInicial()` (que só roda se não existir admin) num banco Turso vazio, recriando
  tudo com os valores de placeholder do seed e perdendo o conteúdo real. Fix: um script avulso de
  migração (rodado uma vez, localmente, não commitado) que conecta nos dois bancos via
  `@libsql/client` — um apontando pro arquivo local, outro pro Turso — roda o mesmo `CREATE TABLE`
  no destino e copia linha por linha (`SELECT *` na origem → `INSERT` no destino, preservando os IDs)
  de todas as tabelas. Confirmado com uma leitura de conferência no banco Turso antes de considerar a
  migração concluída.
- **Domínio pode mudar de nome no meio do processo — sem problema, mas confirmar antes de configurar
  DNS.** O usuário tinha mostrado `marcosclimatizacao.com.br` antes, mas o domínio realmente comprado
  foi `mhclima.com.br`. O processo de apontar (Render "Add Custom Domain" → registros A/CNAME →
  registro.br) é idêntico independente do nome; só vale sempre confirmar qual domínio foi comprado de
  fato antes de gerar as instruções de DNS.
- **Depois de configurar DNS, o certificado HTTPS é um passo separado que também leva um tempo.**
  Mesmo com o DNS já propagado e confirmado via Cloudflare DoH, o domínio ainda respondeu erro de TLS
  (`schannel: SEC_E_ILLEGAL_MESSAGE` / handshake falho) por alguns minutos — o Render precisa detectar
  o DNS correto e emitir o certificado Let's Encrypt antes do HTTPS funcionar. Não é motivo de
  preocupação, só esperar mais um pouco e testar de novo.

## Testado até agora
- Site e painel rodados e navegados de verdade num navegador (Chromium via Playwright), várias vezes
  ao longo da entrega, incluindo depois do rebrand completo
- Login, CRUD de Trabalhos Concluídos (com upload real de foto antes/depois), CRUD de Achados (com
  upload de foto, preço, categoria) e CRUD de Agenda (criar/remover compromisso) testados ponta a
  ponta, sem erros no console
- Serviços agrupados por categoria (Climatização / Elétrica em Geral) testados no site e no painel,
  incluindo salvar a categoria de um serviço e confirmar que persiste após recarregar a página
- Nova logo ("Marcos") aplicada pelo fluxo real do painel (upload → Cloudinary → site) e testada
- Selo de qualidade testado (aparece na seção "Sobre" com o texto real do dono)
- Banner de urgência testado nos dois estados: preenchido (aparece, com link de WhatsApp correto) e
  vazio (fica escondido) — deixado vazio de propósito, o dono ativa quando quiser
- Foto de fundo do hero aplicada e testada
- **Contato real preenchido**: WhatsApp/telefone `(44) 99980-6739` e Instagram
  `@marcos_climatizacao022`, aplicados pelo painel e conferidos no cabeçalho, topo, seção de contato
  e rodapé do site
- **Dias de atendimento reais**: horário fixo (seg-sex + sáb) trocado por um único período
  "Segunda a sábado, com agendamento", já que o atendimento passou a ser só por agendamento

## Não testado / próximos passos
- Fotos reais de trabalhos concluídos e achados ainda faltam (placeholder vazio)
- Endereço/área de atendimento ainda é o texto genérico original ("Atendimento residencial e
  comercial") — falta confirmar se o dono quer detalhar bairros/cidades
- FAQ e depoimentos (sugestões de melhoria dadas ao usuário) ficaram pra depois, ainda não
  implementados
