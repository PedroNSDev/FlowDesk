const AG_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const AG_VISIVEIS = 3;

let agAno = new Date().getFullYear();
let agMesIdx = new Date().getMonth();
let agSelecionado = agFmt(new Date());
let agDados = { eventos: [], etapas: [], carregado: false };
let agFiltros = { eventos: true, prazos: true, concluidos: false, meus: false };
let agArrastando = null;

function agFmt(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function agParse(s) { return new Date(s + 'T00:00:00'); }
function agHoje() { return agFmt(new Date()); }
function agCurta(s) { return agParse(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); }
function agPode() { return !!currentUserCanEdit; }

function agClasse(e) {
    if (e.status === 'Concluído') return 'done';
    const dias = Math.round((agParse(e.prazo) - agParse(agHoje())) / 86400000);
    if (dias < 0) return 'late';
    if (dias <= 2) return 'urg';
    if (dias <= 7) return 'prox';
    return 'ok';
}
function agRank(e) { return ['late', 'urg', 'prox', 'ok', 'done'].indexOf(agClasse(e)); }

function agIndexar(comConcluidos) {
    const mapa = {};
    const get = d => mapa[d] || (mapa[d] = { eventos: [], prazos: [] });
    if (agFiltros.eventos) agDados.eventos.forEach(e => get(e.data).eventos.push(e));
    if (agFiltros.prazos) {
        agDados.etapas.forEach(e => {
            if (!e.prazo) return;
            if (e.status === 'Concluído' && !comConcluidos && !agFiltros.concluidos) return;
            if (agFiltros.meus && e.responsavel_id !== currentUser.id) return;
            get(e.prazo).prazos.push(e);
        });
    }
    Object.values(mapa).forEach(x => {
        x.eventos.sort((a, b) => (a.hora || '99').localeCompare(b.hora || '99'));
        x.prazos.sort((a, b) => agRank(a) - agRank(b));
    });
    return mapa;
}

async function carregarEventos() {
    const c = document.getElementById('eventos-container');
    if (!agDados.carregado) c.innerHTML = '<div class="loading-c"><div class="spinner"></div></div>';
    const [rEv, rEt] = await Promise.all([
        sb.from('eventos').select('*').eq('workspace_id', currentWorkspace.id).order('data', { ascending: true }),
        sb.from('etapas')
            .select('id, nome, status, prazo, prioridade, responsavel_id, sessoes!inner(id, nome, projeto_id, projetos!inner(id, nome, workspace_id))')
            .not('prazo', 'is', null)
            .eq('sessoes.projetos.workspace_id', currentWorkspace.id)
            .order('prazo', { ascending: true })
    ]);
    if (rEv.error || rEt.error) {
        const msg = (rEv.error || rEt.error).message;
        c.innerHTML = `<div class="empty-state"><div class="ei">⚠️</div><h3>Erro ao carregar a agenda</h3><p>${escH(msg)}</p></div>`;
        return;
    }
    agDados = { eventos: rEv.data || [], etapas: rEt.data || [], carregado: true };
    agRender();
}

function agTrocouMes() {
    const h = new Date();
    agSelecionado = (h.getFullYear() === agAno && h.getMonth() === agMesIdx) ? agHoje() : null;
    agRender();
}

function agNavegar(delta) {
    const d = new Date(agAno, agMesIdx + delta, 1);
    agAno = d.getFullYear();
    agMesIdx = d.getMonth();
    agTrocouMes();
}

function agEscolherMes(valor) {
    const m = parseInt(valor, 10);
    if (isNaN(m) || m < 0 || m > 11) return;
    agMesIdx = m;
    agTrocouMes();
}

function agEscolherAno(valor) {
    const a = parseInt(valor, 10);
    if (isNaN(a) || a < 1900 || a > 2200) {
        toast('Informe um ano entre 1900 e 2200.', 'warning');
        agRender();
        return;
    }
    agAno = a;
    agTrocouMes();
}

function agHojeBtn() {
    const h = new Date();
    agAno = h.getFullYear();
    agMesIdx = h.getMonth();
    agSelecionado = agHoje();
    agRender();
}

function agIrParaData(d) {
    const dt = agParse(d);
    agAno = dt.getFullYear();
    agMesIdx = dt.getMonth();
    agSelecionado = d;
    switchTab('eventos');
}

function agSelecionar(d) {
    agSelecionado = d;
    agRender();
}

function agFiltro(k) {
    agFiltros[k] = !agFiltros[k];
    agRender();
}

function agNovoEvento(d) {
    if (!agPode()) { toast('Você não tem permissão para criar eventos.', 'warning'); return; }
    const alvo = d || agSelecionado || agHoje();
    abrirModalEvento();
    const campo = document.getElementById('ev-data');
    if (campo) campo.value = formatarDataEvento(alvo);
    const seletorData = document.getElementById('ev-data-picker');
    if (seletorData) seletorData.value = alvo;
}

function agChip(tipo, x, d) {
    const arrastavel = agPode() && (tipo === 'e' || x.status !== 'Concluído');
    const drag = arrastavel ? `draggable="true" ondragstart="agDragInicio(event,'${tipo}',${x.id})" ondragend="agDragFim(event)"` : '';
    const clique = `onclick="event.stopPropagation();agSelecionar('${d}')"`;
    if (tipo === 'e') {
        return `<div class="ag-chip ag-ev" ${drag} ${clique} title="${escH(x.nome)}${x.hora ? ' · ' + x.hora.slice(0, 5) : ''}">${x.hora ? `<b>${x.hora.slice(0, 5)}</b>` : ''}${escH(x.nome)}</div>`;
    }
    return `<div class="ag-chip ag-pz ag-${agClasse(x)}" ${drag} ${clique} title="Prazo: ${escH(x.nome)}">${escH(x.nome)}</div>`;
}

function agCelula(data, mapa, hoje) {
    const d = agFmt(data);
    const dia = mapa[d] || { eventos: [], prazos: [] };
    const itens = [...dia.eventos.map(x => ['e', x]), ...dia.prazos.map(x => ['p', x])];
    const extra = itens.length - AG_VISIVEIS;
    const fora = data.getMonth() !== agMesIdx;
    return `<div class="ag-cell ${fora ? 'out' : ''} ${d === hoje ? 'hoje' : ''} ${d === agSelecionado ? 'sel' : ''}" data-d="${d}"
        onclick="agSelecionar('${d}')" ondblclick="agNovoEvento('${d}')"
        ondragover="agDragSobre(event)" ondragleave="agDragSai(event)" ondrop="agSoltar(event,'${d}')">
        <div class="ag-top"><span class="ag-dn">${data.getDate()}</span>${agPode() ? `<span class="ag-add" title="Novo evento" onclick="event.stopPropagation();agNovoEvento('${d}')">+</span>` : ''}</div>
        <div class="ag-chips">${itens.slice(0, AG_VISIVEIS).map(([t, x]) => agChip(t, x, d)).join('')}${extra > 0 ? `<div class="ag-more">+${extra} mais</div>` : ''}</div>
    </div>`;
}

function agPainelDia(d) {
    const dt = agParse(d);
    const dia = agIndexar(true)[d] || { eventos: [], prazos: [] };
    const hoje = agHoje();
    const rel = d === hoje ? 'Hoje' : d === agFmt(new Date(Date.now() + 86400000)) ? 'Amanhã' : d < hoje ? 'Dia passado' : '';
    const eventos = dia.eventos.map(e => `
        <div class="ag-item">
            <div class="ag-item-bar"></div>
            <div class="ag-item-i">
                <div class="ag-item-n">${escH(e.nome)}</div>
                ${e.descricao ? `<div class="ag-item-d">${escH(e.descricao)}</div>` : ''}
                ${e.hora ? `<div class="ag-item-h">🕐 ${e.hora.slice(0, 5)}</div>` : ''}
            </div>
            <div class="ag-item-a">
                ${agPode() ? `<button class="btn btn-s" title="Editar" onclick="editarEvento(${e.id})">✏️</button>` : ''}
                ${currentUserIsWorkspaceAdmin ? `<button class="btn" style="background:none;border:1px solid var(--danger);color:var(--danger)" title="Excluir" onclick="deletarEvento(${e.id})">🗑</button>` : ''}
            </div>
        </div>`).join('');
    const prazos = dia.prazos.map(e => {
        const resp = wsMembers.find(u => u.id === e.responsavel_id);
        const proj = e.sessoes && e.sessoes.projetos ? e.sessoes.projetos.nome : '—';
        const sess = e.sessoes ? e.sessoes.nome : '—';
        const pode = agPode() && e.status !== 'Concluído';
        return `<div class="ag-pzc ag-${agClasse(e)}">
            <div class="ag-pzc-top">
                <div style="min-width:0"><div class="ag-pzc-n">${escH(e.nome)}</div><div class="ag-pzc-c">📁 ${escH(proj)} › ${escH(sess)}</div></div>
                <span class="badge ${e.status === 'Concluído' ? 'b-green' : e.status === 'Em andamento' ? 'b-amber' : 'b-gray'}">${e.status}</span>
            </div>
            <div class="ag-pzc-m">${resp ? `${avatar(resp)} ${escH(resp.nome)}` : 'Sem responsável'}<span class="badge ${prazoClass(e.prazo, e.status)}">${prazoLabel(e.prazo, e.status)}</span></div>
            ${pode ? `<div class="ag-adiar">
                <div class="ag-adiar-l">Adiar prazo</div>
                <div class="ag-adiar-b">
                    <button class="btn btn-s ag-mini" onclick="agAdiar(${e.id},1)">+1 dia</button>
                    <button class="btn btn-s ag-mini" onclick="agAdiar(${e.id},3)">+3 dias</button>
                    <button class="btn btn-s ag-mini" onclick="agAdiar(${e.id},7)">+1 semana</button>
                </div>
                <div class="ag-adiar-d">
                    <input type="date" id="ag-nd-${e.id}" class="fi" value="${e.prazo}">
                    <button class="btn btn-p ag-mini" onclick="agAdiarPara(${e.id})">Mover</button>
                </div>
            </div>` : ''}
        </div>`;
    }).join('');
    return `
        <div class="ag-side-h">
            <div><div class="ag-side-d">${dt.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            <div class="ag-side-s">${rel ? rel + ' · ' : ''}${dia.eventos.length} ${dia.eventos.length === 1 ? 'evento' : 'eventos'} · ${dia.prazos.length} ${dia.prazos.length === 1 ? 'prazo' : 'prazos'}</div></div>
            ${agPode() ? `<button class="btn btn-p btn-sm" onclick="agNovoEvento('${d}')">+ Evento</button>` : ''}
        </div>
        ${eventos ? `<div class="ag-sec" style="margin-top:0">📅 Eventos</div>${eventos}` : ''}
        ${prazos ? `<div class="ag-sec" ${eventos ? '' : 'style="margin-top:0"'}>⏰ Prazos de etapas</div>${prazos}` : ''}
        ${!eventos && !prazos ? `<div class="ag-vazio"><div class="ei">🗓️</div>Nada marcado para este dia.${agPode() ? '<br>Clique em "+ Evento" para criar um.' : ''}</div>` : ''}`;
}

function agPainelResumo() {
    const prefixo = `${agAno}-${String(agMesIdx + 1).padStart(2, '0')}`;
    const hoje = agHoje();
    const evs = agDados.eventos.filter(e => e.data.startsWith(prefixo));
    const pzs = agDados.etapas.filter(e => e.prazo && e.prazo.startsWith(prefixo));
    const abertos = pzs.filter(e => e.status !== 'Concluído');
    const atrasados = abertos.filter(e => e.prazo < hoje);
    const itens = [
        ...evs.map(e => ({ d: e.data, n: e.nome, pz: false })),
        ...abertos.map(e => ({ d: e.prazo, n: e.nome, pz: true }))
    ].sort((a, b) => a.d.localeCompare(b.d));
    const futuros = itens.filter(i => i.d >= hoje);
    const lista = (futuros.length ? futuros : itens).slice(0, 8);
    const nome = new Date(agAno, agMesIdx, 1).toLocaleDateString('pt-BR', { month: 'long' });
    return `
        <div class="ag-side-h"><div><div class="ag-side-d">Resumo de ${nome}</div><div class="ag-side-s">Selecione um dia para ver os detalhes</div></div></div>
        <div class="ag-resumo">
            <div class="ag-rs"><b>${evs.length}</b><span>Eventos</span></div>
            <div class="ag-rs"><b>${abertos.length}</b><span>Prazos em aberto</span></div>
            <div class="ag-rs"><b style="color:${atrasados.length ? 'var(--danger)' : 'inherit'}">${atrasados.length}</b><span>Atrasados</span></div>
            <div class="ag-rs"><b style="color:var(--ok)">${pzs.length - abertos.length}</b><span>Concluídos</span></div>
        </div>
        <div class="ag-sec">Próximos neste mês</div>
        ${lista.length ? lista.map(i => `<div class="ag-prox-i" onclick="agSelecionar('${i.d}')"><span class="ag-dot" style="background:${i.pz ? 'var(--warn)' : 'var(--acc)'}"></span><span>${escH(i.n)}</span><small>${agCurta(i.d)}</small></div>`).join('') : '<div class="ag-vazio">Nenhum item neste mês.</div>'}`;
}

function agRender() {
    const c = document.getElementById('eventos-container');
    const hoje = agHoje();
    const mapa = agIndexar(false);
    const inicio = new Date(agAno, agMesIdx, 1);
    inicio.setDate(1 - inicio.getDay());
    const celulas = [];
    for (let i = 0; i < 42; i++) {
        const d = new Date(inicio);
        d.setDate(inicio.getDate() + i);
        celulas.push(agCelula(d, mapa, hoje));
    }
    const MESES = Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleDateString('pt-BR', { month: 'long' }));
    const filtros = [
        ['eventos', '📅 Eventos'], ['prazos', '⏰ Prazos'], ['concluidos', '✅ Concluídos'], ['meus', '👤 Só meus prazos']
    ];
    c.innerHTML = `
        <div class="ag-wrap">
            <div>
                <div class="ag-bar">
                    <button class="btn btn-s btn-sm" onclick="agHojeBtn()">Hoje</button>
                    <div class="ag-nav">
                        <button class="btn btn-s btn-sm" onclick="agNavegar(-1)" title="Mês anterior">‹</button>
                        <button class="btn btn-s btn-sm" onclick="agNavegar(1)" title="Próximo mês">›</button>
                    </div>
                    <div class="ag-pick">
                        <select class="fsel" onchange="agEscolherMes(this.value)" title="Mês">${MESES.map((m, i) => `<option value="${i}" ${i === agMesIdx ? 'selected' : ''}>${m}</option>`).join('')}</select>
                        <input type="number" class="fi" min="1900" max="2200" value="${agAno}" title="Ano" onchange="agEscolherAno(this.value)" onkeydown="if (event.key === 'Enter') this.blur()">
                    </div>
                    <div class="ag-filtros">${filtros.map(([k, l]) => `<span class="ag-f ${agFiltros[k] ? 'on' : ''}" onclick="agFiltro('${k}')">${l}</span>`).join('')}</div>
                </div>
                <div class="ag-cal">
                    <div class="ag-wds">${AG_SEMANA.map(s => `<div class="ag-wd">${s}</div>`).join('')}</div>
                    <div class="ag-grid">${celulas.join('')}</div>
                </div>
                <div class="ag-leg">
                    <span><i style="background:var(--acc)"></i>Evento</span>
                    <span><i style="background:#fecaca"></i>Prazo atrasado</span>
                    <span><i style="background:#fee2e2"></i>Vence em até 2 dias</span>
                    <span><i style="background:#fef3c7"></i>Vence em até 7 dias</span>
                    <span><i style="background:#e0e7ff"></i>Prazo futuro</span>
                    <span><i style="background:#dcfce7"></i>Concluído</span>
                    ${agPode() ? '<span>💡 Arraste um item para outro dia para reagendar · duplo clique cria evento</span>' : ''}
                </div>
            </div>
            <aside class="ag-side">${agSelecionado ? agPainelDia(agSelecionado) : agPainelResumo()}</aside>
        </div>`;
}

