const CHAT_NAV_HTML = `<button id="nav-chat"           class="nav-btn"        onclick="switchTab('chat')"><span class="ni">💬</span> Chat <span id="chat-nav-badge" class="chat-nav-badge hidden">0</span></button>`;

const CHAT_TAB_HTML = `
<div id="tab-chat" class="tab-c">
    <div class="ph"><div><div class="pt">Chat</div><div class="ps">Converse com as pessoas do workspace</div></div></div>
    <div class="chat-shell" id="chat-shell">
        <div class="chat-side">
            <div class="chat-side-h">
                <div class="chat-side-acts">
                    <button class="btn btn-p btn-sm" onclick="abrirModalNovoPrivado()">💬 Nova conversa</button>
                    <button class="btn btn-s btn-sm" onclick="abrirModalNovoGrupo()">👥 Novo grupo</button>
                </div>
                <input class="fi" id="chat-busca" placeholder="Buscar conversa..." style="padding:9px 12px" oninput="chatBusca=this.value;renderChatLista()">
            </div>
            <div class="chat-list" id="chat-list"></div>
        </div>
        <div class="chat-main">
            <div class="chat-vazio" id="chat-vazio"><div class="ei">💬</div><div>Selecione uma conversa ou inicie uma nova</div></div>
            <div class="chat-conv hidden" id="chat-conv">
                <div class="chat-head">
                    <button class="ib chat-back" onclick="fecharChatConversa()">←</button>
                    <div id="chat-head-av"></div>
                    <div class="chat-head-info">
                        <div class="chat-it-name" id="chat-head-nome">—</div>
                        <div class="fhint" id="chat-head-sub" style="margin:0">—</div>
                    </div>
                    <button class="ib hidden" id="chat-head-info-btn" title="Detalhes do grupo" onclick="abrirChatInfoGrupo()">ⓘ</button>
                </div>
                <div class="chat-msgs" id="chat-msgs"></div>
                <div class="chat-compose">
                    <textarea class="fi" id="chat-input" rows="1" maxlength="4000" placeholder="Digite uma mensagem..." oninput="ajustarChatInput()" onkeydown="chatTecla(event)"></textarea>
                    <button class="btn btn-p" onclick="enviarChatMensagem()">Enviar</button>
                </div>
            </div>
        </div>
    </div>
</div>
`;

let chatConversas = [];
let chatAtivaId = null;
let chatMsgs = [];
let chatBusca = '';
let chatTimer = null;
let chatEnviando = false;
let chatIndisponivel = false;
let chatCarregandoConversa = false;

function chatTabAberta() { return document.getElementById('tab-chat').classList.contains('active'); }
function chatNomeUsuario(id) { const u = wsMembers.find(m => m.id === id); return u ? u.nome : 'Ex-membro'; }
function chatHora(iso) { return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }
function chatDiaChave(d) { return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }
function chatDiaRotulo(iso) {
    const d = new Date(iso), hoje = new Date(), ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);
    if (chatDiaChave(d) === chatDiaChave(hoje)) return 'Hoje';
    if (chatDiaChave(d) === chatDiaChave(ontem)) return 'Ontem';
    return d.toLocaleDateString('pt-BR');
}
function chatDataLista(iso) {
    const d = new Date(iso);
    return chatDiaChave(d) === chatDiaChave(new Date()) ? chatHora(iso) : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}
function chatTotalNaoLidas() { return chatConversas.reduce((t, c) => t + c.naoLidas, 0); }
function chatNomeConversa(c) {
    if (c.tipo === 'grupo') return c.nome || 'Grupo';
    const outro = c.membros.find(id => id !== currentUser.id);
    return outro ? chatNomeUsuario(outro) : 'Conversa';
}
function chatAvatar(c, tam) {
    const nome = chatNomeConversa(c);
    const estilo = `background:${userColor(nome)};${tam ? `width:${tam}px;height:${tam}px;` : ''}`;
    return c.tipo === 'grupo'
        ? `<div class="chat-av grp" style="${estilo}">👥</div>`
        : `<div class="chat-av" style="${estilo}">${escH(initials(nome))}</div>`;
}

