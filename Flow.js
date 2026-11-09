
(function () {
    'use strict';

    const COR = ['#4f46e5', '#7c3aed', '#059669', '#d97706', '#e11d48', '#0891b2', '#475569'];
    const TIPO = { p: { ic: '📁', w: 220 }, s: { ic: '🗂', w: 250 }, e: { ic: '', w: 200 }, n: { ic: '', w: 190 }, b: { ic: '', w: 360 } };
    const ST_COR = { 'Não iniciado': '#94a3b8', 'Em andamento': '#f59e0b', 'Concluído': '#10b981' };
    const SVGNS = 'http://www.w3.org/2000/svg';
    const SH = 54, KH = 40, GAP = 6;   

    let root = null, view = null, world = null, layB = null, layN = null, svg = null;
    let mapas = [], atual = null, sel = null, editing = false, saveT = null, semTabela = false;

    const uid = () => Math.random().toString(36).slice(2, 9);
    const D = () => atual && atual.dados;
    const $ = id => document.getElementById(id);
    const nodeById = id => D().nodes.find(n => n.id === id);
    const elOf = id => layB.querySelector(`[data-id="${id}"]`) || layN.querySelector(`[data-id="${id}"]`);
    const selNode = () => (sel && sel.k === 'n' ? nodeById(sel.id) : null);
    const dono = () => atual && atual.criado_por === currentUser.id;

    // ─── CSS ──────────────────────────────────────────────
    function injetaCss() {
        if ($('fl-css')) return;
        const st = document.createElement('style'); st.id = 'fl-css';
        st.textContent = `
        .fl-top{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
        .fl-top .fsel{width:auto;min-width:200px}
        .fl-bar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:12px 0 10px}
        .fl-bar .sp{flex:1}
        .fl-bar .zl{min-width:46px;text-align:center;font:600 .78rem var(--font);color:var(--muted)}
        .fl-st{font:600 .75rem var(--font);color:var(--muted);margin-left:6px}
        .fl-wrap{height:calc(100vh - 215px);min-height:460px;border:1px solid var(--border);border-radius:14px;overflow:hidden;background:var(--surface)}
        .fl-view{position:relative;width:100%;height:100%;overflow:hidden;touch-action:none;cursor:grab;
            background-image:radial-gradient(#cbd5e1 1px,transparent 1px);background-size:24px 24px;background-color:#f8fafc}
        .fl-view:active{cursor:grabbing}
        .fl-world{position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0}
        .fl-lay{position:absolute;left:0;top:0;width:0;height:0}
        .fl-svg{position:absolute;left:0;top:0;width:1px;height:1px;overflow:visible;pointer-events:none}
        .fl-e{fill:none;stroke:#94a3b8;stroke-width:2}
        .fl-e.sel{stroke:#4f46e5;stroke-width:3}
        .fl-eh{fill:none;stroke:transparent;stroke-width:14;pointer-events:stroke;cursor:pointer}
        .fl-ec{fill:none;stroke:#d97706;stroke-width:2;stroke-dasharray:6 5}
        .fl-tmp{fill:none;stroke:#4f46e5;stroke-width:2;stroke-dasharray:4 4}
        .fl-n{position:absolute;box-sizing:border-box;background:var(--surface);border:1.5px solid var(--c);border-left-width:5px;border-radius:10px;
            padding:8px 12px 8px 10px;box-shadow:0 1px 4px rgba(15,23,42,.12);cursor:grab;font:600 .84rem var(--font);color:var(--text);user-select:none}
        .fl-n.sel{box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 28%,transparent),0 2px 8px rgba(15,23,42,.15)}
        .fl-n.gone{opacity:.55;border-style:dashed}
        .fl-n.fl-n-n{background:#fef9c3;border-color:#fde047;border-left-color:var(--c)}
        .fl-n.fl-n-n .fl-t{white-space:pre-wrap;font-weight:500}
        .fl-n.fl-n-b{background:color-mix(in srgb,var(--c) 7%,transparent);border:2px dashed var(--c);border-radius:16px;padding:0;box-shadow:none}
        .fl-n.fl-n-b.sel{border-style:solid}
        .fl-row{display:flex;align-items:flex-start;gap:7px}
        .fl-row .fl-t{flex:1;min-width:0;overflow-wrap:anywhere}
        .fl-d{width:9px;height:9px;border-radius:50%;flex:none;margin-top:5px}
        .fl-s{margin:3px 0 0 22px;font:500 .72rem var(--font);color:var(--muted)}
        .fl-bh{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:8px 14px;font-weight:700;color:var(--c)}
        .fl-pj{border:1px solid var(--c);background:var(--surface);color:var(--c);border-radius:20px;padding:1px 9px;font:600 .7rem var(--font);cursor:pointer}
        .fl-rs{position:absolute;right:5px;bottom:5px;width:16px;height:16px;cursor:nwse-resize;border-right:3px solid var(--c);border-bottom:3px solid var(--c);border-radius:0 0 8px 0}
        .fl-port{position:absolute;right:-8px;top:50%;margin-top:-6px;width:12px;height:12px;border-radius:50%;background:var(--c);border:2px solid #fff;cursor:crosshair;opacity:0;transition:opacity .1s}
        .fl-n:hover .fl-port,.fl-n.sel .fl-port{opacity:1}
        .fl-t[contenteditable=true]{outline:2px solid var(--acc);border-radius:4px;background:#fff;cursor:text;user-select:text;padding:0 3px}
        .fl-vazio{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;height:100%;color:var(--muted);text-align:center;padding:20px}
        .fl-vazio .ei{font-size:2.4rem}
        .fl-hint{position:absolute;left:12px;bottom:10px;font:500 .72rem var(--font);color:var(--muted);background:rgba(255,255,255,.85);padding:3px 9px;border-radius:8px;pointer-events:none}
        .fl-n.fl-n-s{padding:0;background:color-mix(in srgb,var(--c) 6%,var(--surface))}
        .fl-hd{height:${SH}px;box-sizing:border-box;padding:8px 12px 0 10px;overflow:hidden}
        .fl-hd .fl-t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .fl-slot{position:absolute;left:12px;right:12px;height:${KH}px;box-sizing:border-box;border:2px dashed color-mix(in srgb,var(--c) 40%,transparent);border-radius:8px;display:flex;align-items:center;justify-content:center;font:500 .74rem var(--font);color:var(--muted);pointer-events:none}
        .fl-kid{height:${KH}px;box-sizing:border-box;padding:0 12px 0 8px;border-left-width:4px;display:flex;align-items:center}
        .fl-kid .fl-row{width:100%;align-items:center}
        .fl-kid .fl-t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .fl-kid .fl-s{display:none}
        .fl-n.snap{box-shadow:0 0 0 3px #22c55e,0 2px 10px rgba(34,197,94,.3)}
        .fl-snapln{position:absolute;height:5px;border-radius:3px;background:#22c55e;pointer-events:none;z-index:9}
        .fl-imp{max-height:52vh;overflow:auto;border:1px solid var(--border);border-radius:10px;padding:6px 10px}
        .fl-imp summary{cursor:pointer;padding:5px 0;font-weight:700}
        .fl-i1{margin-left:22px;padding:2px 0}.fl-i2{margin-left:24px;font-size:.84rem}
        .fl-imp label{cursor:pointer}`;
        document.head.appendChild(st);
    }

    // ─── Estrutura da aba ─────────────────────────────────
    function monta() {
        root = $('tab-flow');
        if (root.dataset.pronto) return;
        root.dataset.pronto = '1';
        root.innerHTML = `
        <div class="ph"><div><div class="pt">Flow</div><div class="ps">Mapas mentais dos projetos — privados ou compartilhados</div></div>
            <div class="fl-top">
                <select id="fl-sel" class="fsel" onchange="Flow.trocar(this.value)" aria-label="Mapa"></select>
                <button class="btn btn-p btn-sm" onclick="Flow.modalMapa()">+ Novo mapa</button>
                <button class="btn btn-s btn-sm" id="fl-cfg" onclick="Flow.modalMapa(true)" title="Nome, visibilidade e exclusão do mapa">⚙️</button>
                <button class="btn btn-s btn-sm" onclick="Flow.recarregar()" title="Recarregar (útil em mapas compartilhados)">↻</button>
            </div></div>
        <div class="fl-bar" id="fl-bar">
            <button class="btn btn-s btn-sm" onclick="Flow.novo('b')">▭ Bloco</button>
            <button class="btn btn-s btn-sm" onclick="Flow.novo('s')">🗂 Atividade</button>
            <button class="btn btn-s btn-sm" onclick="Flow.novo('e')">✅ Etapa</button>
            <button class="btn btn-s btn-sm" onclick="Flow.novo('n')">🗒 Nota</button>
            <button class="btn btn-s btn-sm" onclick="Flow.modalImportar()">📥 Do projeto</button>
            <button class="btn btn-s btn-sm" data-sel="1" onclick="Flow.filho()" title="Cria um nó ligado ao selecionado (Tab)">↳ Filho</button>
            <button class="btn btn-s btn-sm" data-sel="1" onclick="Flow.cor()" title="Trocar a cor">🎨</button>
            <button class="btn btn-s btn-sm" data-sel="1" onclick="Flow.remover()" title="Remove do mapa (não apaga nada do projeto)">🗑</button>
            <button class="btn btn-p btn-sm" id="fl-bp" onclick="Flow.modalBloco()" title="Cria um projeto a partir do que está dentro do bloco selecionado">💾 Bloco → Projeto</button>
            <span class="sp"></span>
            <button class="btn btn-s btn-sm" onclick="Flow.zoom(-1)">−</button><span class="zl" id="fl-zl">100%</span>
            <button class="btn btn-s btn-sm" onclick="Flow.zoom(1)">+</button>
            <button class="btn btn-s btn-sm" onclick="Flow.ajustar()">Ajustar</button>
            <span class="fl-st" id="fl-st"></span>
        </div>
        <div class="fl-wrap"><div class="fl-view" id="fl-view">
            <div class="fl-world" id="fl-world"><div class="fl-lay" id="fl-lb"></div><svg class="fl-svg" id="fl-svg"></svg><div class="fl-lay" id="fl-ln"></div></div>
            <div class="fl-hint">Arraste o fundo para mover · roda do mouse para zoom · solte uma etapa sobre uma atividade para encaixá-la · bolinha liga nós · duplo clique edita</div>
        </div></div>`;
        view = $('fl-view'); world = $('fl-world'); layB = $('fl-lb'); layN = $('fl-ln'); svg = $('fl-svg');
        view.addEventListener('pointerdown', onDown);
        view.addEventListener('dblclick', onDbl);
        view.addEventListener('click', onClick);
        view.addEventListener('wheel', ev => {
            if (!D()) return; ev.preventDefault();
            const r = view.getBoundingClientRect();
            zoomEm(ev.clientX - r.left, ev.clientY - r.top, D().view.z * (ev.deltaY < 0 ? 1.1 : 1 / 1.1));
        }, { passive: false });
    }

    // ─── Carregar mapas ───────────────────────────────────
    async function abrir() {
        injetaCss(); monta();
        if (saveT) await flush();
        if (!(wsProjetos || []).length) { try { await renderizarProjetos(); } catch (e) { /* segue sem projetos */ } }
        const r = await sb.from('flows').select('id, nome, visibilidade, criado_por, updated_at').eq('workspace_id', currentWorkspace.id).order('updated_at', { ascending: false });
        semTabela = !!r.error;
        mapas = semTabela ? [] : (r.data || []).filter(m => m.visibilidade === 'compartilhado' || m.criado_por === currentUser.id);
        if (semTabela) { atual = null; return telaVazia('⚠️', 'Tabela dos mapas não encontrada', 'Rode o SQL migracao_flow_condicoes.sql no Supabase e recarregue a página.'); }
        let id = null;
        try { id = +localStorage.getItem('fd-flow-' + currentWorkspace.id) || null; } catch (e) { /* sem localStorage */ }
        if (!mapas.some(m => m.id === id)) id = mapas[0]?.id || null;
        preencheSelect(id);
        if (id) await carregar(id); else { atual = null; telaVazia('🧠', 'Nenhum mapa ainda', 'Crie um mapa para organizar projetos, atividades e etapas visualmente.', true); }
    }
    function preencheSelect(id) {
        $('fl-sel').innerHTML = mapas.map(m => `<option value="${m.id}" ${m.id === id ? 'selected' : ''}>${m.visibilidade === 'compartilhado' ? '👥' : '🔒'} ${escH(m.nome)}</option>`).join('');
        $('fl-sel').classList.toggle('hidden', !mapas.length);
        $('fl-cfg').classList.toggle('hidden', !mapas.length);
    }
    function telaVazia(ic, tit, txt, criar) {
        $('fl-bar').classList.add('hidden'); world.classList.add('hidden');
        view.querySelector('.fl-vazio')?.remove();
        view.insertAdjacentHTML('beforeend', `<div class="fl-vazio"><div class="ei">${ic}</div><h3>${tit}</h3><p>${txt}</p>${criar ? '<button class="btn btn-p" onclick="Flow.modalMapa()">+ Criar mapa</button>' : ''}</div>`);
    }
    async function carregar(id) {
        const r = await sb.from('flows').select('*').eq('id', id).single();
        if (r.error || !r.data) { toast('Não consegui abrir o mapa.', 'error'); return; }
        const m = r.data, d = m.dados || {};
        m.dados = { v: 1, view: d.view || { x: 60, y: 60, z: 1 }, nodes: d.nodes || [], edges: d.edges || [] };
        atual = m; sel = null;
        try { localStorage.setItem('fd-flow-' + currentWorkspace.id, String(id)); } catch (e) { /* ok */ }
        view.querySelector('.fl-vazio')?.remove();
        $('fl-bar').classList.remove('hidden'); world.classList.remove('hidden');
        setStatus('');
        render(); applyView();
    }
    async function trocar(id) { if (saveT) await flush(); await carregar(+id); }
    async function recarregar() { if (saveT) await flush(); await abrir(); }

    // ─── Salvar  ──────────────────────────────
    function setStatus(t) { const el = $('fl-st'); if (el) el.textContent = t; }
    function salvar() { if (!atual) return; setStatus('Salvando…'); clearTimeout(saveT); saveT = setTimeout(flush, 700); }
    async function flush() {
        clearTimeout(saveT); saveT = null;
        if (!atual) return;
        const { error } = await sb.from('flows').update({ dados: atual.dados, updated_at: new Date().toISOString() }).eq('id', atual.id);
        setStatus(error ? '⚠️ Não salvou' : '✓ Salvo');
        if (error) toast('Erro ao salvar o mapa: ' + error.message, 'error');
    }
    window.addEventListener('pagehide', () => { if (saveT) flush(); });

    // ─── Dados reais ──────
    function refs() {
        const P = new Map(), S = new Map(), E = new Map();
        (wsProjetos || []).forEach(p => {
            P.set(p.id, p);
            (p.sessoes || []).forEach(s => { S.set(s.id, { s, p }); (s.etapas || []).forEach(e => E.set(e.id, { e, s, p })); });
            (p.soltas || []).forEach(e => E.set(e.id, { e, s: null, p }));
        });
        return { P, S, E };
    }
    function info(n, R) {
        if (n.t === 'p' && n.ref) {
            const p = R.P.get(n.ref); if (!p) return { txt: n.txt || '(projeto removido)', gone: true };
            const et = todasEtapas(p); return { txt: p.nome, sub: `${et.filter(e => e.status === 'Concluído').length}/${et.length} etapas` };
        }
        if (n.t === 's' && n.ref) {
            const o = R.S.get(n.ref); if (!o) return { txt: n.txt || '(atividade removida)', gone: true };
            const et = o.s.etapas || []; return { txt: o.s.nome, sub: `${o.p.nome} · ${et.filter(e => e.status === 'Concluído').length}/${et.length}` };
        }
        if (n.t === 'e' && n.ref) {
            const o = R.E.get(n.ref); if (!o) return { txt: n.txt || '(etapa removida)', gone: true };
            return { txt: o.e.nome, st: o.e.status, sub: `${o.p.nome}${o.s ? ' · ' + o.s.nome : ''}` };
        }
        return { txt: n.txt || '' };
    }

    // ─── Renderização ─────────────────────────────────────
    function nodeHtml(n, R) {
        const i = info(n, R), eSel = sel && sel.k === 'n' && sel.id === n.id;
        const kid = n.t === 'e' && n.pai;
        const cls = `fl-n fl-n-${n.t}${kid ? ' fl-kid' : ''}${eSel ? ' sel' : ''}${i.gone ? ' gone' : ''}`;
        const st = `left:${n.x}px;top:${n.y}px;width:${n.w}px;${n.t === 'b' || n.t === 's' ? `height:${n.h}px;` : ''}--c:${COR[n.c || 0]}`;
        if (n.t === 'b') {
            const pj = n.proj && R.P.get(n.proj);
            return `<div class="${cls}" data-id="${n.id}" style="${st}"><div class="fl-bh"><span class="fl-t">${escH(i.txt)}</span>${pj ? `<button class="fl-pj" data-act="proj" title="Abrir o projeto criado a partir deste bloco">📁 ${escH(pj.nome)}</button>` : ''}</div><i class="fl-rs" data-act="resize"></i></div>`;
        }
        const ic = n.t === 'e' ? `<i class="fl-d" style="background:${ST_COR[i.st] || '#94a3b8'}"></i>` : (TIPO[n.t].ic ? `<span>${TIPO[n.t].ic}</span>` : '');
        if (n.t === 's') {
            const vazio = !kids(n).length;
            return `<div class="${cls}" data-id="${n.id}" style="${st}"><div class="fl-hd"><div class="fl-row">${ic}<span class="fl-t" title="${escH(i.txt)}">${escH(i.txt)}</span></div>${i.sub ? `<div class="fl-s">${escH(i.sub)}</div>` : ''}</div>${vazio ? `<div class="fl-slot" style="top:${SH}px">Solte etapas aqui</div>` : ''}<i class="fl-port" data-act="port" title="Arraste até outro nó para ligar"></i></div>`;
        }
        return `<div class="${cls}" data-id="${n.id}" style="${st}"><div class="fl-row">${ic}<span class="fl-t">${escH(i.txt)}</span></div>${i.sub ? `<div class="fl-s">${escH(i.sub)}</div>` : ''}<i class="fl-port" data-act="port" title="Arraste até outro nó para ligar"></i></div>`;
    }
    function render() {
        const d = D(); if (!d) return;
        const R = refs();
        d.nodes.forEach(k => { if (k.pai && !nodeById(k.pai)) { k.pai = null; k.w = TIPO[k.t].w; } });   // pai excluído: etapa fica solta
        d.nodes.filter(n => n.t === 's').forEach(reflow);
        const livres = d.nodes.filter(n => n.t !== 'b' && !n.pai), presas = d.nodes.filter(n => n.t !== 'b' && n.pai);
        layB.innerHTML = d.nodes.filter(n => n.t === 'b').sort((a, b) => b.w * b.h - a.w * a.h).map(n => nodeHtml(n, R)).join('');
        layN.innerHTML = livres.concat(presas).map(n => nodeHtml(n, R)).join('');   // etapas encaixadas por último = acima da atividade
        drawEdges(); updToolbar();
    }
    function applyView() {
        const v = D().view;
        world.style.transform = `translate(${v.x}px,${v.y}px) scale(${v.z})`;
        view.style.backgroundPosition = `${v.x}px ${v.y}px`;
        view.style.backgroundSize = `${24 * v.z}px ${24 * v.z}px`;
        $('fl-zl').textContent = Math.round(v.z * 100) + '%';
    }
    function markSel() {
        view.querySelectorAll('.fl-n').forEach(el => el.classList.toggle('sel', !!sel && sel.k === 'n' && sel.id === el.dataset.id));
        drawEdges(); updToolbar();
    }
    function updToolbar() {
        const n = selNode();
        root.querySelectorAll('[data-sel]').forEach(b => { b.disabled = !sel; b.style.opacity = sel ? 1 : .45; });
        const bp = $('fl-bp'); if (bp) { const on = !!n && n.t === 'b'; bp.disabled = !on; bp.style.opacity = on ? 1 : .45; }
    }

    // ─── Ligações ─────────────────────────────────────────
    // ─── Encaixe (estilo Scratch) ─────────────────────────
    const kids = s => D().nodes.filter(n => n.pai === s.id).sort((a, b) => (a.o ?? 1e9) - (b.o ?? 1e9) || a.y - b.y);
   
    function reflow(s) {
        const ks = kids(s);
        ks.forEach((k, i) => { k.o = i; k.x = s.x + 12; k.y = s.y + SH + i * (KH + GAP); k.w = s.w - 24; });
        s.h = SH + Math.max(1, ks.length) * (KH + GAP) + GAP;
    }
    function desprende(n) {
        const pai = nodeById(n.pai); n.pai = null; n.w = TIPO[n.t].w;
        if (pai) reflow(pai);
        render();
    }
    function alvoSnap(drag, p) {
        const alvos = D().nodes.filter(n => n.t === 's' && n.id !== drag.id && p.x >= n.x && p.x <= n.x + n.w && p.y >= n.y && p.y <= n.y + (n.h || 60));
        const a = alvos[alvos.length - 1] || null;
        return a ? { a, idx: kids(a).filter(k => k.id !== drag.id && k.y + KH / 2 < p.y).length } : null;
    }
    function mostraSnap(al) {
        view.querySelectorAll('.fl-n.snap').forEach(el => el.classList.remove('snap'));
        let ln = layN.querySelector('.fl-snapln');
        if (!al) { if (ln) ln.remove(); return; }
        elOf(al.a.id)?.classList.add('snap');
        if (!ln) { ln = document.createElement('div'); ln.className = 'fl-snapln'; layN.appendChild(ln); }
        ln.style.left = (al.a.x + 12) + 'px'; ln.style.width = (al.a.w - 24) + 'px';
        ln.style.top = (al.a.y + SH + al.idx * (KH + GAP) - GAP / 2 - 2) + 'px';
    }
    function rectOf(n) { const el = elOf(n.id); return { x: n.x, y: n.y, w: n.w, h: (n.t === 'b' || n.t === 's') && n.h ? n.h : (el ? el.offsetHeight : 44) }; }
    function bez(x1, y1, x2, y2, h) {
        const d = Math.max(40, (h ? Math.abs(x2 - x1) : Math.abs(y2 - y1)) / 2), s = (h ? Math.sign(x2 - x1) : Math.sign(y2 - y1)) || 1;
        return h ? `M${x1},${y1} C${x1 + d * s},${y1} ${x2 - d * s},${y2} ${x2},${y2}` : `M${x1},${y1} C${x1},${y1 + d * s} ${x2},${y2 - d * s} ${x2},${y2}`;
    }
    function ligar(a, b) {
        const A = rectOf(a), B = rectOf(b), ay = A.y + A.h / 2, by = B.y + B.h / 2;
        if (B.x >= A.x + A.w - 10) return bez(A.x + A.w, ay, B.x, by, true);
        if (B.x + B.w <= A.x + 10) return bez(A.x, ay, B.x + B.w, by, true);
        return B.y > A.y ? bez(A.x + A.w / 2, A.y + A.h, B.x + B.w / 2, B.y, false) : bez(A.x + A.w / 2, A.y, B.x + B.w / 2, B.y + B.h, false);
    }
    function drawEdges() {
        const d = D(); if (!d) return;
        const mk = (id, c) => `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${c}"/></marker>`;
        let h = `<defs>${mk('fl-ar', '#94a3b8')}${mk('fl-ar2', '#d97706')}${mk('fl-ar3', '#4f46e5')}</defs>`;
        const byId = new Map(d.nodes.map(n => [n.id, n]));
        d.edges.forEach(e => {
            const a = byId.get(e.a), b = byId.get(e.b); if (!a || !b) return;
            const p = ligar(a, b), s = sel && sel.k === 'g' && sel.id === e.id;
            h += `<path d="${p}" class="fl-e${s ? ' sel' : ''}" marker-end="url(#${s ? 'fl-ar3' : 'fl-ar'})"/><path d="${p}" class="fl-eh" data-edge="${e.id}"/>`;
        });
        const porRef = new Map();
        d.nodes.forEach(n => { if (n.ref && (n.t === 's' || n.t === 'e')) porRef.set((n.t === 's' ? 'sessao' : 'etapa') + ':' + n.ref, n); });
        (typeof wsCondicoes !== 'undefined' ? wsCondicoes : []).forEach(c => {
            const de = porRef.get(c.cond_tipo + ':' + c.cond_id), para = porRef.get(c.alvo_tipo + ':' + c.alvo_id);
            if (de && para) h += `<path d="${ligar(de, para)}" class="fl-ec" marker-end="url(#fl-ar2)"><title>Condição</title></path>`;
        });
        svg.innerHTML = h;
    }

    // ─── Interação ────────────────────────────────────────
    function toWorld(cx, cy) { const r = view.getBoundingClientRect(), v = D().view; return { x: (cx - r.left - v.x) / v.z, y: (cy - r.top - v.y) / v.z }; }
    function track(ev, move, up) {
        const sx = ev.clientX, sy = ev.clientY;
        const mv = e => move(e.clientX - sx, e.clientY - sy, e);
        const end = e => {
            window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end);
            if (up) up(e, e.clientX - sx, e.clientY - sy);
        };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
    }
    function dentro(b) {
        return D().nodes.filter(n => n.id !== b.id && (n.x + n.w / 2) > b.x && (n.x + n.w / 2) < b.x + b.w && (n.y + 20) > b.y && (n.y + 20) < b.y + b.h);
    }
    function onDown(ev) {
        if (!D() || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
        if (editing) { if (ev.target.closest('[contenteditable=true]')) return; document.activeElement.blur(); }
        if (ev.target.closest('.fl-pj')) return;
        const nEl = ev.target.closest('.fl-n');
        if (!nEl) {
            const g = ev.target.closest('[data-edge]');
            if (g) { sel = { k: 'g', id: g.dataset.edge }; markSel(); return; }
            sel = null; markSel(); return startPan(ev);
        }
        const n = nodeById(nEl.dataset.id); if (!n) return;
        sel = { k: 'n', id: n.id }; markSel();
        const act = ev.target.dataset.act;
        if (act === 'port') startLink(ev, n); else if (act === 'resize') startResize(ev, n); else startDrag(ev, n);
    }
    function startPan(ev) {
        const v = D().view, ox = v.x, oy = v.y; let mexeu = false;
        track(ev, (dx, dy) => { mexeu = true; v.x = ox + dx; v.y = oy + dy; applyView(); }, () => { if (mexeu) salvar(); });
    }
    function startDrag(ev, n) {
        const grupo = (n.t === 'b' ? dentro(n) : n.t === 's' ? kids(n) : []).concat(n).map(g => [g, g.x, g.y]);
        let mexeu = false, solto = false, alvo = null;
        track(ev, (dx, dy, e) => {
            const z = D().view.z; if (Math.abs(dx) + Math.abs(dy) > 3) mexeu = true; if (!mexeu) return;
            if (n.pai && !solto) { solto = true; desprende(n); }   // arrancou a etapa da pilha
            grupo.forEach(([g, x, y]) => { g.x = Math.round(x + dx / z); g.y = Math.round(y + dy / z); const el = elOf(g.id); if (el) { el.style.left = g.x + 'px'; el.style.top = g.y + 'px'; } });
            drawEdges();
            if (n.t === 'e') { alvo = alvoSnap(n, toWorld(e.clientX, e.clientY)); mostraSnap(alvo); }
        }, () => {
            mostraSnap(null);
            if (n.t === 'e' && alvo && mexeu) { n.pai = alvo.a.id; n.o = alvo.idx - .5; render(); salvar(); return; }
            if (mexeu) salvar();
        });
    }
    function startResize(ev, n) {
        const w = n.w, h = n.h;
        track(ev, (dx, dy) => {
            const z = D().view.z; n.w = Math.max(200, Math.round(w + dx / z)); n.h = Math.max(120, Math.round(h + dy / z));
            const el = elOf(n.id); el.style.width = n.w + 'px'; el.style.height = n.h + 'px';
        }, () => salvar());
    }
    function startLink(ev, n) {
        const A = rectOf(n), tmp = document.createElementNS(SVGNS, 'path'); tmp.setAttribute('class', 'fl-tmp'); svg.appendChild(tmp);
        track(ev, (dx, dy, e) => { const p = toWorld(e.clientX, e.clientY); tmp.setAttribute('d', bez(A.x + A.w, A.y + A.h / 2, p.x, p.y, true)); }, e => {
            tmp.remove();
            const t = document.elementFromPoint(e.clientX, e.clientY)?.closest('.fl-n'), m = t && nodeById(t.dataset.id);
            if (m && m.id !== n.id && m.t !== 'b' && !D().edges.some(x => x.a === n.id && x.b === m.id)) { D().edges.push({ id: uid(), a: n.id, b: m.id }); salvar(); drawEdges(); }
        });
    }
    function onClick(ev) {
        const b = ev.target.closest('[data-act="proj"]'); if (!b) return;
        const n = nodeById(b.closest('.fl-n').dataset.id); if (n?.proj) { switchTab('projetos'); abrirProjeto(n.proj); }
    }
    function onDbl(ev) {
        const nEl = ev.target.closest('.fl-n'); if (!nEl || ev.target.closest('.fl-pj')) return;
        const n = nodeById(nEl.dataset.id); if (!n) return;
        if (!n.ref) return editar(n.id);
        const R = refs();
        if (n.t === 'e') return irParaEtapa(n.ref);
        const p = n.t === 'p' ? R.P.get(n.ref) : R.S.get(n.ref)?.p;
        if (p) { switchTab('projetos'); abrirProjeto(p.id); } else toast('Item não encontrado (foi excluído?).', 'warning');
    }
    function editar(id) {
        const n = nodeById(id), el = elOf(id)?.querySelector('.fl-t'); if (!n || !el || n.ref) return;
        editing = true; el.contentEditable = 'true'; el.focus(); document.getSelection().selectAllChildren(el);
        let cancelou = false;
        el.onkeydown = e => {
            if (e.key === 'Enter' && !(e.shiftKey && n.t === 'n')) { e.preventDefault(); el.blur(); }
            if (e.key === 'Escape') { cancelou = true; el.blur(); }
        };
        el.onblur = () => { editing = false; if (!cancelou) { const v = el.innerText.trim(); if (v) { n.txt = v; salvar(); } } render(); };
    }
    document.addEventListener('keydown', ev => {
        if (!root || root.offsetParent === null || !D() || editing) return;
        if (ev.target.closest('input, textarea, select, [contenteditable=true]') || !$('modal-ov').classList.contains('hidden')) return;
        if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); remover(); }
        else if (ev.key === 'Tab' && selNode()) { ev.preventDefault(); filho(); }
        else if (ev.key === 'Escape') { sel = null; markSel(); }
    });

    // ─── Ações da barra ───────────────────────────────────
    function centro() { const r = view.getBoundingClientRect(); return toWorld(r.left + r.width / 2, r.top + r.height / 2); }
    function novo(t, extra, paiId) {
        if (!D()) return null;
        const c = centro(), w = TIPO[t].w, j = () => Math.round((Math.random() - .5) * 60);
        const n = Object.assign({
            id: uid(), t, x: Math.round(c.x - w / 2) + j(), y: Math.round(c.y - 30) + j(), w,
            txt: { b: 'Novo bloco', s: 'Nova atividade', e: 'Nova etapa', n: 'Nota' }[t], c: { p: 0, s: 1, e: 2, n: 3, b: 6 }[t]
        }, t === 'b' ? { h: 240 } : {}, extra || {});
        D().nodes.push(n);
        if (paiId) D().edges.push({ id: uid(), a: paiId, b: n.id });
        sel = { k: 'n', id: n.id }; salvar(); render();
        if (t !== 'p' && !n.ref) editar(n.id);
        return n;
    }
    function filho() {
        const n = selNode(); if (!n || n.t === 'b') return;
        if (n.t === 's') return novo('e', { pai: n.id, o: 1e9, w: n.w - 24 });
        if (n.t === 'e' && n.pai) return novo('e', { pai: n.pai, o: (n.o ?? 0) + .5, w: n.w });
        const t = { p: 's', s: 'e', e: 'e', n: 'n' }[n.t], irmaos = D().edges.filter(e => e.a === n.id).length;
        novo(t, { x: n.x + n.w + 70, y: n.y + irmaos * 70 }, n.id);
    }
    function cor() { const n = selNode(); if (!n) return; n.c = ((n.c || 0) + 1) % COR.length; salvar(); render(); }
    function remover() {
        if (!sel || !D()) return; const d = D();
        if (sel.k === 'g') d.edges = d.edges.filter(e => e.id !== sel.id);
        else { d.nodes.forEach(k => { if (k.pai === sel.id) { k.pai = null; k.w = TIPO[k.t].w; } }); d.nodes = d.nodes.filter(n => n.id !== sel.id); d.edges = d.edges.filter(e => e.a !== sel.id && e.b !== sel.id); }
        sel = null; salvar(); render();
    }
    function zoomEm(px, py, nz) {
        const v = D().view; nz = Math.min(2, Math.max(.25, nz)); const k = nz / v.z;
        v.x = px - (px - v.x) * k; v.y = py - (py - v.y) * k; v.z = nz; applyView(); salvar();
    }
    function zoom(dir) { if (!D()) return; const r = view.getBoundingClientRect(); zoomEm(r.width / 2, r.height / 2, D().view.z * (dir > 0 ? 1.2 : 1 / 1.2)); }
    function ajustar() {
        const d = D(); if (!d || !d.nodes.length) return;
        const xs = d.nodes.map(n => n.x), ys = d.nodes.map(n => n.y);
        const x2 = Math.max(...d.nodes.map(n => n.x + n.w)), y2 = Math.max(...d.nodes.map(n => n.y + ((n.t === 'b' || n.t === 's') && n.h ? n.h : 60)));
        const x1 = Math.min(...xs), y1 = Math.min(...ys), r = view.getBoundingClientRect();
        const z = Math.min(1.2, Math.max(.25, Math.min(r.width / (x2 - x1 + 100), r.height / (y2 - y1 + 100))));
        d.view = { z, x: (r.width - (x2 - x1) * z) / 2 - x1 * z, y: (r.height - (y2 - y1) * z) / 2 - y1 * z };
        applyView(); salvar();
    }

    // ─── Mapas: ───
    function modalMapa(edit) {
        if (edit && !atual) return;
        const m = edit ? atual : { nome: '', visibilidade: 'privado' }, pode = !edit || dono();
        abrirModal(edit ? '⚙️ Mapa' : '🧠 Novo mapa', `
            <div class="fg"><label class="fl">Nome</label><input id="fl-mn" class="fi" value="${escH(m.nome)}" ${pode ? '' : 'disabled'} placeholder="Ex.: Roadmap do trimestre"/></div>
            <div class="fg"><label class="fl">Quem pode ver e editar</label>
                <select id="fl-mv" class="fsel" ${pode ? '' : 'disabled'}>
                    <option value="privado" ${m.visibilidade === 'privado' ? 'selected' : ''}>🔒 Privado — só eu</option>
                    <option value="compartilhado" ${m.visibilidade === 'compartilhado' ? 'selected' : ''}>👥 Compartilhado — todos do workspace</option>
                </select>
                <p class="fhint">Em mapas compartilhados todos editam o mesmo mapa; se duas pessoas salvarem ao mesmo tempo, vale a última.</p></div>
            ${pode ? '' : '<p class="fhint">Só quem criou o mapa pode renomear, mudar a visibilidade ou excluir.</p>'}`,
            pode ? [{ label: edit ? '💾 Salvar' : '+ Criar', cls: 'btn-p', action: `Flow.salvarMapa(${edit ? 'true' : 'false'})` }, { label: 'Cancelar', cls: 'btn-s', action: 'fecharModal()' }]
                .concat(edit ? [{ label: '🗑 Excluir mapa', cls: 'btn-s', style: 'border-color:var(--danger);color:var(--danger)', action: 'Flow.excluirMapa()' }] : [])
                : [{ label: 'Fechar', cls: 'btn-s', action: 'fecharModal()' }]);
    }
    async function salvarMapa(edit) {
        const nome = $('fl-mn')?.value.trim(), vis = $('fl-mv')?.value; if (!nome) return toast('Informe o nome.', 'warning');
        if (edit) {
            const { error } = await sb.from('flows').update({ nome, visibilidade: vis }).eq('id', atual.id);
            if (error) return toast('Erro: ' + error.message, 'error');
            atual.nome = nome; atual.visibilidade = vis; fecharModal(); await abrir();
        } else {
            const dados = { v: 1, view: { x: 60, y: 60, z: 1 }, nodes: [], edges: [] };
            const { data, error } = await sb.from('flows').insert({ workspace_id: currentWorkspace.id, nome, visibilidade: vis, dados, criado_por: currentUser.id }).select().single();
            if (error) return toast('Erro: ' + error.message, 'error');
            fecharModal();
            try { localStorage.setItem('fd-flow-' + currentWorkspace.id, String(data.id)); } catch (e) { /* ok */ }
            await abrir();
        }
    }
    async function excluirMapa() {
        if (!atual || !dono() || !confirm(`Excluir o mapa "${atual.nome}"? Os projetos, atividades e etapas não são afetados.`)) return;
        const { error } = await sb.from('flows').delete().eq('id', atual.id);
        if (error) return toast('Erro: ' + error.message, 'error');
        atual = null; fecharModal(); toast('Mapa excluído.');
        try { localStorage.removeItem('fd-flow-' + currentWorkspace.id); } catch (e) { /* ok */ }
        await abrir();
    }

    // ─── Importar projetos/atividades/etapas existentes ──
    function modalImportar() {
        if (!D()) return;
        const P = (wsProjetos || []).slice().sort(ordCmp);
        if (!P.length) return toast('Não há projetos neste workspace.', 'warning');
        const et = (e, extra) => `<div class="fl-i2"><label><input type="checkbox" data-k="e" data-id="${e.id}" ${extra}/> ${escH(e.nome)}</label></div>`;
        abrirModal('📥 Adicionar do projeto', `<p class="fhint" style="margin-bottom:8px">Marque o que entra no mapa. Os itens são montados em árvore (projeto → atividades → etapas); o que já estiver no mapa é reaproveitado.</p>
            <div class="fl-imp">${P.map(p => `<details><summary><label><input type="checkbox" data-k="p" data-id="${p.id}" onchange="Flow.marcar(this)"/> 📁 ${escH(p.nome)}</label></summary>
                ${(p.sessoes || []).slice().sort(ordCmp).map(s => `<div class="fl-i1"><label><input type="checkbox" data-k="s" data-id="${s.id}" data-p="${p.id}" onchange="Flow.marcar(this)"/> 🗂 ${escH(s.nome)}</label>${(s.etapas || []).slice().sort(ordCmp).map(e => et(e, `data-s="${s.id}" data-p="${p.id}"`)).join('')}</div>`).join('')}
                ${(p.soltas || []).map(e => `<div class="fl-i1">${et(e, `data-p="${p.id}"`)}</div>`).join('')}</details>`).join('')}</div>`,
            [{ label: 'Adicionar ao mapa', cls: 'btn-p', action: 'Flow.importar()' }, { label: 'Cancelar', cls: 'btn-s', action: 'fecharModal()' }]);
    }
    function marcar(el) {
        const q = el.dataset.k === 'p' ? `.fl-imp input[data-p="${el.dataset.id}"]` : `.fl-imp input[data-s="${el.dataset.id}"]`;
        document.querySelectorAll(q).forEach(i => { i.checked = el.checked; });
    }
    function importar() {
        const d = D(); if (!d) return;
        const ck = [...document.querySelectorAll('.fl-imp input:checked')].map(i => ({ k: i.dataset.k, id: +i.dataset.id, p: +i.dataset.p || null, s: +i.dataset.s || null }));
        if (!ck.length) return toast('Marque pelo menos um item.', 'warning');
        const R = refs(), tem = (k, id) => ck.some(x => x.k === k && x.id === id);
        const existe = (t, ref) => d.nodes.find(n => n.t === t && n.ref === ref);
        const cria = (t, ref, x, y) => existe(t, ref) || (d.nodes.push({ id: uid(), t, ref, x, y, w: TIPO[t].w, c: { p: 0, s: 1, e: 2 }[t] }), d.nodes[d.nodes.length - 1]);
        const liga = (a, b) => { if (a && b && !d.edges.some(e => e.a === a.id && e.b === b.id)) d.edges.push({ id: uid(), a: a.id, b: b.id }); };
        const X0 = d.nodes.length ? Math.min(...d.nodes.map(n => n.x)) : toWorld(view.getBoundingClientRect().left + 40, 0).x;
        let y = d.nodes.length ? Math.max(...d.nodes.map(n => n.y + ((n.t === 'b' || n.t === 's') && n.h ? n.h : 70))) + 70 : toWorld(0, view.getBoundingClientRect().top + 40).y;
        const LIN = 66;
        (wsProjetos || []).slice().sort(ordCmp).forEach(p => {
            const sess = (p.sessoes || []).slice().sort(ordCmp).filter(s => tem('s', s.id) || (s.etapas || []).some(e => tem('e', e.id)));
            const soltas = (p.soltas || []).filter(e => tem('e', e.id));
            if (!tem('p', p.id) && !sess.length && !soltas.length) return;
            const y0 = y; let pNode = null;
            const nodesS = [];
            sess.forEach(s => {
                const es = (s.etapas || []).slice().sort(ordCmp).filter(e => tem('e', e.id)), comNo = tem('s', s.id);
                const alt = comNo ? SH + Math.max(1, es.length) * (KH + GAP) + 2 * GAP : Math.max(1, es.length) * LIN;
                const sNode = comNo ? cria('s', s.id, X0 + 270, y) : null;
                if (sNode) es.forEach((e, i) => { const k = cria('e', e.id, X0 + 282, y); k.pai = sNode.id; k.o = i; });
                else es.forEach((e, i) => cria('e', e.id, X0 + 520, y + i * LIN));
                nodesS.push(sNode); y += alt;
            });
            soltas.forEach(e => { nodesS.push(cria('e', e.id, X0 + 270, y)); y += LIN; });
            if (tem('p', p.id)) { pNode = cria('p', p.id, X0, y0 + Math.max(0, (y - y0 - LIN) / 2)); nodesS.forEach(n => liga(pNode, n)); }
            y += 34;
        });
        fecharModal(); salvar(); render(); ajustar();
    }

    // ─── Bloco → Projeto ──────────────────────────────────
    function modalBloco() {
        const b = selNode(); if (!b || b.t !== 'b') return toast('Selecione um bloco.', 'warning');
        const it = dentro(b), na = it.filter(x => x.t === 's').length, ne = it.filter(x => x.t === 'e').length;
        abrirModal('💾 Salvar bloco como projeto', `
            <div class="fg"><label class="fl">Nome do projeto</label><input id="fl-pn" class="fi" value="${escH(b.txt || '')}"/></div>
            <div class="fg"><label class="fl">Descrição</label><textarea id="fl-pd" class="fta"></textarea></div>
            <p class="fhint">Serão criadas ${na} atividade(s) e ${ne} etapa(s) com o que está dentro do bloco (copiando nome, descrição, prazo e prioridade). Etapas encaixadas (ou ligadas por seta) a uma atividade entram nela; as demais ${FD_FEAT.orf ? 'viram etapas soltas' : 'vão para uma atividade "Geral"'}. Notas e nós de projeto não entram. Você será o responsável por tudo.</p>`,
            [{ label: 'Criar projeto', cls: 'btn-p', action: `Flow.blocoProjeto('${b.id}')` }, { label: 'Cancelar', cls: 'btn-s', action: 'fecharModal()' }]);
    }
    async function blocoProjeto(id) {
        if (!currentUserCanEdit) return toast('Você não tem permissão para criar projetos.', 'warning');
        const b = nodeById(id), nome = $('fl-pn')?.value.trim(), desc = $('fl-pd')?.value.trim() || '';
        if (!b) return; if (!nome) return toast('Informe o nome do projeto.', 'warning');
        const itens = dentro(b).filter(x => x.t === 's' || x.t === 'e');
        if (!itens.length) return toast('O bloco não tem atividades nem etapas dentro.', 'warning');
        const R = refs(), ord = (a, c) => a.y - c.y || a.x - c.x;
        const dados = n => {
            const o = n.ref ? (n.t === 's' ? R.S.get(n.ref)?.s : R.E.get(n.ref)?.e) : null;
            return { nome: o?.nome || n.txt || 'Sem título', descricao: o?.descricao || '', prazo: o?.prazo || null, prioridade: o?.prioridade ?? 0 };
        };
        const { data: proj, error } = await sb.from('projetos').insert({ nome, descricao: desc, workspace_id: currentWorkspace.id }).select().single();
        if (error) return toast('Erro ao criar o projeto: ' + error.message, 'error');
        await sb.from('projeto_usuarios').insert({ projeto_id: proj.id, usuario_id: currentUser.id });

        let falha = null; const sessDe = new Map();   
        const criaSessoes = async lista => {
            const r = await sb.from('sessoes').insert(lista.map((x, i) => ({ projeto_id: proj.id, nome: x.nome, descricao: x.descricao, ...(FD_FEAT.ordem ? { ordem: i + 1 } : {}) }))).select('id');
            if (r.error) { falha = r.error; return []; }
            await sb.from('sessao_usuarios').insert(r.data.map(s => ({ sessao_id: s.id, usuario_id: currentUser.id })));
            return r.data;
        };
        const ats = itens.filter(x => x.t === 's').sort(ord);
        if (ats.length) (await criaSessoes(ats.map(dados))).forEach((s, i) => sessDe.set(ats[i].id, s.id));

        const ets = itens.filter(x => x.t === 'e').sort(ord);
        const sessaoDaEtapa = n => {
            if (n.pai && sessDe.has(n.pai)) return sessDe.get(n.pai);
            const g = D().edges.find(e => (e.a === n.id && sessDe.has(e.b)) || (e.b === n.id && sessDe.has(e.a)));
            return g ? sessDe.get(g.a === n.id ? g.b : g.a) : null;
        };
        let geral = null; const cont = {};
        const linhas = [];
        for (const n of ets) {
            let sid = sessaoDaEtapa(n);
            if (!sid && !FD_FEAT.orf) { if (!geral) geral = (await criaSessoes([{ nome: 'Geral', descricao: '' }]))[0]?.id || null; sid = geral; }
            const k = sid || 'topo'; cont[k] = (cont[k] ?? (sid ? 0 : sessDe.size + (geral ? 1 : 0))) + 1;
            const x = dados(n);
            linhas.push({ nome: x.nome, descricao: x.descricao, status: 'Não iniciado', responsavel_id: currentUser.id, prioridade: x.prioridade, prazo: x.prazo, sessao_id: sid,
                ...(FD_FEAT.orf ? { projeto_id: proj.id } : {}), ...(FD_FEAT.ordem ? { ordem: cont[k] } : {}) });
        }
        if (linhas.length) {
            const r = await sb.from('etapas').insert(linhas).select('id');
            if (r.error) falha = r.error;
            else if (FD_FEAT.multi) await sb.from('etapa_responsaveis').insert(r.data.map(e => ({ etapa_id: e.id, usuario_id: currentUser.id })));
        }
        b.proj = proj.id; salvar();
        await addLog('create', 'projeto', null, { nome, origem: 'Flow' });
        fecharModal();
        try { await renderizarProjetos(); popularSelectProjetos(); } catch (e) { /* a tela de projetos atualiza ao abrir */ }
        render();
        if (falha) toast('Projeto criado, mas parte do conteúdo falhou: ' + falha.message, 'warning'); else toast(`Projeto "${nome}" criado a partir do bloco! 🎉`);
    }

    window.Flow = { abrir, trocar, recarregar, novo, filho, cor, remover, zoom, ajustar, modalMapa, salvarMapa, excluirMapa, modalImportar, marcar, importar, modalBloco, blocoProjeto };
})();