function agDragInicio(ev, tipo, id) {
    agArrastando = { tipo, id };
    ev.dataTransfer.effectAllowed = 'move';
    ev.dataTransfer.setData('text/plain', `${tipo}:${id}`);
    ev.target.classList.add('arrastando');
}

function agDragFim(ev) {
    agArrastando = null;
    ev.target.classList.remove('arrastando');
    document.querySelectorAll('.ag-cell.alvo').forEach(c => c.classList.remove('alvo'));
}

function agDragSobre(ev) {
    if (!agArrastando) return;
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
    ev.currentTarget.classList.add('alvo');
}

function agDragSai(ev) {
    if (!ev.currentTarget.contains(ev.relatedTarget)) ev.currentTarget.classList.remove('alvo');
}

async function agSoltar(ev, d) {
    ev.preventDefault();
    const a = agArrastando;
    agArrastando = null;
    ev.currentTarget.classList.remove('alvo');
    if (!a) return;
    if (a.tipo === 'e') await agMoverEvento(a.id, d);
    else await agAlterarPrazo(a.id, d);
    agSelecionado = d;
    agRender();
}

function agAdiar(id, dias) {
    const e = agDados.etapas.find(x => x.id === id);
    if (!e) return;
    const d = agParse(e.prazo);
    d.setDate(d.getDate() + dias);
    return agAlterarPrazo(id, agFmt(d));
}