async function carregarChatConversas() {
    const { data: minhas, error } = await sb.from('chat_participantes').select('conversa_id, ultima_leitura').eq('usuario_id', currentUser.id);
    if (error) { chatIndisponivel = true; return false; }
    chatIndisponivel = false;
    let convs = [];
    if (minhas.length) {
        const r = await sb.from('chat_conversas').select('*').in('id', minhas.map(p => p.conversa_id)).eq('workspace_id', currentWorkspace.id);
        convs = r.data || [];
    }
    const ids = convs.map(c => c.id);
    let parts = [], msgs = [];
    if (ids.length) {
        const [rp, rm] = await Promise.all([
            sb.from('chat_participantes').select('conversa_id, usuario_id').in('conversa_id', ids),
            sb.from('chat_mensagens').select('id, conversa_id, usuario_id, conteudo, created_at').in('conversa_id', ids).order('created_at', { ascending: false }).limit(600)
        ]);
        parts = rp.data || [];
        msgs = rm.data || [];
    }
    const leitura = {};
    minhas.forEach(p => { leitura[p.conversa_id] = p.ultima_leitura ? new Date(p.ultima_leitura).getTime() : 0; });
    const aberta = chatTabAberta();
    chatConversas = convs.map(c => {
        const membros = parts.filter(p => p.conversa_id === c.id).map(p => p.usuario_id);
        const lista = msgs.filter(m => m.conversa_id === c.id);
        const naoLidas = (aberta && c.id === chatAtivaId) ? 0
            : lista.filter(m => m.usuario_id !== currentUser.id && new Date(m.created_at).getTime() > leitura[c.id]).length;
        return { ...c, membros, ultima: lista[0] || null, naoLidas };
    }).sort((a, b) => new Date(b.ultima ? b.ultima.created_at : b.created_at) - new Date(a.ultima ? a.ultima.created_at : a.created_at));
    atualizarChatBadge();
    return true;
}

function atualizarChatBadge() {
    const total = chatTotalNaoLidas();
    const b = document.getElementById('chat-nav-badge');
    b.textContent = total > 99 ? '99+' : total;
    b.classList.toggle('hidden', total === 0);
}

function renderChatLista() {
    const el = document.getElementById('chat-list');
    if (chatIndisponivel) {
        el.innerHTML = '<div class="chat-list-vazio">Chat indisponível. Execute o script chat_setup.sql no Supabase para criar as tabelas.</div>';
        return;
    }
    const termo = chatBusca.trim().toLowerCase();
    const lista = chatConversas.filter(c => !termo || chatNomeConversa(c).toLowerCase().includes(termo));
    if (!lista.length) {
        el.innerHTML = `<div class="chat-list-vazio">${chatConversas.length ? 'Nenhuma conversa encontrada.' : 'Nenhuma conversa ainda. Inicie uma conversa ou crie um grupo.'}</div>`;
        return;
    }
    el.innerHTML = lista.map(c => {
        const u = c.ultima;
        let previa = 'Sem mensagens';
        if (u) {
            const prefixo = u.usuario_id === currentUser.id ? 'Você: ' : (c.tipo === 'grupo' ? chatNomeUsuario(u.usuario_id).split(' ')[0] + ': ' : '');
            previa = prefixo + u.conteudo.replace(/\s+/g, ' ');
        }
        return `<div class="chat-item ${c.id === chatAtivaId ? 'active' : ''}" onclick="abrirChatConversa(${c.id})">
            ${chatAvatar(c)}
            <div class="chat-it-body">
                <div class="chat-it-top"><div class="chat-it-name">${escH(chatNomeConversa(c))}</div><div class="chat-it-time">${u ? chatDataLista(u.created_at) : ''}</div></div>
                <div class="chat-it-bot"><div class="chat-it-last">${escH(previa)}</div>${c.naoLidas ? `<span class="chat-unread">${c.naoLidas > 99 ? '99+' : c.naoLidas}</span>` : ''}</div>
            </div>
        </div>`;
    }).join('');
}

