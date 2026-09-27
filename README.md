# Marquinhos Climatização — site + painel admin

Segunda instalação da mesma arquitetura usada no projeto **Ateliê do Chapéu / Queiroz Hats**
(Node.js + Express + Turso/libSQL + Cloudinary + Render), adaptada pra um negócio de instalação e
manutenção de ar-condicionado.

## Diferenças em relação ao template original

- **"Antes e Depois" virou "Trabalhos Concluídos"** — mesma mecânica (2 fotos + título + descrição),
  só que reaproveitando o conceito pra ar-condicionado (aparelho sujo antes / limpo depois, parede
  vazia antes / split instalado depois) em vez de chapéus.
- **Sem "Mural de Achados"** — não fazia sentido pra esse negócio (não revende equipamento usado),
  então essa seção foi removida.
- **Nova seção "Agenda" (privada, só no painel)** — calendário mensal onde o dono clica num dia e
  anota compromissos (horário, cliente, telefone, serviço/endereço, observações). Não aparece no site
  público em nenhum momento, é só uma ferramenta de organização pro dono.

## Estrutura

```
index.html                        site público
assets/css/style.css               visual azul/marinho
assets/js/config.js                dados da empresa (gerado pelo painel — não editar à mão)
assets/js/servicos.js              lista de serviços (gerado pelo painel)
assets/js/trabalhos.js             trabalhos concluídos (gerado pelo painel)
assets/js/app.js                   lógica de renderização do site
assets/js/assistente.js            widget flutuante "falar no WhatsApp"
admin-backend/                     painel do dono (Node + Express + Turso/libSQL + Cloudinary)
```

Fotos de trabalhos concluídos (e a logo) não ficam em `assets/img/` — vão pro Cloudinary e o banco
guarda a URL completa.

## Painel do dono

6 seções: Dados da empresa, Horários, Serviços, Trabalhos Concluídos, **Agenda (privada)**, Trocar
senha.

## Como rodar

```
cd admin-backend
npm install
node server.js
```
Requer **Node.js 18+**. Sem nenhuma variável de banco/imagem configurada no `.env`, roda 100% local
(banco em arquivo, upload de fotos indisponível até configurar o Cloudinary).

- Site: `http://localhost:5800/`
- Painel: `http://localhost:5800/admin` (login padrão: `admin` / senha em `.env`)

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

## Testado até agora
- Site e painel rodados e navegados de verdade num navegador (Chromium via Playwright)
- CRUD de agenda testado ponta a ponta (criar e remover compromisso)
- Nenhum erro no console

## Não testado / próximos passos
- Logo real da empresa ainda não aplicada (aguardando arquivo)
- Conteúdo 100% placeholder — falta WhatsApp real, fotos reais de trabalhos concluídos
- Turso, Cloudinary, Render, domínio: ainda não configurados (site roda só localmente até agora)
