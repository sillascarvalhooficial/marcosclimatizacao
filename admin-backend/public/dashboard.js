function escapeHtml(str){ return String(str==null?'':str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function formatBRL(n){ return 'R$ ' + Number(n||0).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function fotoSrc(caminho){ if(!caminho) return ''; return (/^https?:\/\//.test(caminho) ? caminho : '/'+caminho) + '?t='+Date.now(); }

function mostrarMensagem(texto, tipo){
  const box = document.getElementById('mensagemGeral');
  box.innerHTML = '<div class="' + (tipo==='erro'?'erro':'sucesso') + '">' + escapeHtml(texto) + '</div>';
  setTimeout(()=>{ box.innerHTML=''; }, 3500);
}

async function api(metodo, url, corpo){
  const resp = await fetch(url, {
    method: metodo,
    headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
    body: corpo ? JSON.stringify(corpo) : undefined
  });
  if(resp.status === 401){ window.location.href = 'login.html'; throw new Error('não autenticado'); }
  const dados = await resp.json().catch(()=>({}));
  if(!resp.ok) throw new Error(dados.erro || 'Erro na requisição.');
  return dados;
}

/* ---------- 1. dados da empresa ---------- */
async function carregarLoja(){
  const loja = await api('GET', '/api/loja');
  document.getElementById('tituloLoja').textContent = loja.nome + ' · Painel';
  document.getElementById('lojaNome').value = loja.nome || '';
  document.getElementById('lojaSlogan').value = loja.slogan || '';
  document.getElementById('lojaWhatsapp').value = loja.whatsapp || '';
  document.getElementById('lojaWhatsappExibicao').value = loja.whatsappExibicao || '';
  document.getElementById('lojaTelefoneExibicao').value = loja.telefoneExibicao || '';
  document.getElementById('lojaInstagram').value = loja.instagram || '';
  document.getElementById('lojaFacebook').value = loja.facebook || '';
  document.getElementById('lojaEndereco').value = loja.endereco || '';
  document.getElementById('lojaHeroTexto').value = loja.heroTexto || '';
  document.getElementById('lojaSobreTitulo').value = loja.sobreTitulo || '';
  document.getElementById('lojaSobreTexto').value = loja.sobreTexto || '';
  document.getElementById('lojaFraseMuralVazio').value = loja.fraseMuralVazio || '';
  document.getElementById('lojaSeloQualidade').value = loja.seloQualidade || '';
  document.getElementById('lojaUrgenciaTexto').value = loja.urgenciaTexto || '';
  document.getElementById('lojaLogoPreview').innerHTML = loja.logo ? '<img class="foto-preview" src="'+fotoSrc(loja.logo)+'">' : '❄️';
}
document.getElementById('lojaLogoInput').addEventListener('change', function(e){
  if(!e.target.files[0]) return;
  const formData = new FormData();
  formData.append('imagem', e.target.files[0]);
  fetch('/api/loja/logo', { method:'POST', body: formData })
    .then(r => { if(r.status===401){ window.location.href='login.html'; return; } return r.json(); })
    .then(d => { if(d && !d.ok && d.erro) throw new Error(d.erro); mostrarMensagem('Logo atualizada.'); carregarLoja(); })
    .catch(err => mostrarMensagem(err.message, 'erro'));
});
document.getElementById('btnSalvarLoja').addEventListener('click', async function(){
  try{
    await api('PUT', '/api/loja', {
      nome: document.getElementById('lojaNome').value.trim(),
      slogan: document.getElementById('lojaSlogan').value.trim(),
      whatsapp: document.getElementById('lojaWhatsapp').value.trim(),
      whatsappExibicao: document.getElementById('lojaWhatsappExibicao').value.trim(),
      telefoneExibicao: document.getElementById('lojaTelefoneExibicao').value.trim(),
      instagram: document.getElementById('lojaInstagram').value.trim(),
      facebook: document.getElementById('lojaFacebook').value.trim(),
      endereco: document.getElementById('lojaEndereco').value.trim(),
      heroTexto: document.getElementById('lojaHeroTexto').value.trim(),
      sobreTitulo: document.getElementById('lojaSobreTitulo').value.trim(),
      sobreTexto: document.getElementById('lojaSobreTexto').value.trim(),
      fraseMuralVazio: document.getElementById('lojaFraseMuralVazio').value.trim(),
      seloQualidade: document.getElementById('lojaSeloQualidade').value.trim(),
      urgenciaTexto: document.getElementById('lojaUrgenciaTexto').value.trim()
    });
    mostrarMensagem('Dados da empresa salvos.');
    carregarLoja();
  }catch(err){ mostrarMensagem(err.message, 'erro'); }
});

/* ---------- 2. horários ---------- */
let horariosAtual = [];
const NOMES_DIAS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

async function carregarHorarios(){
  horariosAtual = await api('GET', '/api/horarios');
  renderHorarios();
}
function renderHorarios(){
  const lista = document.getElementById('listaHorarios');
  lista.innerHTML = horariosAtual.map(h => (
    '<div class="card-item" data-id="'+h.id+'">' +
      '<div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;">' +
        NOMES_DIAS.map((nome, idx) => (
          '<label style="display:inline-flex; align-items:center; gap:4px; font-size:12px; border:1.5px solid '+(h.dias.includes(idx)?'var(--cor-secundaria)':'var(--border)')+'; background:'+(h.dias.includes(idx)?'var(--cor-secundaria)':'#fff')+'; color:'+(h.dias.includes(idx)?'#fff':'var(--text)')+'; border-radius:999px; padding:5px 10px; cursor:pointer;">' +
            '<input type="checkbox" class="campo-dia" value="'+idx+'" '+(h.dias.includes(idx)?'checked':'')+' style="display:none;">'+nome+
          '</label>'
        )).join('') +
      '</div>' +
      '<div class="grid-2">' +
        '<div class="campo"><label>Abre</label><input type="time" class="campo-abre" value="'+h.abre+'"></div>' +
        '<div class="campo"><label>Fecha</label><input type="time" class="campo-fecha" value="'+h.fecha+'"></div>' +
      '</div>' +
      '<div class="campo"><label>Texto exibido</label><input type="text" class="campo-texto" value="'+escapeHtml(h.texto)+'"></div>' +
      '<div class="rodape-painel">' +
        '<button class="icon-btn btn-salvar-horario">💾</button>' +
        '<button class="icon-btn btn-remover-horario">🗑️</button>' +
      '</div>' +
    '</div>'
  )).join('') || '<p class="desc">Nenhum horário cadastrado.</p>';
}
document.getElementById('listaHorarios').addEventListener('click', function(e){
  const item = e.target.closest('.card-item'); if(!item) return;
  const id = item.dataset.id;
  const chip = e.target.closest('label');
  if(chip && chip.querySelector('.campo-dia')){
    const cb = chip.querySelector('.campo-dia');
    cb.checked = !cb.checked;
    chip.style.background = cb.checked ? 'var(--cor-secundaria)' : '#fff';
    chip.style.color = cb.checked ? '#fff' : 'var(--text)';
    chip.style.borderColor = cb.checked ? 'var(--cor-secundaria)' : 'var(--border)';
    e.preventDefault();
    return;
  }
  if(e.target.classList.contains('btn-salvar-horario')){
    const dias = Array.from(item.querySelectorAll('.campo-dia:checked')).map(i=>Number(i.value));
    api('PUT', '/api/horarios/'+id, {
      dias, abre: item.querySelector('.campo-abre').value, fecha: item.querySelector('.campo-fecha').value,
      texto: item.querySelector('.campo-texto').value.trim()
    }).then(()=>{ mostrarMensagem('Horário salvo.'); carregarHorarios(); }).catch(err=>mostrarMensagem(err.message,'erro'));
  }
  if(e.target.classList.contains('btn-remover-horario')){
    if(!confirm('Remover este horário?')) return;
    api('DELETE', '/api/horarios/'+id).then(()=>{ mostrarMensagem('Horário removido.'); carregarHorarios(); }).catch(err=>mostrarMensagem(err.message,'erro'));
  }
});
document.getElementById('btnNovoHorario').addEventListener('click', async function(){
  try{
    await api('POST', '/api/horarios', { dias:[1,2,3,4,5], abre:'08:00', fecha:'18:00', texto:'Seg a Sex: 08:00 - 18:00' });
    await carregarHorarios();
    mostrarMensagem('Horário criado — ajuste e salve.');
  }catch(err){ mostrarMensagem(err.message, 'erro'); }
});

/* ---------- 3. serviços ---------- */
let servicosAtual = [];
async function carregarServicos(){
  servicosAtual = await api('GET', '/api/servicos');
  renderServicos();
}
function renderServicos(){
  document.getElementById('corpoServicos').innerHTML = servicosAtual.map(s => (
    '<tr data-id="'+s.id+'">' +
      '<td><input type="text" class="campo-emoji" value="'+escapeHtml(s.emoji)+'" style="width:50px; text-align:center;" maxlength="4"></td>' +
      '<td><input type="text" class="campo-nome" value="'+escapeHtml(s.nome)+'"></td>' +
      '<td><input type="text" class="campo-descricao" value="'+escapeHtml(s.descricao||'')+'"></td>' +
      '<td><select class="campo-categoria">' +
        '<option value="climatizacao"'+(s.categoria==='climatizacao'?' selected':'')+'>Climatização</option>' +
        '<option value="eletrica"'+(s.categoria==='eletrica'?' selected':'')+'>Elétrica</option>' +
      '</select></td>' +
      '<td><label class="switch"><input type="checkbox" class="campo-ativo" '+(s.ativo?'checked':'')+'><span class="slider"></span></label></td>' +
      '<td class="acoes"><button class="icon-btn btn-salvar">💾</button><button class="icon-btn btn-remover">🗑️</button></td>' +
    '</tr>'
  )).join('') || '<tr><td colspan="6" class="desc">Nenhum serviço cadastrado.</td></tr>';
}
document.getElementById('corpoServicos').addEventListener('click', function(e){
  const tr = e.target.closest('tr'); if(!tr || !tr.dataset.id) return;
  const id = tr.dataset.id;
  if(e.target.classList.contains('btn-salvar')){
    api('PUT', '/api/servicos/'+id, {
      nome: tr.querySelector('.campo-nome').value.trim(),
      descricao: tr.querySelector('.campo-descricao').value.trim(),
      emoji: tr.querySelector('.campo-emoji').value.trim(),
      categoria: tr.querySelector('.campo-categoria').value,
      ativo: tr.querySelector('.campo-ativo').checked
    }).then(()=>mostrarMensagem('Serviço salvo.')).catch(err=>mostrarMensagem(err.message,'erro'));
  }
  if(e.target.classList.contains('btn-remover')){
    if(!confirm('Remover este serviço?')) return;
    api('DELETE', '/api/servicos/'+id).then(()=>{ mostrarMensagem('Serviço removido.'); carregarServicos(); }).catch(err=>mostrarMensagem(err.message,'erro'));
  }
});
document.getElementById('corpoServicos').addEventListener('change', function(e){
  if(!e.target.classList.contains('campo-ativo')) return;
  const tr = e.target.closest('tr');
  api('PUT', '/api/servicos/'+tr.dataset.id, { ativo: e.target.checked })
    .then(()=>mostrarMensagem('Serviço atualizado.')).catch(err=>mostrarMensagem(err.message,'erro'));
});
document.getElementById('btnNovoServico').addEventListener('click', async function(){
  await api('POST', '/api/servicos', { nome: 'Novo serviço', descricao: '', emoji: '❄️', categoria: 'climatizacao' });
  await carregarServicos();
  mostrarMensagem('Serviço criado — edite e salve.');
});

/* ---------- 4. trabalhos concluídos ---------- */
let trabalhosAtual = [];
async function carregarTrabalhos(){
  trabalhosAtual = await api('GET', '/api/trabalhos');
  renderTrabalhos();
}
function renderTrabalhos(){
  document.getElementById('listaTrabalhos').innerHTML = trabalhosAtual.map(a => (
    '<div class="card-item" data-id="'+a.id+'">' +
      '<div class="card-item-topo">' +
        '<div class="card-item-campos">' +
          '<input type="text" class="campo-titulo" placeholder="Título" value="'+escapeHtml(a.titulo)+'">' +
          '<input type="text" class="campo-descricao" placeholder="Descrição (opcional)" value="'+escapeHtml(a.descricao||'')+'">' +
          '<label class="switch" style="margin-top:4px;"><input type="checkbox" class="campo-ativo" '+(a.ativo?'checked':'')+'><span class="slider"></span></label>' +
        '</div>' +
      '</div>' +
      '<div class="card-item-fotos">' +
        '<div class="card-item-foto"><label>Antes</label>' +
          '<div class="foto-wrap">' + (a.fotoAntes ? '<img class="foto-preview" src="'+fotoSrc(a.fotoAntes)+'">' : '<div class="foto-preview">📷</div>') +
          '<input type="file" class="foto-input campo-foto-antes" accept="image/png,image/jpeg,image/webp"></div>' +
        '</div>' +
        '<div class="card-item-foto"><label>Depois</label>' +
          '<div class="foto-wrap">' + (a.fotoDepois ? '<img class="foto-preview" src="'+fotoSrc(a.fotoDepois)+'">' : '<div class="foto-preview">📷</div>') +
          '<input type="file" class="foto-input campo-foto-depois" accept="image/png,image/jpeg,image/webp"></div>' +
        '</div>' +
      '</div>' +
      '<div class="rodape-painel">' +
        '<button class="icon-btn btn-salvar-trabalho" title="Salvar">💾</button>' +
        '<button class="icon-btn btn-remover-trabalho" title="Remover">🗑️</button>' +
      '</div>' +
    '</div>'
  )).join('') || '<p class="desc">Nenhum trabalho cadastrado ainda.</p>';
}
document.getElementById('listaTrabalhos').addEventListener('click', function(e){
  const item = e.target.closest('.card-item'); if(!item) return;
  const id = item.dataset.id;
  if(e.target.classList.contains('btn-salvar-trabalho')){
    api('PUT', '/api/trabalhos/'+id, {
      titulo: item.querySelector('.campo-titulo').value.trim(),
      descricao: item.querySelector('.campo-descricao').value.trim(),
      ativo: item.querySelector('.campo-ativo').checked
    }).then(()=>mostrarMensagem('Salvo.')).catch(err=>mostrarMensagem(err.message,'erro'));
  }
  if(e.target.classList.contains('btn-remover-trabalho')){
    if(!confirm('Remover este trabalho?')) return;
    api('DELETE', '/api/trabalhos/'+id).then(()=>{ mostrarMensagem('Removido.'); carregarTrabalhos(); }).catch(err=>mostrarMensagem(err.message,'erro'));
  }
});
document.getElementById('listaTrabalhos').addEventListener('change', function(e){
  const item = e.target.closest('.card-item'); if(!item) return;
  const id = item.dataset.id;
  let tipo = null;
  if(e.target.classList.contains('campo-foto-antes')) tipo = 'antes';
  if(e.target.classList.contains('campo-foto-depois')) tipo = 'depois';
  if(!tipo || !e.target.files[0]) return;
  const formData = new FormData();
  formData.append('imagem', e.target.files[0]);
  fetch('/api/trabalhos/'+id+'/foto/'+tipo, { method:'POST', body: formData })
    .then(r => { if(r.status===401){ window.location.href='login.html'; return; } return r.json(); })
    .then(d => { if(d && !d.ok && d.erro) throw new Error(d.erro); mostrarMensagem('Foto atualizada.'); carregarTrabalhos(); })
    .catch(err => mostrarMensagem(err.message, 'erro'));
});
document.getElementById('btnNovoTrabalho').addEventListener('click', async function(){
  await api('POST', '/api/trabalhos', { titulo: 'Novo trabalho', descricao: '' });
  await carregarTrabalhos();
  mostrarMensagem('Item criado — adicione as fotos e salve.');
});

/* ---------- 5. mural de achados ---------- */
let achadosAtual = [];
async function carregarAchados(){
  achadosAtual = await api('GET', '/api/achados');
  renderAchados();
}
function renderAchados(){
  document.getElementById('listaAchados').innerHTML = achadosAtual.map(a => (
    '<div class="card-item" data-id="'+a.id+'">' +
      '<div class="card-item-topo">' +
        '<div class="foto-wrap">' + (a.imagem ? '<img class="foto-preview" src="'+fotoSrc(a.imagem)+'">' : '<div class="foto-preview">❄️</div>') +
          '<input type="file" class="foto-input campo-foto" accept="image/png,image/jpeg,image/webp"></div>' +
        '<div class="card-item-campos">' +
          '<input type="text" class="campo-nome" placeholder="Nome" value="'+escapeHtml(a.nome)+'">' +
          '<input type="text" class="campo-categoria" placeholder="Categoria (ex: Split 12000 BTUs)" value="'+escapeHtml(a.categoria||'')+'">' +
          '<div class="grid-2">' +
            '<input type="number" step="0.01" class="campo-preco" placeholder="Preço" value="'+a.preco+'">' +
            '<label class="switch" style="align-self:center;"><input type="checkbox" class="campo-ativo" '+(a.ativo?'checked':'')+'><span class="slider"></span></label>' +
          '</div>' +
          '<input type="text" class="campo-descricao" placeholder="Descrição curta" value="'+escapeHtml(a.descricao||'')+'">' +
        '</div>' +
      '</div>' +
      '<div class="rodape-painel">' +
        '<button class="icon-btn btn-salvar-achado" title="Salvar">💾</button>' +
        '<button class="icon-btn btn-remover-achado" title="Remover">🗑️</button>' +
      '</div>' +
    '</div>'
  )).join('') || '<p class="desc">Nenhum achado no momento.</p>';
}
document.getElementById('listaAchados').addEventListener('click', function(e){
  const item = e.target.closest('.card-item'); if(!item) return;
  const id = item.dataset.id;
  if(e.target.classList.contains('btn-salvar-achado')){
    api('PUT', '/api/achados/'+id, {
      nome: item.querySelector('.campo-nome').value.trim(),
      categoria: item.querySelector('.campo-categoria').value.trim(),
      preco: Number(item.querySelector('.campo-preco').value) || 0,
      descricao: item.querySelector('.campo-descricao').value.trim(),
      ativo: item.querySelector('.campo-ativo').checked
    }).then(()=>mostrarMensagem('Achado salvo.')).catch(err=>mostrarMensagem(err.message,'erro'));
  }
  if(e.target.classList.contains('btn-remover-achado')){
    if(!confirm('Remover este achado?')) return;
    api('DELETE', '/api/achados/'+id).then(()=>{ mostrarMensagem('Achado removido.'); carregarAchados(); }).catch(err=>mostrarMensagem(err.message,'erro'));
  }
});
document.getElementById('listaAchados').addEventListener('change', function(e){
  const item = e.target.closest('.card-item'); if(!item) return;
  const id = item.dataset.id;
  if(e.target.classList.contains('campo-foto') && e.target.files[0]){
    const formData = new FormData();
    formData.append('imagem', e.target.files[0]);
    fetch('/api/achados/'+id+'/imagem', { method:'POST', body: formData })
      .then(r => { if(r.status===401){ window.location.href='login.html'; return; } return r.json(); })
      .then(d => { if(d && !d.ok && d.erro) throw new Error(d.erro); mostrarMensagem('Foto atualizada.'); carregarAchados(); })
      .catch(err => mostrarMensagem(err.message, 'erro'));
  }
});
document.getElementById('btnNovoAchado').addEventListener('click', async function(){
  await api('POST', '/api/achados', { nome: 'Novo achado', descricao: '', categoria: '', preco: 0 });
  await carregarAchados();
  mostrarMensagem('Achado criado — edite os campos e salve.');
});

/* ---------- 6. agenda (privada) ---------- */
let agendaCompromissos = [];
let agendaMesAtual = new Date();
agendaMesAtual.setDate(1);

function dataISO(date){
  return date.getFullYear() + '-' + String(date.getMonth()+1).padStart(2,'0') + '-' + String(date.getDate()).padStart(2,'0');
}
function nomeMesAno(date){
  const nome = date.toLocaleDateString('pt-BR', { month:'long', year:'numeric' });
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}
async function carregarAgenda(){
  agendaCompromissos = await api('GET', '/api/agenda');
  renderAgenda();
}
function renderAgenda(){
  document.getElementById('agendaMesTitulo').textContent = nomeMesAno(agendaMesAtual);

  const porDia = {};
  agendaCompromissos.forEach(c => { (porDia[c.data] = porDia[c.data] || []).push(c); });

  const ano = agendaMesAtual.getFullYear(), mes = agendaMesAtual.getMonth();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const totalDiasMes = new Date(ano, mes+1, 0).getDate();
  const hojeISO = dataISO(new Date());

  const celulas = [];
  for(let i=0;i<primeiroDiaSemana;i++){
    const d = new Date(ano, mes, 1 - (primeiroDiaSemana - i));
    celulas.push({ date:d, foraMes:true });
  }
  for(let dia=1; dia<=totalDiasMes; dia++){
    celulas.push({ date:new Date(ano, mes, dia), foraMes:false });
  }
  while(celulas.length % 7 !== 0){
    const ultima = celulas[celulas.length-1].date;
    const d = new Date(ultima); d.setDate(d.getDate()+1);
    celulas.push({ date:d, foraMes:true });
  }

  const nomesDias = ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];
  let html = nomesDias.map(n => '<div class="agenda-dia-nome">'+n+'</div>').join('');
  html += celulas.map(cel => {
    const iso = dataISO(cel.date);
    const qtd = (porDia[iso]||[]).length;
    const classes = ['agenda-dia'];
    if(cel.foraMes) classes.push('fora-mes');
    if(iso === hojeISO) classes.push('hoje');
    return (
      '<div class="'+classes.join(' ')+'" data-data="'+iso+'">' +
        '<span class="agenda-dia-numero">'+cel.date.getDate()+'</span>' +
        (qtd>0 ? '<span class="agenda-dia-badge">'+qtd+'</span>' : '') +
      '</div>'
    );
  }).join('');
  document.getElementById('agendaGrid').innerHTML = html;
}
document.getElementById('agendaGrid').addEventListener('click', function(e){
  const dia = e.target.closest('.agenda-dia'); if(!dia) return;
  abrirModalAgendaDia(dia.dataset.data);
});
document.getElementById('btnMesAnterior').addEventListener('click', function(){
  agendaMesAtual.setMonth(agendaMesAtual.getMonth()-1);
  renderAgenda();
});
document.getElementById('btnProximoMes').addEventListener('click', function(){
  agendaMesAtual.setMonth(agendaMesAtual.getMonth()+1);
  renderAgenda();
});
document.getElementById('btnMesAtual').addEventListener('click', function(){
  agendaMesAtual = new Date(); agendaMesAtual.setDate(1);
  renderAgenda();
});

function abrirModalAgendaDia(dataIso){
  const [ano,mes,dia] = dataIso.split('-').map(Number);
  const dataLegivel = new Date(ano, mes-1, dia).toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' });
  const doDia = agendaCompromissos.filter(c => c.data === dataIso).sort((a,b) => a.horario.localeCompare(b.horario));

  const listaHtml = doDia.map(c => (
    '<div class="agenda-lista-item" data-id="'+c.id+'">' +
      '<div class="agenda-lista-item-topo">' +
        '<span class="agenda-lista-item-horario">'+escapeHtml(c.horario)+'</span>' +
        '<div class="acoes"><button class="icon-btn btn-remover-compromisso">🗑️</button></div>' +
      '</div>' +
      '<div class="agenda-lista-item-cliente">'+escapeHtml(c.cliente)+'</div>' +
      (c.telefone ? '<div class="agenda-lista-item-info">📞 '+escapeHtml(c.telefone)+'</div>' : '') +
      (c.servico ? '<div class="agenda-lista-item-info">'+escapeHtml(c.servico)+'</div>' : '') +
      (c.observacoes ? '<div class="agenda-lista-item-info">'+escapeHtml(c.observacoes)+'</div>' : '') +
    '</div>'
  )).join('') || '<p class="desc">Nenhum compromisso nesse dia ainda.</p>';

  abrirModal(
    '<h3 style="margin:0 0 4px; font-size:16px;">'+escapeHtml(dataLegivel)+'</h3>' +
    '<p class="desc" style="margin:0 0 14px;">Compromissos do dia</p>' +
    '<div id="agendaListaDia">'+listaHtml+'</div>' +
    '<div class="painel" style="margin:14px 0 0; padding:14px;">' +
      '<div class="grid-2">' +
        '<div class="campo"><label>Horário</label><input type="time" id="novoCompromissoHorario" value="08:00"></div>' +
        '<div class="campo"><label>Cliente</label><input type="text" id="novoCompromissoCliente" placeholder="Nome do cliente"></div>' +
      '</div>' +
      '<div class="grid-2">' +
        '<div class="campo"><label>Telefone</label><input type="text" id="novoCompromissoTelefone" placeholder="(00) 00000-0000"></div>' +
        '<div class="campo"><label>Serviço/endereço</label><input type="text" id="novoCompromissoServico" placeholder="Ex: Instalação, Rua X, 123"></div>' +
      '</div>' +
      '<div class="campo"><label>Observações</label><textarea id="novoCompromissoObs" rows="2"></textarea></div>' +
      '<div class="rodape-painel">' +
        '<button class="btn btn-primary" id="btnSalvarCompromisso" style="width:auto;" data-data="'+dataIso+'">+ Adicionar compromisso</button>' +
      '</div>' +
    '</div>' +
    '<div class="rodape-painel"><button class="btn btn-secundario" data-action="fechar-modal" style="width:auto;">Fechar</button></div>'
  );
}
document.getElementById('modalBox').addEventListener('click', function(e){
  if(e.target.id === 'btnSalvarCompromisso'){
    const dataIso = e.target.dataset.data;
    const cliente = document.getElementById('novoCompromissoCliente').value.trim();
    if(!cliente){ mostrarMensagem('Informe o nome do cliente.', 'erro'); return; }
    api('POST', '/api/agenda', {
      data: dataIso,
      horario: document.getElementById('novoCompromissoHorario').value,
      cliente,
      telefone: document.getElementById('novoCompromissoTelefone').value.trim(),
      servico: document.getElementById('novoCompromissoServico').value.trim(),
      observacoes: document.getElementById('novoCompromissoObs').value.trim()
    }).then(async () => {
      await carregarAgenda();
      mostrarMensagem('Compromisso adicionado.');
      abrirModalAgendaDia(dataIso);
    }).catch(err => mostrarMensagem(err.message, 'erro'));
  }
  const btnRemover = e.target.closest('.btn-remover-compromisso');
  if(btnRemover){
    if(!confirm('Remover este compromisso?')) return;
    const item = btnRemover.closest('.agenda-lista-item');
    const id = item.dataset.id;
    const dataIso = document.getElementById('btnSalvarCompromisso') ? document.getElementById('btnSalvarCompromisso').dataset.data : null;
    api('DELETE', '/api/agenda/'+id).then(async () => {
      await carregarAgenda();
      mostrarMensagem('Compromisso removido.');
      if(dataIso) abrirModalAgendaDia(dataIso);
    }).catch(err => mostrarMensagem(err.message, 'erro'));
  }
});

/* ---------- modal genérico ---------- */
function abrirModal(html){
  document.getElementById('modalBox').innerHTML = html;
  document.getElementById('overlay').hidden = false;
}
function fecharModal(){
  document.getElementById('overlay').hidden = true;
  document.getElementById('modalBox').innerHTML = '';
}
document.addEventListener('click', function(e){
  if(e.target.closest('[data-action="fechar-modal"]')) fecharModal();
  if(e.target.id === 'overlay') fecharModal();
});
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape' && !document.getElementById('overlay').hidden) fecharModal();
});

/* ---------- senha ---------- */
document.getElementById('btnTrocarSenha').addEventListener('click', async function(){
  const senhaAtual = document.getElementById('senhaAtual').value;
  const novaSenha = document.getElementById('novaSenha').value;
  try{
    await api('PUT', '/api/senha', { senhaAtual, novaSenha });
    document.getElementById('senhaAtual').value = '';
    document.getElementById('novaSenha').value = '';
    mostrarMensagem('Senha alterada com sucesso.');
  }catch(err){ mostrarMensagem(err.message, 'erro'); }
});

document.getElementById('btnSair').addEventListener('click', async function(){
  await api('POST', '/api/logout');
  window.location.href = 'login.html';
});

/* ---------- init ---------- */
(async function init(){
  try{
    const sessao = await api('GET', '/api/session');
    if(!sessao.autenticado){ window.location.href = 'login.html'; return; }
    document.getElementById('usuarioLogado').textContent = '· ' + sessao.usuario;
    await carregarLoja();
    await carregarHorarios();
    await carregarServicos();
    await carregarTrabalhos();
    await carregarAchados();
    await carregarAgenda();
  }catch(err){
    console.error(err);
  }
})();