function renderChatCabecalho() {
    const c = chatConversas.find(x => x.id === chatAtivaId);
    if (!c) return;
    const outro = c.tipo === 'privado' ? wsMembers.find(m => m.id === c.membros.find(id => id !== currentUser.id)) : null;
    document.getElementById('chat-head-av').innerHTML = chatAvatar(c, 38);
    document.getElementById('chat-head-nome').textContent = chatNomeConversa(c);
    document.getElementById('chat-head-sub').textContent = c.tipo === 'grupo' ? `${c.membros.length} membros` : (outro && outro.username ? '@' + outro.username : 'Conversa privada');
    document.getElementById('chat-head-info-btn').classList.toggle('hidden', c.tipo !== 'grupo');
}

function renderChatMensagens(forcarFim) {
    const box = document.getElementById('chat-msgs');
    const noFim = forcarFim || box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    const c = chatConversas.find(x => x.id === chatAtivaId);
    const grupo = c && c.tipo === 'grupo';
    if (!chatMsgs.length) {
        box.innerHTML = '<div style="margin:auto;color:var(--muted);font-size:.85rem">Nenhuma mensagem ainda. Diga olá! 👋</div>';
        return;
    }
    let html = '', diaAnt = '', userAnt = null;
    chatMsgs.forEach(m => {
        const dia = chatDiaChave(new Date(m.created_at));
        if (dia !== diaAnt) { html += `<div class="chat-day">${chatDiaRotulo(m.created_at)}</div>`; diaAnt = dia; userAnt = null; }
        const meu = m.usuario_id === currentUser.id;
        const primeiro = userAnt !== m.usuario_id;
        const nome = chatNomeUsuario(m.usuario_id);
        html += `<div class="chat-msg ${meu ? 'me' : ''} ${primeiro ? 'first' : ''}">`
            + (grupo && !meu && primeiro ? `<div class="chat-sender" style="color:${userColor(nome)}">${escH(nome)}</div>` : '')
            + `<div class="chat-bubble">${escH(m.conteudo)}</div><div class="chat-time">${chatHora(m.created_at)}</div></div>`;
        userAnt = m.usuario_id;
    });
    box.innerHTML = html;
    if (noFim) box.scrollTop = box.scrollHeight;
}

async function abrirChatConversa(id) {
    chatAtivaId = id;
    chatMsgs = [];
    chatCarregandoConversa = true;
    document.getElementById('chat-shell').classList.add('in-conv');
    document.getElementById('chat-vazio').classList.add('hidden');
    document.getElementById('chat-conv').classList.remove('hidden');
    document.getElementById('chat-msgs').innerHTML = '<div style="margin:auto"><div class="spinner"></div></div>';
    renderChatCabecalho();
    renderChatLista();
    const { data } = await sb.from('chat_mensagens').select('*').eq('conversa_id', id).order('created_at', { ascending: false }).limit(200);
    if (chatAtivaId !== id) return;
    chatCarregandoConversa = false;
    chatMsgs = (data || []).reverse();
    renderChatMensagens(true);
    marcarChatLida();
    if (window.innerWidth > 860) document.getElementById('chat-input').focus();
}

function fecharChatConversa() {
    chatAtivaId = null;
    chatMsgs = [];
    chatCarregandoConversa = false;
    document.getElementById('chat-shell').classList.remove('in-conv');
    document.getElementById('chat-vazio').classList.remove('hidden');
    document.getElementById('chat-conv').classList.add('hidden');
    renderChatLista();
}

async function marcarChatLida() {
    const id = chatAtivaId;
    if (!id) return;
    const c = chatConversas.find(x => x.id === id);
    if (c) c.naoLidas = 0;
    atualizarChatBadge();
    renderChatLista();
    const ultima = chatMsgs[chatMsgs.length - 1];
    await sb.from('chat_participantes').update({ ultima_leitura: ultima ? ultima.created_at : new Date().toISOString() }).eq('conversa_id', id).eq('usuario_id', currentUser.id);
}

function ajustarChatInput() {
    const t = document.getElementById('chat-input');
    t.style.height = 'auto';
    t.style.height = Math.min(t.scrollHeight, 120) + 'px';
}

function chatTecla(e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); enviarChatMensagem(); }
}