function agAdiarPara(id) {
    const campo = document.getElementById(`ag-nd-${id}`);
    if (!campo || !campo.value) { toast('Escolha a nova data.', 'warning'); return; }
    return agAlterarPrazo(id, campo.value);
}

async function agAlterarPrazo(id, nova) {
    const e = agDados.etapas.find(x => x.id === id);
    if (!e || !nova || nova === e.prazo) return;
    if (!agPode()) { toast('Você não tem permissão para alterar prazos.', 'warning'); return; }
    if (e.status === 'Concluído') { toast('Etapas concluídas não têm o prazo alterado.', 'warning'); return; }
    const anterior = e.prazo;
    const { error } = await sb.from('etapas').update({ prazo: nova }).eq('id', id);
    if (error) { toast('Erro ao alterar o prazo: ' + error.message, 'error'); return; }
    e.prazo = nova;
    await addLog('prazo', 'etapa', id, { nome: e.nome, de: anterior, para: nova });
    await pushNotificacao('⏰', `${currentUser.nome} alterou o prazo de "${e.nome}" de ${agCurta(anterior)} para ${agCurta(nova)}.`, 'geral');
    toast(`Prazo movido para ${agCurta(nova)}. ⏰`);
    agRender();
    if (typeof dashDados !== 'undefined' && dashDados) {
        const x = dashDados.etapas.find(y => y.id === id);
        if (x) x.prazo = nova;
    }
}

async function agMoverEvento(id, nova) {
    const e = agDados.eventos.find(x => x.id === id);
    if (!e || nova === e.data) return;
    if (!agPode()) { toast('Você não tem permissão para mover eventos.', 'warning'); return; }
    const { error } = await sb.from('eventos').update({ data: nova }).eq('id', id);
    if (error) { toast('Erro ao mover o evento: ' + error.message, 'error'); return; }
    e.data = nova;
    await addLog('update', 'evento', id, { nome: e.nome });
    toast(`Evento movido para ${agCurta(nova)}. 📅`);
    agRender();
}
