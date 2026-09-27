/* ==========================================================================
   ASSISTENTE DE CONTATO — captura o que a pessoa digitou e já monta o link
   do WhatsApp com essa mensagem. Não tenta responder perguntas, só
   transforma "o que a pessoa quer" em um contato pronto pra enviar. Sem
   custo de API, sem backend.
   Módulo autocontido: só precisa deste arquivo carregado depois de app.js
   (usa loja, linkWhatsApp e escapeHtml).
   ========================================================================== */

const MC_SUGESTOES = [
  'Quero um orçamento de instalação',
  'Preciso de manutenção/higienização',
  'Meu ar parou de gelar'
];

function mcMontarLinkWhats(texto){
  const mensagem = 'Olá! Vim pelo site do ' + loja.nome + '.\n\n' + texto.trim();
  return linkWhatsApp(mensagem);
}

function mcAtualizarBotao(){
  const texto = document.getElementById('mcInput').value.trim();
  const btn = document.getElementById('mcBotaoEnviar');
  if(texto){
    btn.href = mcMontarLinkWhats(texto);
    btn.classList.remove('mc-btn-desabilitado');
  } else {
    btn.href = '#';
    btn.classList.add('mc-btn-desabilitado');
  }
}

function mcCriarWidget(){
  const estilo = document.createElement('style');
  estilo.textContent = `
    .mc-bubble{position:fixed; right:18px; bottom:18px; width:58px; height:58px; border-radius:50%;
      background:var(--cor-principal,#1E88E5); color:#fff; display:flex; align-items:center; justify-content:center;
      font-size:26px; box-shadow:0 8px 24px rgba(0,0,0,.28); cursor:pointer; z-index:300; border:none;}
    .mc-panel{position:fixed; right:18px; bottom:86px; width:320px; max-width:calc(100vw - 36px);
      background:#fff; border-radius:18px; box-shadow:0 14px 44px rgba(0,0,0,.28); overflow:hidden; z-index:300; font-family:inherit;}
    .mc-head{background:var(--cor-secundaria,#0D1B2A); color:#fff; padding:14px 16px; position:relative;}
    .mc-head strong{font-size:14px; display:block;}
    .mc-head span{font-size:11.5px; opacity:.7;}
    .mc-head button{position:absolute; top:10px; right:12px; background:none; border:none; color:#fff; font-size:18px; cursor:pointer;}
    .mc-corpo{padding:16px;}
    .mc-corpo p{font-size:12.5px; color:#5a6472; margin-bottom:10px;}
    .mc-sugestoes{display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;}
    .mc-sugestoes button{font-size:11px; border:1px solid #DCE3EA; background:#F5F8FA; border-radius:999px; padding:6px 11px; cursor:pointer; text-align:left;}
    .mc-textarea{width:100%; border:1.5px solid #DCE3EA; border-radius:10px; padding:10px 12px; font-size:13px; min-height:72px; resize:vertical; outline:none; box-sizing:border-box;}
    .mc-textarea:focus{border-color:var(--cor-principal,#1E88E5);}
    .mc-botao{display:flex; align-items:center; justify-content:center; gap:8px; margin-top:12px; width:100%;
      background:#25D366; color:#fff; border:none; border-radius:999px; padding:12px; font-weight:700; font-size:13px;}
    .mc-btn-desabilitado{pointer-events:none; opacity:.5;}
  `;
  document.head.appendChild(estilo);

  const bolha = document.createElement('button');
  bolha.className = 'mc-bubble';
  bolha.setAttribute('aria-label', 'Falar sobre seu ar-condicionado');
  bolha.textContent = '❄️';

  const painel = document.createElement('div');
  painel.className = 'mc-panel';
  painel.hidden = true;
  painel.innerHTML =
    '<div class="mc-head"><strong>Fale sobre seu ar-condicionado</strong><span>Responde direto no WhatsApp</span>' +
      '<button id="mcFechar" aria-label="Fechar">×</button></div>' +
    '<div class="mc-corpo">' +
      '<p>Conta rapidinho o que você precisa — eu já preparo a mensagem pro WhatsApp:</p>' +
      '<div class="mc-sugestoes">' + MC_SUGESTOES.map(s => '<button type="button" data-sugestao="'+escapeHtml(s)+'">'+escapeHtml(s)+'</button>').join('') + '</div>' +
      '<textarea id="mcInput" class="mc-textarea" placeholder="Ex: quero instalar um split de 12000 btus..."></textarea>' +
      '<a id="mcBotaoEnviar" class="mc-botao mc-btn-desabilitado" href="#" target="_blank" rel="noopener">' + ic('chat',16) + ' Enviar no WhatsApp</a>' +
    '</div>';

  document.body.appendChild(bolha);
  document.body.appendChild(painel);

  bolha.addEventListener('click', function(){ painel.hidden = !painel.hidden; });
  document.getElementById('mcFechar').addEventListener('click', function(){ painel.hidden = true; });
  document.getElementById('mcInput').addEventListener('input', mcAtualizarBotao);
  painel.querySelectorAll('[data-sugestao]').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.getElementById('mcInput').value = btn.dataset.sugestao + ': ';
      document.getElementById('mcInput').focus();
      mcAtualizarBotao();
    });
  });
}

document.addEventListener('DOMContentLoaded', mcCriarWidget);