async function enviarChatMensagem() {
    if (chatEnviando || !chatAtivaId) return;
    const inp = document.getElementById('chat-input');
    const texto = inp.value.trim();
    if (!texto) return;
    chatEnviando = true;
    const { data, error } = await sb.from('chat_mensagens').insert({ conversa_id: chatAtivaId, usuario_id: currentUser.id, conteudo: texto }).select().single();
    chatEnviando = false;
    if (error) { toast('Não foi possível enviar a mensagem.', 'error'); return; }
    inp.value = '';
    ajustarChatInput();
    if (!chatMsgs.some(m => m.id === data.id)) chatMsgs.push(data);
    renderChatMensagens(true);
    await carregarChatConversas();
    marcarChatLida();
}

async function chatTick() {
    if (document.hidden || !currentUser || chatIndisponivel) return;
    const aberta = chatTabAberta();
    const antes = chatTotalNaoLidas();
    const ok = await carregarChatConversas();
    if (aberta) renderChatLista();
    if (!ok) return;
    if (!aberta) {
        if (chatTotalNaoLidas() > antes) toast('Nova mensagem no chat. 💬');
        return;
    }
    if (!chatAtivaId || chatCarregandoConversa) return;
    if (!chatConversas.some(c => c.id === chatAtivaId)) { fecharChatConversa(); return; }
    const ultimoId = chatMsgs.length ? chatMsgs[chatMsgs.length - 1].id : 0;
    const { data } = await sb.from('chat_mensagens').select('*').eq('conversa_id', chatAtivaId).gt('id', ultimoId).order('id', { ascending: true });
    if (data && data.length) {
        data.forEach(m => { if (!chatMsgs.some(x => x.id === m.id)) chatMsgs.push(m); });
        renderChatMensagens(false);
        marcarChatLida();
    }
    renderChatCabecalho();
}

async function iniciarChatBackground() {
    await carregarChatConversas();
    clearInterval(chatTimer);
    chatTimer = setInterval(chatTick, 4000);
}

document.addEventListener('visibilitychange', () => { if (!document.hidden && currentUser) chatTick(); });

function chatPessoaItem(m, checkbox) {
    const tag = checkbox ? 'label' : 'div';
    return `<${tag} class="chat-pick" data-nome="${escH((m.nome + ' ' + (m.username || '')).toLowerCase())}" ${checkbox ? '' : `onclick="iniciarChatPrivado(${m.id})"`}>
        ${checkbox ? `<input type="checkbox" class="chat-sel" value="${m.id}" onchange="contarChatSel()">` : ''}
        <div class="chat-av" style="background:${userColor(m.nome)}">${escH(initials(m.nome))}</div>
        <div style="flex:1;min-width:0"><div class="chat-it-name">${escH(m.nome)}</div><div class="fhint" style="margin:0">@${escH(m.username || '')}</div></div>
    </${tag}>`;
}

function filtrarChatPessoas(termo) {
    const t = termo.trim().toLowerCase();
    document.querySelectorAll('#chat-pessoas .chat-pick').forEach(el => el.classList.toggle('hidden', !!t && !el.dataset.nome.includes(t)));
}

function contarChatSel() {
    const n = document.querySelectorAll('.chat-sel:checked').length;
    const el = document.getElementById('chat-sel-cont');
    if (el) el.textContent = `(${n} selecionado${n === 1 ? '' : 's'})`;
}

function abrirModalNovoPrivado() {
    const outros = wsMembers.filter(m => m.id !== currentUser.id);
    const body = outros.length
        ? `<input class="fi" placeholder="Buscar pessoa..." style="margin-bottom:10px" oninput="filtrarChatPessoas(this.value)"><div id="chat-pessoas">${outros.map(m => chatPessoaItem(m, false)).join('')}</div>`
        : '<div class="fhint">Não há outros membros neste workspace.</div>';
    abrirModal('Nova conversa', body, [{ cls: 'btn-s', label: 'Fechar', action: 'fecharModal()' }]);
}

async function iniciarChatPrivado(outroId) {
    const chave = [currentUser.id, outroId].sort((a, b) => a < b ? -1 : a > b ? 1 : 0).join('-');
    const existente = chatConversas.find(c => c.tipo === 'privado' && c.chave_privada === chave);
    if (existente) { fecharModal(); abrirChatConversa(existente.id); return; }
    let { data: conv } = await sb.from('chat_conversas').select('*').eq('workspace_id', currentWorkspace.id).eq('chave_privada', chave).maybeSingle();
    if (!conv) {
        const r = await sb.from('chat_conversas').insert({ workspace_id: currentWorkspace.id, tipo: 'privado', chave_privada: chave, criado_por: currentUser.id }).select().single();
        if (r.error) { toast('Erro ao criar a conversa.', 'error'); return; }
        conv = r.data;
    }
    const { error } = await sb.from('chat_participantes').upsert(
        [{ conversa_id: conv.id, usuario_id: currentUser.id }, { conversa_id: conv.id, usuario_id: outroId }],
        { onConflict: 'conversa_id,usuario_id', ignoreDuplicates: true }
    );
    if (error) { toast('Erro ao criar a conversa.', 'error'); return; }
    await carregarChatConversas();
    fecharModal();
    abrirChatConversa(conv.id);
}

function abrirModalNovoGrupo() {
    const outros = wsMembers.filter(m => m.id !== currentUser.id);
    if (!outros.length) { toast('Não há outros membros neste workspace.', 'warning'); return; }
    const body = `<div class="fg"><label class="fl">Nome do grupo</label><input class="fi" id="chat-grupo-nome" maxlength="60" placeholder="Ex.: Equipe de design"></div>
        <div class="fl">Membros <span class="fhint" id="chat-sel-cont">(0 selecionados)</span></div>
        <input class="fi" placeholder="Buscar pessoa..." style="margin:6px 0 10px" oninput="filtrarChatPessoas(this.value)">
        <div id="chat-pessoas">${outros.map(m => chatPessoaItem(m, true)).join('')}</div>`;
    abrirModal('Novo grupo', body, [
        { cls: 'btn-s', label: 'Cancelar', action: 'fecharModal()' },
        { cls: 'btn-p', label: 'Criar grupo', action: 'criarChatGrupo()' }
    ]);
}

function chatSelecionados() {
    return [...document.querySelectorAll('.chat-sel:checked')].map(i => wsMembers.find(m => String(m.id) === i.value)).filter(Boolean).map(m => m.id);
}

async function criarChatGrupo() {
    const nome = document.getElementById('chat-grupo-nome').value.trim();
    const sel = chatSelecionados();
    if (!nome) { toast('Informe o nome do grupo.', 'warning'); return; }
    if (!sel.length) { toast('Selecione ao menos um membro.', 'warning'); return; }
    const r = await sb.from('chat_conversas').insert({ workspace_id: currentWorkspace.id, tipo: 'grupo', nome, criado_por: currentUser.id }).select().single();
    if (r.error) { toast('Erro ao criar o grupo.', 'error'); return; }
    const linhas = [currentUser.id, ...sel].map(uid => ({ conversa_id: r.data.id, usuario_id: uid }));
    const { error } = await sb.from('chat_participantes').insert(linhas);
    if (error) {
        await sb.from('chat_conversas').delete().eq('id', r.data.id);
        toast('Erro ao adicionar os membros.', 'error');
        return;
    }
    await carregarChatConversas();
    fecharModal();
    abrirChatConversa(r.data.id);
    toast('Grupo criado. 👥');
}

function abrirChatInfoGrupo() {
    const c = chatConversas.find(x => x.id === chatAtivaId);
    if (!c || c.tipo !== 'grupo') return;
    const sou = c.criado_por === currentUser.id;
    const linhas = c.membros.map(id => {
        const u = wsMembers.find(m => m.id === id);
        const nome = u ? u.nome : 'Ex-membro';
        return `<div class="chat-pick" style="cursor:default">
            <div class="chat-av" style="background:${userColor(nome)}">${escH(initials(nome))}</div>
            <div style="flex:1;min-width:0"><div class="chat-it-name">${escH(nome)}${id === currentUser.id ? ' (você)' : ''}</div><div class="fhint" style="margin:0">${u ? '@' + escH(u.username || '') : ''}</div></div>
            ${id === c.criado_por ? '<span class="chat-tag">Criador</span>' : ''}
            ${sou && id !== currentUser.id ? `<button class="ib" title="Remover do grupo" onclick="removerChatMembro(${id})">✕</button>` : ''}
        </div>`;
    }).join('');
    const botoes = [{ cls: 'btn-s', label: 'Fechar', action: 'fecharModal()' }];
    if (sou) botoes.push({ cls: 'btn-s', label: '➕ Adicionar', action: 'abrirModalAddChatMembros()' });
    botoes.push({ cls: '', label: 'Sair do grupo', style: 'background:none;border:1px solid var(--danger);color:var(--danger)', action: 'sairDoChatGrupo()' });
    abrirModal(c.nome || 'Grupo', `<div class="fhint" style="margin-bottom:10px">${c.membros.length} membros</div>${linhas}`, botoes);
}

function abrirModalAddChatMembros() {
    const c = chatConversas.find(x => x.id === chatAtivaId);
    if (!c) return;
    const candidatos = wsMembers.filter(m => !c.membros.includes(m.id));
    const body = candidatos.length
        ? `<div class="fl">Membros <span class="fhint" id="chat-sel-cont">(0 selecionados)</span></div>
           <input class="fi" placeholder="Buscar pessoa..." style="margin:6px 0 10px" oninput="filtrarChatPessoas(this.value)">
           <div id="chat-pessoas">${candidatos.map(m => chatPessoaItem(m, true)).join('')}</div>`
        : '<div class="fhint">Todos os membros do workspace já estão neste grupo.</div>';
    const botoes = [{ cls: 'btn-s', label: 'Voltar', action: 'abrirChatInfoGrupo()' }];
    if (candidatos.length) botoes.push({ cls: 'btn-p', label: 'Adicionar', action: 'adicionarChatMembros()' });
    abrirModal('Adicionar ao grupo', body, botoes);
}

async function adicionarChatMembros() {
    const sel = chatSelecionados();
    if (!sel.length) { toast('Selecione ao menos um membro.', 'warning'); return; }
    const { error } = await sb.from('chat_participantes').upsert(
        sel.map(uid => ({ conversa_id: chatAtivaId, usuario_id: uid })),
        { onConflict: 'conversa_id,usuario_id', ignoreDuplicates: true }
    );
    if (error) { toast('Erro ao adicionar membros.', 'error'); return; }
    await carregarChatConversas();
    renderChatCabecalho();
    abrirChatInfoGrupo();
    toast('Membros adicionados. ✅');
}

async function removerChatMembro(uid) {
    if (!confirm('Remover este membro do grupo?')) return;
    const { error } = await sb.from('chat_participantes').delete().eq('conversa_id', chatAtivaId).eq('usuario_id', uid);
    if (error) { toast('Erro ao remover o membro.', 'error'); return; }
    await carregarChatConversas();
    renderChatCabecalho();
    abrirChatInfoGrupo();
}

async function sairDoChatGrupo() {
    if (!confirm('Sair deste grupo?')) return;
    const id = chatAtivaId;
    const c = chatConversas.find(x => x.id === id);
    const { error } = await sb.from('chat_participantes').delete().eq('conversa_id', id).eq('usuario_id', currentUser.id);
    if (error) { toast('Erro ao sair do grupo.', 'error'); return; }
    if (c && c.membros.length <= 1) await sb.from('chat_conversas').delete().eq('id', id);
    fecharModal();
    fecharChatConversa();
    await carregarChatConversas();
    renderChatLista();
    toast('Você saiu do grupo.');
}

function chatMontarInterface() {
    document.getElementById('nav-contribuidores').insertAdjacentHTML('afterend', CHAT_NAV_HTML);
    document.getElementById('tab-logs').insertAdjacentHTML('beforebegin', CHAT_TAB_HTML);
}

const chatSwitchTabOriginal = switchTab;
switchTab = function (tab) {
    chatSwitchTabOriginal(tab);
    const ativo = tab === 'chat';
    document.getElementById('tab-chat').classList.toggle('active', ativo);
    document.getElementById('nav-chat').classList.toggle('active', ativo);
    if (ativo) { chatIndisponivel = false; renderChatLista(); chatTick(); }
};

const chatEntrarNoDashboardOriginal = entrarNoDashboard;
entrarNoDashboard = async function () {
    await chatEntrarNoDashboardOriginal.apply(this, arguments);
    iniciarChatBackground();
};

chatMontarInterface();