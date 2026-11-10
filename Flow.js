(function () {
    'use strict';

    const COR = ['#4f46e5', '#7c3aed', '#059669', '#d97706', '#e11d48', '#0891b2', '#475569'];
    const TIPO = { p: { ic: '📁', w: 220 }, s: { ic: '🗂', w: 250 }, e: { ic: '', w: 200 }, n: { ic: '', w: 190 }, b: { ic: '', w: 360 }, a: { ic: '📎', w: 200 } };
    const ST_COR = { 'Não iniciado': '#94a3b8', 'Em andamento': '#eab308', 'Concluído': '#10b981' };
    const SVGNS = 'http://www.w3.org/2000/svg';
    const SH = 54, KH = 40, GAP = 6, ANX = 26;

    let root = null, view = null, world = null, layB = null, layN = null, svg = null;
    let mapas = [], atual = null, sel = null, editing = false, saveT = null, semTabela = false;
    let grupo = new Set(), espaco = false, modoMao = false;
    let alvoProjeto = null, colProj = false;
    let pn = { aberto: false, foco: null, aba: 'det', projAnx: null };
    let dragAtivo = false, Rult = null;
    const recem = new Set(), arqCache = {}, carregandoArq = new Set();

    const uid = () => Math.random().toString(36).slice(2, 9);
    const D = () => atual && atual.dados;
    const $ = id => document.getElementById(id);
    const nodeById = id => D().nodes.find(n => n.id === id);
    const elOf = id => layB.querySelector(`[data-id="${id}"]`) || layN.querySelector(`[data-id="${id}"]`);
    const selNode = () => (sel && sel.k === 'n' ? nodeById(sel.id) : null);
    const idsSel = () => (sel && sel.k === 'm' ? [...grupo] : sel && sel.k === 'n' ? [sel.id] : []);
    function setSelIds(ids) {
        const l = [...ids].filter(id => nodeById(id));
        grupo = new Set(l.length > 1 ? l : []);
        sel = !l.length ? null : l.length === 1 ? { k: 'n', id: l[0] } : { k: 'm' };
        markSel();
    }
    const dono = () => atual && atual.criado_por === currentUser.id;

    function injetaCss() {
        if ($('fl-css')) return;
        const st = document.createElement('style'); st.id = 'fl-css';
        st.textContent = `
        .fl-top{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px}
        .fl-top .fsel{width:auto;min-width:200px}
        .fl-bar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:0 0 8px}
        .fl-bar .sp{flex:1}
        .fl-bar .zl{min-width:46px;text-align:center;font:600 .78rem var(--font);color:var(--muted)}
        .fl-st{font:600 .75rem var(--font);color:var(--muted);margin-left:6px}
        .fl-wrap{display:flex;height:calc(100vh - 150px);min-height:460px;border:1px solid var(--border);border-radius:14px;overflow:hidden;background:var(--surface);user-select:none;-webkit-user-select:none}
        body.fl-drag,body.fl-drag *{user-select:none!important;-webkit-user-select:none!important}
        .fl-view{position:relative;flex:1;min-width:0;height:100%;overflow:hidden;touch-action:none;cursor:default;
            background-image:radial-gradient(#cbd5e1 1px,transparent 1px);background-size:24px 24px;background-color:#f8fafc}
        .fl-view.mao{cursor:grab}.fl-view.mao:active{cursor:grabbing}
        .fl-mq{position:absolute;z-index:20;border:1px solid #3b82f6;background:rgba(59,130,246,.18);pointer-events:none}
        .fl-pill{pointer-events:all;cursor:pointer}
        .fl-pill rect{fill:#fff;stroke:#4f46e5;stroke-width:1.5}
        .fl-pill:hover rect{fill:#eef2ff}
        .fl-pill text{font:600 11px var(--font);fill:#4f46e5;pointer-events:none}
        .fl-world{position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0}
        .fl-lay{position:absolute;left:0;top:0;width:0;height:0}
        .fl-svg{position:absolute;left:0;top:0;width:1px;height:1px;overflow:visible;pointer-events:none}
        .fl-e{fill:none;stroke:#94a3b8;stroke-width:2}
        .fl-e.sel{stroke:#4f46e5;stroke-width:3}
        .fl-eh{fill:none;stroke:transparent;stroke-width:14;pointer-events:stroke;cursor:pointer}
        .fl-e.dep{stroke:#d97706;stroke-width:2.6}
        .fl-e.sel{stroke:#4f46e5;stroke-width:3}
        .fl-lkc{fill:#fffbeb;stroke:#d97706;stroke-width:1.5}
        .fl-lk{font-size:12px;pointer-events:none}
        .fl-n.fl-cond{border-color:#d97706;box-shadow:0 0 0 3px rgba(217,119,6,.3),0 2px 8px rgba(217,119,6,.2)}
        .fl-n.fl-cond.ok{border-color:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.28)}
        .fl-n.fl-cond.sel{box-shadow:0 0 0 3px #4f46e5}
        .fl-bdg{position:absolute;right:10px;top:-10px;z-index:3;padding:1px 8px;border-radius:20px;background:#fffbeb;border:1px solid #fcd34d;color:#b45309;font:700 .64rem var(--font);font-style:normal;white-space:nowrap;pointer-events:none}
        .fl-bdg.ok{background:#ecfdf5;border-color:#6ee7b7;color:#047857}
        .fl-bdg.lk{top:auto;bottom:-10px}
        .fl-panel{width:340px;flex:none;box-sizing:border-box;border-left:1px solid var(--border);overflow:auto;padding:14px 16px;background:var(--surface);font-size:.85rem;user-select:text;-webkit-user-select:text}
        .fp-crumb{font:600 .74rem var(--font);color:var(--muted);margin-bottom:4px}.fp-crumb a{cursor:pointer;color:var(--acc)}
        .fp-t{font:700 1rem var(--font);margin:2px 0 6px;overflow-wrap:anywhere}
        .fp-d{color:var(--muted);margin:4px 0 8px;white-space:pre-wrap}
        .fp-bar{height:6px;background:var(--border);border-radius:4px;overflow:hidden;margin:6px 0 3px}.fp-bar i{display:block;height:100%;background:#10b981}
        .fp-acts{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}
        .fp-sec{font:700 .72rem var(--font);text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:14px 0 6px}
        .fp-row{display:flex;align-items:center;gap:8px;padding:7px 8px;border:1px solid var(--border);border-radius:8px;margin-bottom:5px;cursor:pointer}
        .fp-row:hover{background:var(--acc-lt)}.fp-row .n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .fp-kv{display:grid;grid-template-columns:92px 1fr;gap:7px 10px;margin:8px 0;align-items:center}.fp-kv b{font-weight:600;color:var(--muted);font-size:.76rem}
        .fp-vazio{color:var(--muted);padding:10px 0}
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
        .fl-hint{user-select:none;-webkit-user-select:none;position:absolute;left:12px;bottom:10px;font:500 .72rem var(--font);color:var(--muted);background:rgba(255,255,255,.85);padding:3px 9px;border-radius:8px;pointer-events:none}
        .fl-n.fl-n-s{padding:0;background:color-mix(in srgb,var(--c) 6%,var(--surface))}
        .fl-hd{height:${SH}px;box-sizing:border-box;padding:8px 12px 0 10px;overflow:hidden}
        .fl-hd .fl-t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .fl-slot{position:absolute;left:12px;right:12px;height:${KH}px;box-sizing:border-box;border:2px dashed color-mix(in srgb,var(--c) 40%,transparent);border-radius:8px;display:flex;align-items:center;justify-content:center;font:500 .74rem var(--font);color:var(--muted);pointer-events:none}
        .fl-kid{box-sizing:border-box;padding:0 12px 0 8px;border-left-width:4px;display:block}
        .fl-kid .fl-row{height:${KH - 3}px;align-items:center}
        .fl-kid .fl-t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .fl-kid .fl-s{display:none}
        .fl-n.snap{box-shadow:0 0 0 3px #22c55e,0 2px 10px rgba(34,197,94,.3)}
        .fl-snapln{position:absolute;height:5px;border-radius:3px;background:#22c55e;pointer-events:none;z-index:9}
        .fl-n.fl-n-e{background:color-mix(in srgb,var(--c) 11%,var(--surface))}
        .fl-n.fl-n-e.fl-cond{border-color:var(--c)}
        .fp-st{position:relative;flex:none;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:700 .7rem var(--font);color:#fff;cursor:pointer;background:#94a3b8}
        .fp-st.s1{background:#eab308}.fp-st.s2{background:#10b981}
        .fp-st select{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
        .fl-n.fl-n-a{background:#f0f9ff;border-color:#0891b2}
        .fl-th{display:block;width:100%;height:96px;object-fit:cover;border-radius:6px;margin-top:6px;background:#e2e8f0;pointer-events:none}
        .fl-clip{position:absolute;left:10px;top:-10px;z-index:4;padding:1px 8px;border-radius:20px;background:#eff6ff;border:1px solid #93c5fd;color:#1d4ed8;font:700 .64rem var(--font);cursor:pointer}
        .fl-n.alvo-anx{outline:3px dashed #3b82f6;outline-offset:2px}
        .fp-tabs{display:flex;gap:4px;margin-bottom:12px;background:var(--border);padding:3px;border-radius:10px}
        .fp-tabs button{flex:1;border:none;background:none;padding:5px 8px;border-radius:8px;font:600 .78rem var(--font);cursor:pointer;color:var(--muted)}
        .fp-tabs button.on{background:var(--surface);color:var(--text);box-shadow:0 1px 3px rgba(15,23,42,.12)}
        .fp-file{display:flex;align-items:center;gap:8px;padding:6px 8px;border:1px solid var(--border);border-radius:8px;margin-bottom:5px;cursor:grab}
        .fp-file:hover{background:var(--acc-lt)}.fp-file .n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .fp-th{width:34px;height:34px;object-fit:cover;border-radius:6px;flex:none;background:#e2e8f0}
        .fp-ic{width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex:none}
        .fl-tg{border:none;background:none;padding:0 4px 0 0;font:700 .8rem var(--font);color:var(--c);cursor:pointer;line-height:1}
        .fl-ax{display:flex;gap:4px;padding:0 0 0 17px;height:${ANX}px;align-items:flex-start;overflow:hidden}
        .fl-n:not(.fl-kid) .fl-ax{height:auto;padding:6px 0 0}
        .fl-chip{display:inline-flex;align-items:center;gap:4px;max-width:140px;padding:1px 7px;border-radius:20px;border:1px solid #93c5fd;background:#eff6ff;color:#1d4ed8;font:600 .64rem var(--font);cursor:pointer}
        .fl-chip *{pointer-events:none}
        .fl-chip .n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .fl-n:not(.fl-n-b) .fl-rs{opacity:0;width:12px;height:12px;right:3px;bottom:3px;border-width:0 3px 3px 0;transition:opacity .1s}
        .fl-n:not(.fl-n-b):hover .fl-rs,.fl-n.sel .fl-rs{opacity:1}
        .fl-panel{padding:12px 14px}
        .fl-panel .fp-row{align-items:flex-start;gap:8px;padding:6px 8px;margin-bottom:4px;font-size:.8rem;line-height:1.3}
        .fl-panel .fp-row .n{white-space:normal;overflow:visible;text-overflow:clip;overflow-wrap:anywhere}
        .fl-panel .fp-st{width:16px;height:16px;margin-top:1px;font-size:.56rem;background:#fff;border:2px solid #94a3b8}
        .fl-panel .fp-st.s1{background:#eab308;border-color:#eab308}
        .fl-panel .fp-st.s2{background:#10b981;border-color:#10b981}
        .fl-panel .fp-sec{margin:12px 0 6px}
        .fl-panel .fp-t{font-size:.95rem}
        .fl-panel .fp-acts{margin:8px 0}
        .fl-add{position:absolute;right:10px;top:9px;border:1px solid var(--c);background:var(--surface);color:var(--c);border-radius:20px;padding:1px 9px;font:700 .68rem var(--font);cursor:pointer}
        .fl-add:hover{background:var(--c);color:#fff}
        .fl-hd .fl-row{padding-right:74px}
        .fl-imp{max-height:52vh;overflow:auto;border:1px solid var(--border);border-radius:10px;padding:6px 10px}
        .fl-imp summary{cursor:pointer;padding:5px 0;font-weight:700}
        .fl-i1{margin-left:22px;padding:2px 0}.fl-i2{margin-left:24px;font-size:.84rem}
        .fl-imp label{cursor:pointer}`;
        document.head.appendChild(st);
    }

    function monta() {
        root = $('tab-flow');
        if (root.dataset.pronto) return;
        root.dataset.pronto = '1';
        root.innerHTML = `
        <div class="fl-top">
                <select id="fl-sel" class="fsel" onchange="Flow.trocar(this.value)" aria-label="Mapa"></select>
                <button class="btn btn-p btn-sm" onclick="Flow.modalMapa()">+ Novo mapa</button>
                <button class="btn btn-s btn-sm" id="fl-cfg" onclick="Flow.modalMapa(true)" title="Nome, visibilidade e exclusão do mapa">⚙️</button>
                <button class="btn btn-s btn-sm" onclick="Flow.recarregar()" title="Recarregar (útil em mapas compartilhados)">↻</button>
            </div>
        <div class="fl-bar" id="fl-bar">
            <button class="btn btn-s btn-sm" onclick="Flow.novo('b')">▭ Bloco</button>
            <button class="btn btn-s btn-sm" onclick="Flow.novo('s')">🗂 Atividade</button>
            <button class="btn btn-s btn-sm" onclick="Flow.novo('e')">✅ Etapa</button>
            <button class="btn btn-s btn-sm" onclick="Flow.novo('n')">🗒 Nota</button>
            <button class="btn btn-s btn-sm" id="fl-imp" onclick="Flow.modalImportar()">📥 Do projeto</button>
            <button class="btn btn-s btn-sm" data-sel="1" onclick="Flow.cor()" title="Trocar a cor">🎨</button>
            <button class="btn btn-s btn-sm" id="fl-del" data-sel="1" onclick="Flow.remover()" title="Remove do mapa (não apaga nada do projeto)">🗑</button>
            <button class="btn btn-s btn-sm" id="fl-edit" onclick="Flow.editarReal()" title="Editar o projeto, a atividade ou a etapa real">✏️ Editar</button>
            <button class="btn btn-s btn-sm" id="fl-pbtn" onclick="Flow.painel()" title="Ver os detalhes do item selecionado">👁 Detalhes</button>
            <button class="btn btn-p btn-sm" id="fl-bp" onclick="Flow.modalBloco()" title="Cria um projeto a partir do que está dentro do bloco selecionado">💾 Bloco → Projeto</button>
            <span class="sp"></span>
            <button class="btn btn-s btn-sm" id="fl-mao" onclick="Flow.mao()" title="Mover a tela arrastando (ou segure Espaço, ou use o botão do meio do mouse)">✋ Mover</button>
            <button class="btn btn-s btn-sm" onclick="Flow.zoom(-1)">−</button><span class="zl" id="fl-zl">100%</span>
            <button class="btn btn-s btn-sm" onclick="Flow.zoom(1)">+</button>
            <button class="btn btn-s btn-sm" onclick="Flow.ajustar()">Ajustar</button>
            <span class="fl-st" id="fl-st"></span>
        </div>
        <div class="fl-wrap"><div class="fl-view" id="fl-view">
            <div class="fl-world" id="fl-world"><div class="fl-lay" id="fl-lb"></div><svg class="fl-svg" id="fl-svg"></svg><div class="fl-lay" id="fl-ln"></div></div>
            <div class="fl-hint">Arraste no fundo para selecionar (Ctrl/Shift soma) · Espaço ou botão do meio: mover a tela · roda: zoom · bolinha liga nós (seta = fluxo; clique nela para virar dependência) · solte etapas numa atividade para encaixar</div>
        </div><div class="fl-panel hidden" id="fl-panel"></div></div>`;
        view = $('fl-view'); world = $('fl-world'); layB = $('fl-lb'); layN = $('fl-ln'); svg = $('fl-svg');
        view.addEventListener('pointerdown', onDown);
        view.addEventListener('mousedown', ev => { if (!ev.target.closest('[contenteditable=true]')) ev.preventDefault(); });
        view.addEventListener('dblclick', onDbl);
        view.addEventListener('click', onClick);
        view.addEventListener('wheel', ev => {
            if (!D()) return; ev.preventDefault();
            const r = view.getBoundingClientRect();
            zoomEm(ev.clientX - r.left, ev.clientY - r.top, D().view.z * (ev.deltaY < 0 ? 1.1 : 1 / 1.1));
        }, { passive: false });
        const temArquivo = ev => { const t = [...((ev.dataTransfer && ev.dataTransfer.types) || [])]; return t.includes('text/fd-arquivo') || t.includes('Files'); };
        const marcaAlvo = el => {
            view.querySelectorAll('.alvo-anx').forEach(x => x.classList.remove('alvo-anx'));
            if (el && !el.classList.contains('fl-n-b') && !el.classList.contains('fl-n-a')) el.classList.add('alvo-anx');
        };
        view.addEventListener('dragover', ev => { if (!D() || !temArquivo(ev)) return; ev.preventDefault(); ev.dataTransfer.dropEffect = 'copy'; marcaAlvo(ev.target.closest('.fl-n')); });
        view.addEventListener('dragleave', ev => { if (!ev.relatedTarget || !view.contains(ev.relatedTarget)) marcaAlvo(null); });
        view.addEventListener('drop', ev => { if (!D() || !temArquivo(ev)) return; ev.preventDefault(); marcaAlvo(null); soltarArquivo(ev); });
        $('fl-panel').addEventListener('dragstart', ev => {
            const r = ev.target.closest('[data-arq]'); if (!r) return;
            ev.dataTransfer.setData('text/fd-arquivo', r.dataset.arq); ev.dataTransfer.effectAllowed = 'copy';
        });
    }

    const dedicado = () => !!(atual && atual.projeto_id);
    function irProjeto(pId) { alvoProjeto = pId; switchTab('flow'); }
    async function listar() {
        const cols = 'id, nome, visibilidade, criado_por, updated_at';
        let r = await sb.from('flows').select(cols + ', projeto_id').eq('workspace_id', currentWorkspace.id).order('updated_at', { ascending: false });
        colProj = !r.error;
        if (r.error) r = await sb.from('flows').select(cols).eq('workspace_id', currentWorkspace.id).order('updated_at', { ascending: false });
        semTabela = !!r.error;
        mapas = semTabela ? [] : (r.data || []).filter(m => m.visibilidade === 'compartilhado' || m.criado_por === currentUser.id);
    }
    async function abrir() {
        injetaCss(); monta();
        if (alvoProjeto != null) { const id = alvoProjeto; alvoProjeto = null; return abrirProjeto(id); }
        if (saveT) await flush();
        if (!(wsProjetos || []).length) { try { await renderizarProjetos(); } catch (e) { } }
        await listar();
        if (semTabela) { atual = null; return telaVazia('⚠️', 'Tabela dos mapas não encontrada', 'Rode o SQL migracao_flow_condicoes.sql no Supabase e recarregue a página.'); }
        let id = null;
        try { id = +localStorage.getItem('fd-flow-' + currentWorkspace.id) || null; } catch (e) { }
        if (!mapas.some(m => m.id === id)) id = mapas[0]?.id || null;
        preencheSelect(id);
        if (id) await carregar(id); else { atual = null; telaVazia('🧠', 'Nenhum mapa ainda', 'Crie um mapa para organizar projetos, atividades e etapas visualmente.', true); }
    }
    async function abrirProjeto(pId) {
        injetaCss(); monta();
        if (saveT) await flush();
        if (!(wsProjetos || []).length) { try { await renderizarProjetos(); } catch (e) { } }
        const p = (wsProjetos || []).find(x => x.id === pId);
        if (!p) { atual = null; return telaVazia('⚠️', 'Projeto não encontrado', 'Ele pode ter sido excluído.'); }
        await listar();
        if (semTabela) { atual = null; return telaVazia('⚠️', 'Tabela dos mapas não encontrada', 'Rode o SQL migracao_flow_condicoes.sql no Supabase e recarregue a página.'); }
        if (!colProj) { atual = null; return telaVazia('⚠️', 'Falta atualizar o banco', 'Rode o SQL migracao_flow_projeto.sql no Supabase e recarregue a página.'); }
        let m = mapas.find(x => x.projeto_id === pId);
        if (!m) {
            const dados = { v: 1, view: { x: 60, y: 60, z: 1 }, nodes: [], edges: [] };
            sincProjeto(dados, p);
            const r = await sb.from('flows').insert({ workspace_id: currentWorkspace.id, nome: p.nome, visibilidade: 'compartilhado', projeto_id: pId, dados, criado_por: currentUser.id })
                .select('id, nome, visibilidade, criado_por, updated_at, projeto_id').single();
            if (r.error) { atual = null; return telaVazia('⚠️', 'Não consegui criar o Flow do projeto', escH(r.error.message)); }
            m = r.data; mapas.unshift(m);
        }
        preencheSelect(m.id);
        await carregar(m.id);
    }
    function preencheSelect(id) {
        const op = m => `<option value="${m.id}" ${m.id === id ? 'selected' : ''}>${m.projeto_id ? '📁' : m.visibilidade === 'compartilhado' ? '👥' : '🔒'} ${escH(m.nome)}</option>`;
        const livres = mapas.filter(m => !m.projeto_id), projs = mapas.filter(m => m.projeto_id);
        $('fl-sel').innerHTML = (livres.length ? `<optgroup label="Mapas">${livres.map(op).join('')}</optgroup>` : '') + (projs.length ? `<optgroup label="Flows de projetos">${projs.map(op).join('')}</optgroup>` : '');
        $('fl-sel').classList.toggle('hidden', !mapas.length);
        $('fl-cfg').classList.toggle('hidden', !mapas.length);
    }
    function telaVazia(ic, tit, txt, criar) {
        $('fl-bar').classList.add('hidden'); world.classList.add('hidden'); $('fl-panel').classList.add('hidden');
        view.querySelector('.fl-vazio')?.remove();
        view.insertAdjacentHTML('beforeend', `<div class="fl-vazio"><div class="ei">${ic}</div><h3>${tit}</h3><p>${txt}</p>${criar ? '<button class="btn btn-p" onclick="Flow.modalMapa()">+ Criar mapa</button>' : ''}</div>`);
    }
    async function carregar(id) {
        const r = await sb.from('flows').select('*').eq('id', id).single();
        if (r.error || !r.data) { toast('Não consegui abrir o mapa.', 'error'); return; }
        const m = r.data, d = m.dados || {};
        m.dados = { v: 1, view: d.view || { x: 60, y: 60, z: 1 }, nodes: d.nodes || [], edges: d.edges || [] };
        atual = m; sel = null;
        try { localStorage.setItem('fd-flow-' + currentWorkspace.id, String(id)); } catch (e) { }
        view.querySelector('.fl-vazio')?.remove();
        $('fl-bar').classList.remove('hidden'); world.classList.remove('hidden');
        setStatus('');
        const ded = !!m.projeto_id; let primeira = false;
        if (ded) {
            const p = (wsProjetos || []).find(x => x.id === m.projeto_id);
            if (!p) { atual = null; return telaVazia('⚠️', 'Projeto não encontrado', 'Ele pode ter sido excluído.'); }
            primeira = !m.dados.nodes.length;
            if (sincProjeto(m.dados, p)) salvar();
        }
        $('fl-cfg').classList.toggle('hidden', ded);
        ['fl-imp', 'fl-bp'].forEach(b => $(b) && $(b).classList.toggle('hidden', ded));
        $('fl-del').title = ded ? 'Exclui o item selecionado do projeto (pede confirmação)' : 'Remove do mapa (não apaga nada do projeto)';
        render(); applyView(); desenhaPainel();
        if (primeira) ajustar();
        carregarArqsMapa();
    }
    async function trocar(id) { if (saveT) await flush(); await carregar(+id); }
    async function recarregar() { if (saveT) await flush(); await abrir(); }

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
        if (n.t === 'a') {
            const f = anxReg.get(n.ref);
            if (!f || !anxVisivel(f)) return { txt: n.txt || '(arquivo indisponível)', gone: true, ic: '📎' };
            return { txt: f.nome, sub: typeof fmtBytes === 'function' ? fmtBytes(f.tamanho) : '', ic: fileIcon(f.nome), thumb: isImage(f.nome) ? anxUrl(f) : '' };
        }
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

    const oculto = n => !!(n.pai && nodeById(n.pai) && nodeById(n.pai).fechada);
    const kidH = (k, R) => KH + (anexosDe(k, R || Rult || refs()).length ? ANX : 0);
    function chipsNo(n, R) {
        const l = anexosDe(n, R); if (!l.length) return '';
        return `<div class="fl-ax">${l.slice(0, 2).map(f => `<button type="button" class="fl-chip" data-act="open" data-arq="${f.id}" title="${escH(f.nome)}"><span>${fileIcon(f.nome)}</span><span class="n">${escH(f.nome)}</span></button>`).join('')}${l.length > 2 ? `<button type="button" class="fl-chip" data-act="clip" title="Ver todos os anexos">+${l.length - 2}</button>` : ''}</div>`;
    }
    function nodeHtml(n, R) {
        const i = info(n, R), eSel = !!sel && ((sel.k === 'n' && sel.id === n.id) || (sel.k === 'm' && grupo.has(n.id)));
        const kid = n.t === 'e' && n.pai;
        const fonte = R.DI && R.DI.fonte.has(n.id);
        const cls = `fl-n fl-n-${n.t}${kid ? ' fl-kid' : ''}${n.t === 's' && n.fechada ? ' fechada' : ''}${fonte ? ' fl-cond' + (nodeOk(n) ? ' ok' : '') : ''}${eSel ? ' sel' : ''}${i.gone ? ' gone' : ''}`;
        const altura = n.t === 'b' || n.t === 's' ? `height:${n.h}px;` : kid ? `height:${kidH(n, R)}px;` : (n.t === 'a' || n.t === 'n') && n.h ? `height:${n.h}px;${n.t === 'a' ? 'display:flex;flex-direction:column;' : 'overflow:hidden;'}` : '';
        const st = `left:${n.x}px;top:${n.y}px;width:${n.w}px;${altura}--c:${n.t === 'e' ? (ST_COR[i.st] || ST_COR['Não iniciado']) : COR[n.c || 0]}`;
        if (n.t === 'b') {
            const pj = n.proj && R.P.get(n.proj);
            return `<div class="${cls}" data-id="${n.id}" style="${st}"><div class="fl-bh"><span class="fl-t">${escH(i.txt)}</span>${pj ? `<button class="fl-pj" data-act="proj" title="Abrir o projeto criado a partir deste bloco">📁 ${escH(pj.nome)}</button>` : ''}</div><i class="fl-rs" data-act="resize"></i></div>`;
        }
        const ic = i.ic ? `<span>${i.ic}</span>` : n.t === 'e' ? `<i class="fl-d" style="background:${ST_COR[i.st] || '#94a3b8'}"></i>` : (TIPO[n.t].ic ? `<span>${TIPO[n.t].ic}</span>` : '');
        const porta = '<i class="fl-port" data-act="port" title="Arraste até outro nó para ligar"></i>';
        const alca = kid ? '' : '<i class="fl-rs" data-act="resize" title="Arraste para redimensionar"></i>';
        if (n.t === 's') {
            const nk = kids(n).length, fechada = !!n.fechada;
            const sub = i.sub ? `<div class="fl-s">${escH(i.sub)}</div>` : fechada ? `<div class="fl-s">${nk} etapa${nk === 1 ? '' : 's'}</div>` : '';
            return `<div class="${cls}" data-id="${n.id}" style="${st}"><div class="fl-hd"><div class="fl-row"><button type="button" class="fl-tg" data-act="toggle" title="${fechada ? 'Expandir' : 'Recolher'}">${fechada ? '▸' : '▾'}</button>${ic}<span class="fl-t" title="${escH(i.txt)}">${escH(i.txt)}</span></div>${sub}<button class="fl-add" data-act="addkid" title="Adicionar etapa a esta atividade">＋ Etapa</button></div>${!nk && !fechada ? `<div class="fl-slot" style="top:${SH}px">Solte etapas aqui</div>` : ''}${alca}${porta}${selos(n, R)}</div>`;
        }
        const thumb = i.thumb ? `<img class="fl-th" src="${escH(i.thumb)}" alt="" draggable="false" ${n.h ? 'style="height:auto;flex:1;min-height:40px" ' : ''}onerror="this.style.display='none'">` : '';
        return `<div class="${cls}" data-id="${n.id}" style="${st}"><div class="fl-row">${ic}<span class="fl-t" title="${escH(i.txt)}">${escH(i.txt)}</span></div>${i.sub ? `<div class="fl-s">${escH(i.sub)}</div>` : ''}${thumb}${chipsNo(n, R)}${alca}${porta}${selos(n, R)}</div>`;
    }
    function selos(n, R) {
        if (!R.DI) return '';
        let h = '';
        if (R.DI.fonte.has(n.id)) { const ok = nodeOk(n); h += `<i class="fl-bdg${ok ? ' ok' : ''}">${ok ? '✓ condição cumprida' : '🔑 condição'}</i>`; }
        const al = R.DI.alvo.get(n.id);
        if (al) h += `<i class="fl-bdg lk${al.pend ? '' : ' ok'}">${al.pend ? `🔒 ${al.pend} pendente${al.pend > 1 ? 's' : ''}` : '🔓 liberada'}</i>`;
        const na = n.t === 's' ? anexosDe(n, R).length : 0;
        if (na) h += `<button class="fl-clip" data-act="clip" title="Ver anexos">📎 ${na}</button>`;
        return h;
    }
    function render(prof = 0) {
        const d = D(); if (!d) return;
        sincEdges();
        const R = refs(); R.DI = depInfo(); Rult = R;
        d.nodes.forEach(k => { if (k.pai && !nodeById(k.pai)) { k.pai = null; k.w = TIPO[k.t].w; } });
        d.nodes.filter(n => n.t === 's').forEach(x => reflow(x, R));
        const livres = d.nodes.filter(n => n.t !== 'b' && !n.pai), presas = d.nodes.filter(n => n.t !== 'b' && n.pai && !oculto(n));
        layB.innerHTML = d.nodes.filter(n => n.t === 'b').sort((a, b) => b.w * b.h - a.w * a.h).map(n => nodeHtml(n, R)).join('');
        layN.innerHTML = livres.concat(presas).map(n => nodeHtml(n, R)).join('');
        if (!dragAtivo && prof < 3 && normalizar()) { salvar(); return render(prof + 1); }
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
        if (!sel || sel.k !== 'm') grupo = new Set();
        view.querySelectorAll('.fl-n').forEach(el => el.classList.toggle('sel', !!sel && ((sel.k === 'n' && sel.id === el.dataset.id) || (sel.k === 'm' && grupo.has(el.dataset.id)))));
        const n = selNode(); if (n && n.ref && n.t !== 'a') pn.foco = { k: n.t, id: n.ref };
        drawEdges(); updToolbar(); if (pn.aberto) desenhaPainel();
    }
    function updToolbar() {
        const n = selNode();
        root.querySelectorAll('[data-sel]').forEach(b => { b.disabled = !sel; b.style.opacity = sel ? 1 : .45; });
        const bp = $('fl-bp'); if (bp) { const on = !!n && n.t === 'b'; bp.disabled = !on; bp.style.opacity = on ? 1 : .45; }
        const ed = $('fl-edit'); if (ed) { const on = !!(n && n.ref && n.t !== 'a') || (pn.aberto && !!pn.foco); ed.disabled = !on; ed.style.opacity = on ? 1 : .45; }
        const mao = $('fl-mao'); if (mao) { mao.classList.toggle('btn-p', modoMao); mao.classList.toggle('btn-s', !modoMao); }
        const pb = $('fl-pbtn'); if (pb) { pb.classList.toggle('btn-p', pn.aberto); pb.classList.toggle('btn-s', !pn.aberto); }
    }

    const condTipo = n => (n.t === 's' ? 'sessao' : n.t === 'e' ? 'etapa' : null);
    const comRef = n => !!(n && n.ref && condTipo(n));
    const todasCond = () => (typeof wsCondicoes !== 'undefined' ? wsCondicoes : []);
    const condReal = (a, b) => (comRef(a) && comRef(b) ? todasCond().find(c => c.alvo_tipo === condTipo(b) && c.alvo_id === b.ref && c.cond_tipo === condTipo(a) && c.cond_id === a.ref) : null);
    const isDep = (e, a, b) => (comRef(a) && comRef(b) ? !!condReal(a, b) : !!e.dep);
    const nodeOk = n => (comRef(n) && typeof condItem === 'function' ? !!condItem(condTipo(n), n.ref)?.ok : false);
    function depInfo() {
        const fonte = new Set(), alvo = new Map();
        D().edges.forEach(e => {
            const a = nodeById(e.a), b = nodeById(e.b); if (!a || !b || !isDep(e, a, b)) return;
            fonte.add(a.id);
            const t = alvo.get(b.id) || { n: 0, pend: 0 }; t.n++; if (!nodeOk(a)) t.pend++; alvo.set(b.id, t);
        });
        return { fonte, alvo };
    }
    function sincEdges() {
        const d = D(), porRef = new Map(); let mudou = false;
        d.nodes.forEach(n => { if (comRef(n)) porRef.set(condTipo(n) + ':' + n.ref, n); });
        todasCond().forEach(c => {
            const a = porRef.get(c.cond_tipo + ':' + c.cond_id), b = porRef.get(c.alvo_tipo + ':' + c.alvo_id);
            if (a && b && !d.edges.some(e => e.a === a.id && e.b === b.id)) { d.edges.push({ id: uid(), a: a.id, b: b.id }); mudou = true; }
        });
        if (mudou) salvar();
    }
    function condInvalida(a, b) {
        const ta = condTipo(a), tb = condTipo(b);
        if (ta === tb && a.ref === b.ref) return 'Um item não pode depender dele mesmo.';
        const E = refs().E, filhaDe = (e, sId) => E.get(e)?.s?.id === sId;
        if ((ta === 'etapa' && tb === 'sessao' && filhaDe(a.ref, b.ref)) || (ta === 'sessao' && tb === 'etapa' && filhaDe(b.ref, a.ref)))
            return 'Uma etapa não pode depender da própria atividade (nem o contrário).';
        if (typeof cdDepende === 'function' && cdDepende({ t: ta, i: a.ref }, { t: tb, i: b.ref })) return 'Isso criaria um ciclo de dependências.';
        return '';
    }
    function refreshProjetos() { try { if (typeof renderProjetosView === 'function') renderProjetosView(); } catch (e) { } }
    async function alternarDep() {
        if (!sel || sel.k !== 'g') return toast('Selecione uma seta para alternar entre fluxo normal e dependência.', 'warning');
        const e = D().edges.find(x => x.id === sel.id), a = e && nodeById(e.a), b = e && nodeById(e.b); if (!a || !b) return;
        if (!condTipo(a) || !condTipo(b)) return toast('Dependência só existe entre atividades e etapas.', 'warning');
        const ligada = isDep(e, a, b);
        if (comRef(a) && comRef(b)) {
            if (!FD_FEAT.cond) return toast('Rode o SQL migracao_flow_condicoes.sql no Supabase para usar condições.', 'warning');
            if (!ligada) {
                const motivo = condInvalida(a, b); if (motivo) return toast(motivo, 'warning');
                const r = await sb.from('condicoes').insert({ workspace_id: currentWorkspace.id, alvo_tipo: condTipo(b), alvo_id: b.ref, cond_tipo: condTipo(a), cond_id: a.ref, criado_por: currentUser.id })
                    .select('id, alvo_tipo, alvo_id, cond_tipo, cond_id').single();
                if (r.error) return toast('Erro: ' + r.error.message, 'error');
                todasCond().push(r.data);
            } else {
                const c = condReal(a, b), r = await sb.from('condicoes').delete().eq('id', c.id);
                if (r.error) return toast('Erro: ' + r.error.message, 'error');
                todasCond().splice(todasCond().indexOf(c), 1);
            }
            refreshProjetos();
        } else e.dep = !ligada;
        salvar(); render(); if (pn.aberto) desenhaPainel();
    }

    const GAPC = 14;
    const ehTopo = n => n.t !== 'b' && !n.pai;
    const topos = () => D().nodes.filter(ehTopo);
    function caixa(n) {
        const el = elOf(n.id);
        return { x: n.x, y: n.y, w: n.w, h: n.t === 's' || n.t === 'b' || ((n.t === 'a' || n.t === 'n') && n.h) ? (n.h || 60) : Math.max(40, el ? el.offsetHeight : 44) };
    }
    const sobrepoe = (a, b) => a.x < b.x + b.w + GAPC && a.x + a.w + GAPC > b.x && a.y < b.y + b.h + GAPC && a.y + a.h + GAPC > b.y;
    function deslizar(rects, obst, dx, dy) {
        const O = obst.map(o => { const b = caixa(o); return { x: b.x - GAPC, y: b.y - GAPC, w: b.w + 2 * GAPC, h: b.h + 2 * GAPC }; });
        let ax = dx, ay = dy;
        rects.forEach(m => O.forEach(o => {
            if (!(m.y < o.y + o.h && m.y + m.h > o.y)) return;
            if (dx > 0 && o.x >= m.x + m.w) ax = Math.min(ax, o.x - (m.x + m.w));
            else if (dx < 0 && o.x + o.w <= m.x) ax = Math.max(ax, o.x + o.w - m.x);
        }));
        rects.forEach(m => O.forEach(o => {
            const mx = m.x + ax;
            if (!(mx < o.x + o.w && mx + m.w > o.x)) return;
            if (dy > 0 && o.y >= m.y + m.h) ay = Math.min(ay, o.y - (m.y + m.h));
            else if (dy < 0 && o.y + o.h <= m.y) ay = Math.max(ay, o.y + o.h - m.y);
        }));
        return { dx: ax, dy: ay };
    }
    function afastar(membros, todos, obst) {
        for (let it = 0; it < 80; it++) {
            let mv = null;
            for (const m of membros) {
                const a = caixa(m);
                for (const o of obst) {
                    const b = caixa(o); if (!sobrepoe(a, b)) continue;
                    const c = [[b.x + b.w + GAPC - a.x, 0], [-(a.x + a.w + GAPC - b.x), 0], [0, b.y + b.h + GAPC - a.y], [0, -(a.y + a.h + GAPC - b.y)]];
                    mv = c.reduce((p, q) => (Math.abs(q[0]) + Math.abs(q[1]) < Math.abs(p[0]) + Math.abs(p[1]) ? q : p)); break;
                }
                if (mv) break;
            }
            if (!mv) return it > 0;
            todos.forEach(t => { t.x = Math.round(t.x + mv[0]); t.y = Math.round(t.y + mv[1]); });
        }
        return true;
    }
    function normalizar() {
        const fixos = []; let mudou = false;
        topos().sort((a, b) => (recem.has(a.id) - recem.has(b.id)) || a.y - b.y || a.x - b.x).forEach(n => {
            for (let it = 0; it < 80; it++) {
                const a = caixa(n), o = fixos.find(f => sobrepoe(a, caixa(f)));
                if (!o) break;
                const b = caixa(o), baixo = b.y + b.h + GAPC - a.y, dir = b.x + b.w + GAPC - a.x;
                if (baixo <= dir) n.y = Math.round(n.y + baixo); else n.x = Math.round(n.x + dir);
                mudou = true;
            }
            fixos.push(n);
        });
        recem.clear();
        return mudou;
    }
    const kids = s => D().nodes.filter(n => n.pai === s.id).sort((a, b) => (a.o ?? 1e9) - (b.o ?? 1e9) || a.y - b.y);
    function reflow(s, R) {
        R = R || Rult || refs();
        const ks = kids(s); let y = s.y + SH, tot = 0;
        ks.forEach((k, i) => { const h = kidH(k, R); k.o = i; k.x = s.x + 12; k.y = y; k.w = s.w - 24; y += h + GAP; tot += h + GAP; });
        s.h = s.fechada ? SH : SH + (ks.length ? tot : KH + GAP) + GAP;
    }
    function desprende(n) {
        const pai = nodeById(n.pai); n.pai = null; n.w = TIPO[n.t].w;
        if (pai) reflow(pai);
        render();
    }
    function alvoSnap(drag, p) {
        const alvos = D().nodes.filter(n => n.t === 's' && !n.fechada && n.id !== drag.id && p.x >= n.x && p.x <= n.x + n.w && p.y >= n.y && p.y <= n.y + (n.h || 60));
        const a = alvos[alvos.length - 1] || null;
        return a ? { a, exc: drag.id, idx: kids(a).filter(k => k.id !== drag.id && k.y + kidH(k) / 2 < p.y).length } : null;
    }
    function mostraSnap(al) {
        view.querySelectorAll('.fl-n.snap').forEach(el => el.classList.remove('snap'));
        let ln = layN.querySelector('.fl-snapln');
        if (!al) { if (ln) ln.remove(); return; }
        elOf(al.a.id)?.classList.add('snap');
        if (!ln) { ln = document.createElement('div'); ln.className = 'fl-snapln'; layN.appendChild(ln); }
        let yy = al.a.y + SH;
        kids(al.a).filter(k => k.id !== al.exc).slice(0, al.idx).forEach(k => { yy += kidH(k) + GAP; });
        ln.style.left = (al.a.x + 12) + 'px'; ln.style.width = (al.a.w - 24) + 'px';
        ln.style.top = (yy - GAP / 2 - 2) + 'px';
    }
    function rectOf(n) { const el = elOf(n.id); return { x: n.x, y: n.y, w: n.w, h: (n.t === 'b' || n.t === 's' || n.t === 'a' || n.t === 'n') && n.h ? n.h : (el ? el.offsetHeight : 44) }; }
    function bez(x1, y1, x2, y2, h) {
        const d = Math.max(40, (h ? Math.abs(x2 - x1) : Math.abs(y2 - y1)) / 2), s = (h ? Math.sign(x2 - x1) : Math.sign(y2 - y1)) || 1;
        return h ? `M${x1},${y1} C${x1 + d * s},${y1} ${x2 - d * s},${y2} ${x2},${y2}` : `M${x1},${y1} C${x1},${y1 + d * s} ${x2},${y2 - d * s} ${x2},${y2}`;
    }
    function ligar(a, b) {
        const A = rectOf(a), B = rectOf(b), ay = A.y + A.h / 2, by = B.y + B.h / 2; let x1, y1, x2, y2, h;
        if (B.x >= A.x + A.w - 10) { x1 = A.x + A.w; y1 = ay; x2 = B.x; y2 = by; h = true; }
        else if (B.x + B.w <= A.x + 10) { x1 = A.x; y1 = ay; x2 = B.x + B.w; y2 = by; h = true; }
        else if (B.y > A.y) { x1 = A.x + A.w / 2; y1 = A.y + A.h; x2 = B.x + B.w / 2; y2 = B.y; h = false; }
        else { x1 = A.x + A.w / 2; y1 = A.y; x2 = B.x + B.w / 2; y2 = B.y + B.h; h = false; }
        return { d: bez(x1, y1, x2, y2, h), mx: (x1 + x2) / 2, my: (y1 + y2) / 2 };
    }
    function drawEdges() {
        const d = D(); if (!d) return;
        const mk = (id, c) => `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${c}"/></marker>`;
        let h = `<defs>${mk('fl-ar', '#94a3b8')}${mk('fl-ar2', '#d97706')}${mk('fl-ar3', '#4f46e5')}</defs>`;
        const byId = new Map(d.nodes.map(n => [n.id, n]));
        d.edges.forEach(e => {
            const a0 = byId.get(e.a), b0 = byId.get(e.b); if (!a0 || !b0) return;
            const vis = x => (oculto(x) ? byId.get(x.pai) : x), a = vis(a0), b = vis(b0); if (a === b) return;
            const L = ligar(a, b), dep = isDep(e, a0, b0), s = sel && sel.k === 'g' && sel.id === e.id;
            h += `<path d="${L.d}" class="fl-e${dep ? ' dep' : ''}${s ? ' sel' : ''}" marker-end="url(#${s ? 'fl-ar3' : dep ? 'fl-ar2' : 'fl-ar'})"/><path d="${L.d}" class="fl-eh" data-edge="${e.id}"/>`;
            if (s) h += `<g class="fl-pill" data-pill="1" transform="translate(${L.mx},${L.my - 26})"><rect x="-72" y="-11" width="144" height="22" rx="11"/><text text-anchor="middle" dominant-baseline="central">${dep ? '↔ virar fluxo normal' : '🔒 virar dependência'}</text></g>`;
            if (dep) h += `<circle cx="${L.mx}" cy="${L.my}" r="11" class="fl-lkc"/><text x="${L.mx}" y="${L.my}" class="fl-lk" text-anchor="middle" dominant-baseline="central">🔒</text>`;
        });
        svg.innerHTML = h;
    }

    const nomesDe = ids => ids.map(id => (typeof wsMembers !== 'undefined' ? wsMembers : []).find(u => u.id === id)?.nome).filter(Boolean);
    const noMapa = (k, id) => !!D() && D().nodes.some(n => n.t === k && n.ref === id);
    const btnP = (rot, fn, cls) => `<button class="btn ${cls || 'btn-s'} btn-sm" onclick="${fn}">${rot}</button>`;
    const barraP = (done, total) => { const pct = total ? Math.round(done * 100 / total) : 0; return `<div class="fp-bar"><i style="width:${pct}%"></i></div><small class="muted">${pct}% · ${done}/${total} etapas</small>`; };
    const linhaS = s => { const et = s.etapas || []; return `<div class="fp-row" onclick="Flow.foco('s',${s.id})"><span>🗂</span><span class="n">${escH(s.nome)}</span><small class="muted">${et.filter(e => e.status === 'Concluído').length}/${et.length}</small></div>`; };
    const ST_IDX = { 'Não iniciado': 0, 'Em andamento': 1, 'Concluído': 2 };
    const linhaE = e => {
        const i = ST_IDX[e.status] ?? 0;
        return `<div class="fp-row" onclick="Flow.foco('e',${e.id})"><span class="fp-st s${i}" title="${escH(e.status)} (clique para mudar)" onclick="event.stopPropagation()">${['', '▶', '✓'][i]}<select aria-label="Status" onchange="Flow.status(${e.id},this.value)">${STATUS.map(x => `<option ${e.status === x ? 'selected' : ''}>${x}</option>`).join('')}</select></span><span class="n">${escH(e.nome)}</span></div>`;
    };
    const sec = (t, h) => (h ? `<div class="fp-sec">${t}</div>${h}` : '');
    function painelDetalhes() {
        const R = refs(), f = pn.foco, ed = !!currentUserCanEdit;
        if (!f) return '<div class="fp-vazio">Selecione um projeto, atividade ou etapa do mapa (ou dê dois cliques nele) para ver os detalhes e editar aqui.</div>';
        const mapa = (k, id) => (noMapa(k, id) ? '' : btnP('＋ No mapa', `Flow.addAoMapa('${k}',${id})`));
        if (f.k === 'p') {
            const p = R.P.get(f.id); if (!p) return '<div class="fp-vazio">Projeto não encontrado (foi excluído?).</div>';
            const et = todasEtapas(p);
            return `<div class="fp-t">📁 ${escH(p.nome)}</div>${p.descricao ? `<div class="fp-d">${escH(p.descricao)}</div>` : ''}${barraP(et.filter(e => e.status === 'Concluído').length, et.length)}
                <div class="fp-acts">${ed ? btnP('✏️ Editar', `editarProjeto(${p.id})`) + btnP('+ Atividade', `abrirModalSessao(${p.id})`) + btnP('+ Etapa', `abrirModalEtapa(${p.id},null)`) : ''}${mapa('p', p.id)}${btnP('↗ Projetos', `Flow.abrirNoProjetos('p',${p.id})`)}</div>
                ${sec('Atividades', (p.sessoes || []).slice().sort(ordCmp).map(linhaS).join(''))}${sec('Etapas avulsas', (p.soltas || []).slice().sort(ordCmp).map(linhaE).join(''))}`;
        }
        if (f.k === 's') {
            const o = R.S.get(f.id); if (!o) return '<div class="fp-vazio">Atividade não encontrada (foi excluída?).</div>';
            const { s, p } = o, et = s.etapas || [], cols = nomesDe((s.sessao_usuarios || []).map(x => x.usuario_id));
            return `<div class="fp-crumb"><a onclick="Flow.foco('p',${p.id})">📁 ${escH(p.nome)}</a></div><div class="fp-t">🗂 ${escH(s.nome)}</div>${s.descricao ? `<div class="fp-d">${escH(s.descricao)}</div>` : ''}${barraP(et.filter(e => e.status === 'Concluído').length, et.length)}
                <div class="fp-kv"><b>Colaboradores</b><span>${cols.length ? escH(cols.join(', ')) : '—'}</span></div>
                <div class="fp-acts">${ed ? btnP('✏️ Editar', `editarSessao(${s.id},${p.id})`) + btnP('+ Etapa', `abrirModalEtapa(${p.id},${s.id})`) : ''}${mapa('s', s.id)}${btnP('↗ Projetos', `Flow.abrirNoProjetos('s',${s.id})`)}</div>
                ${sec('Anexos', typeof anxChips === 'function' ? anxChips(s, 8, 's') : '')}${sec('Condições', typeof condChips === 'function' ? condChips('sessao', s, 8) : '')}${sec('Etapas', et.slice().sort(ordCmp).map(linhaE).join(''))}`;
        }
        const o = R.E.get(f.id); if (!o) return '<div class="fp-vazio">Etapa não encontrada (foi excluída?).</div>';
        const { e, s, p } = o, resp = nomesDe(typeof etapaRespIds === 'function' ? etapaRespIds(e) : []);
        const prazo = e.prazo ? `<span class="badge ${prazoClass(e.prazo, e.status)}">${prazoLabel(e.prazo, e.status)}</span>` : '—';
        return `<div class="fp-crumb"><a onclick="Flow.foco('p',${p.id})">📁 ${escH(p.nome)}</a>${s ? ` › <a onclick="Flow.foco('s',${s.id})">🗂 ${escH(s.nome)}</a>` : ''}</div><div class="fp-t">${escH(e.nome)}</div>${e.descricao ? `<div class="fp-d">${escH(e.descricao)}</div>` : ''}
            <div class="fp-kv"><b>Status</b><select class="mini st" onchange="Flow.status(${e.id},this.value)">${STATUS.map(x => `<option ${e.status === x ? 'selected' : ''}>${x}</option>`).join('')}</select>
                <b>Prazo</b><span>${prazo}</span><b>Prioridade</b><span>${e.prioridade ?? 0}</span><b>Responsáveis</b><span>${resp.length ? escH(resp.join(', ')) : '—'}</span></div>
            <div class="fp-acts">${ed ? btnP('✏️ Editar', `editarEtapa(${e.id})`) : ''}${mapa('e', e.id)}${btnP('↗ Projetos', `Flow.abrirNoProjetos('e',${e.id})`)}</div>
            ${sec('Anexos', typeof anxChips === 'function' ? anxChips(e, 8, 'e') : '')}${sec('Condições', typeof condChips === 'function' ? condChips('etapa', e, 8) : '')}`;
    }
    function anexosDe(n, R) {
        if (n.t === 'a' || n.t === 'b') return [];
        const obj = n.ref && n.t === 's' ? R.S.get(n.ref)?.s : n.ref && n.t === 'e' ? R.E.get(n.ref)?.e : null;
        const reais = obj && typeof anxVinculos === 'function' ? anxVinculos(obj).map(v => v.arquivos) : [];
        const locais = (n.anx || []).map(id => anxReg.get(id)).filter(anxVisivel);
        return reais.concat(locais.filter(f => !reais.some(r => r.id === f.id)));
    }
    function listaAnexos(n) {
        if (n.ref && (n.t === 's' || n.t === 'e') && !(n.anx || []).length && typeof abrirListaAnexos === 'function') return abrirListaAnexos(n.t === 'e' ? 'e' : 's', n.ref);
        const R = refs(), lista = anexosDe(n, R), nome = info(n, R).txt;
        abrirModal(`📎 Anexos — ${nome}`, lista.length
            ? `<div class="anx-lista">${lista.map(f => `<div class="anx-item" role="button" tabindex="0" onclick="abrirAnexo(${f.id})"><span>${fileIcon(f.nome)}</span><span class="n">${escH(f.nome)}</span>${(n.anx || []).includes(f.id) ? `<button type="button" class="ms-x" aria-label="Remover do nó" onclick="event.stopPropagation();Flow.desanexar('${n.id}',${f.id})">×</button>` : ''}</div>`).join('')}</div>`
            : '<div class="row-empty">Nenhum anexo.</div>', [{ label: 'Fechar', cls: 'btn-s', action: 'fecharModal()' }]);
    }
    function desanexar(nid, arqId) {
        const n = nodeById(nid); if (!n) return;
        n.anx = (n.anx || []).filter(x => x !== arqId); salvar(); render(); listaAnexos(n);
    }
    async function carregarArqsMapa() {
        if (!D()) return;
        const falta = [...new Set(D().nodes.flatMap(n => (n.t === 'a' ? [n.ref] : []).concat(n.anx || [])).filter(id => !anxReg.has(id)))];
        if (!falta.length) return;
        const { data } = await sb.from('arquivos').select('id, nome, path, tamanho, visibilidade, criado_por').in('id', falta);
        (data || []).forEach(f => anxReg.set(f.id, f));
        if (D()) render();
    }
    async function carregarArqs(pid) {
        if (carregandoArq.has(pid)) return;
        carregandoArq.add(pid);
        const { data, error } = await sb.from('arquivos').select('id, nome, path, tamanho, visibilidade, criado_por').eq('projeto_id', pid).order('created_at', { ascending: false });
        carregandoArq.delete(pid);
        if (error) { toast('Erro ao carregar os arquivos: ' + error.message, 'error'); arqCache[pid] = []; }
        else { arqCache[pid] = (data || []).filter(anxVisivel); arqCache[pid].forEach(f => anxReg.set(f.id, f)); }
        if (pn.aberto && pn.aba === 'anx') desenhaPainel();
    }
    function projAnxId() {
        if (dedicado()) return atual.projeto_id;
        const ps = wsProjetos || [];
        if (pn.projAnx && ps.some(p => p.id === pn.projAnx)) return pn.projAnx;
        const R = refs(), f = pn.foco;
        const doFoco = f ? (f.k === 'p' ? f.id : f.k === 's' ? R.S.get(f.id)?.p.id : R.E.get(f.id)?.p.id) : null;
        return doFoco || (ps[0] && ps[0].id) || null;
    }
    function painelAnexos() {
        const pid = projAnxId(); if (!pid) return '<div class="fp-vazio">Não há projetos neste workspace.</div>';
        const ps = wsProjetos || [], nomeP = (ps.find(p => p.id === pid) || {}).nome || '';
        const topo = dedicado() ? `<div class="fp-t">📁 ${escH(nomeP)}</div>` : `<select class="fsel" onchange="Flow.projAnx(+this.value)">${ps.slice().sort(ordCmp).map(p => `<option value="${p.id}" ${p.id === pid ? 'selected' : ''}>${escH(p.nome)}</option>`).join('')}</select>`;
        const arqs = arqCache[pid]; if (!arqs) carregarArqs(pid);
        const lista = !arqs ? '<div class="fp-vazio">Carregando…</div> ' : arqs.length
            ? arqs.map(f => `<div class="fp-file" draggable="true" data-arq="${f.id}" onclick="abrirAnexo(${f.id})" title="Arraste para o mapa ou sobre uma atividade/etapa">${isImage(f.nome) ? `<img class="fp-th" src="${escH(anxUrl(f))}" alt="" draggable="false">` : `<span class="fp-ic">${fileIcon(f.nome)}</span>`}<span class="n">${escH(f.nome)}</span><small class="muted">${fmtBytes(f.tamanho)}</small></div>`).join('')
            : '<div class="fp-vazio">Este projeto ainda não tem arquivos.</div>';
        return `${topo}<p class="fp-d">Arraste um arquivo para uma atividade ou etapa (anexa) ou para o mapa (cria um nó do arquivo). Também dá para soltar arquivos do computador.</p><div class="fp-acts"><label class="btn btn-s btn-sm" style="cursor:pointer">⬆️ Enviar<input type="file" multiple style="display:none" onchange="Flow.enviar(this)"></label></div>${lista}`;
    }
    function painelHtml() {
        const tab = (k, rot) => `<button class="${pn.aba === k ? 'on' : ''}" onclick="Flow.aba('${k}')">${rot}</button>`;
        return `<div class="fp-tabs">${tab('det', 'Detalhes')}${tab('anx', '📎 Anexos')}</div>${pn.aba === 'anx' ? painelAnexos() : painelDetalhes()}`;
    }
    function aba(k) { pn.aba = k; desenhaPainel(); }
    function projAnx(id) { pn.projAnx = id; desenhaPainel(); }
    async function enviarArquivos(files, pId) {
        const ids = []; let falhas = 0;
        for (const file of files) {
            const seguro = file.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w.\-]+/g, '_');
            const path = `${currentWorkspace.id}/projetos/${pId}/${Date.now()}-${seguro}`;
            const up = await sb.storage.from('workspace-files').upload(path, file);
            if (up.error) { falhas++; continue; }
            const { data, error } = await sb.from('arquivos').insert({ nome: file.name, path, projeto_id: pId, workspace_id: currentWorkspace.id, criado_por: currentUser.id, visibilidade: 'publico', tamanho: file.size })
                .select('id, nome, path, tamanho, visibilidade, criado_por').single();
            if (error) { await sb.storage.from('workspace-files').remove([path]); falhas++; continue; }
            anxReg.set(data.id, data); ids.push(data.id);
        }
        if (ids.length) { toast(`${ids.length} arquivo(s) enviado(s).`); delete arqCache[pId]; }
        if (falhas) toast(`${falhas} arquivo(s) falharam no envio.`, 'error');
        return ids;
    }
    async function enviar(input) {
        const pid = projAnxId(), files = [...(input.files || [])]; if (!pid || !files.length) return;
        await enviarArquivos(files, pid); input.value = '';
        if (pn.aberto && pn.aba === 'anx') desenhaPainel();
    }
    function novoArquivo(arqId, x, y) {
        const f = anxReg.get(arqId); if (!f) return;
        const n = { id: uid(), t: 'a', ref: arqId, txt: f.nome, x: Math.round(x), y: Math.round(y), w: TIPO.a.w, c: 5 };
        D().nodes.push(n); recem.add(n.id); sel = { k: 'n', id: n.id }; salvar(); render();
    }
    async function anexar(n, ids) {
        const R = refs(), real = n.ref && (n.t === 's' || n.t === 'e');
        if (real) {
            if (!FD_FEAT.anx) { toast('Rode o SQL migracao_etapas_soltas_anexos.sql no Supabase para anexar arquivos a atividades e etapas.', 'warning'); return false; }
            const obj = n.t === 's' ? R.S.get(n.ref)?.s : R.E.get(n.ref)?.e; if (!obj) return false;
            const col = n.t === 's' ? 'sessao_id' : 'etapa_id';
            const novos = ids.filter(id => !(obj.anexo_vinculos || []).some(v => v.arquivo_id === id));
            if (!novos.length) { toast('Esse arquivo já está anexado.', 'warning'); return true; }
            const r = await sb.from('anexo_vinculos').insert(novos.map(id => ({ arquivo_id: id, [col]: n.ref, criado_por: currentUser.id }))).select('id, arquivo_id');
            if (r.error) { toast('Erro ao anexar: ' + r.error.message, 'error'); return false; }
            obj.anexo_vinculos = (obj.anexo_vinculos || []).concat(r.data.map(v => ({ id: v.id, arquivo_id: v.arquivo_id, arquivos: anxReg.get(v.arquivo_id) })));
            refreshProjetos();
        } else n.anx = [...new Set([...(n.anx || []), ...ids])];
        salvar(); render(); if (pn.aberto) desenhaPainel();
        toast('Arquivo anexado.');
        return true;
    }
    async function soltarArquivo(ev) {
        const nEl = ev.target.closest('.fl-n'), n = nEl && nodeById(nEl.dataset.id), p = toWorld(ev.clientX, ev.clientY);
        const alvoNo = n && n.t !== 'b' && n.t !== 'a' ? n : null;
        const dt = ev.dataTransfer, idArq = +dt.getData('text/fd-arquivo');
        let ids = idArq ? [idArq] : [];
        if (!ids.length && dt.files && dt.files.length) {
            const R = refs(), doNo = alvoNo && alvoNo.ref ? (alvoNo.t === 'p' ? alvoNo.ref : alvoNo.t === 's' ? R.S.get(alvoNo.ref)?.p.id : R.E.get(alvoNo.ref)?.p.id) : null;
            const pid = doNo || projAnxId();
            if (!pid) return toast('Escolha um projeto no painel Anexos antes de soltar arquivos do computador.', 'warning');
            ids = await enviarArquivos([...dt.files], pid);
        }
        if (!ids.length) return;
        if (alvoNo) await anexar(alvoNo, ids); else ids.forEach((id, i) => novoArquivo(id, p.x + i * 24, p.y + i * 24));
    }
    function desenhaPainel() {
        const el = $('fl-panel'); if (!el) return;
        const on = pn.aberto && !!D();
        el.classList.toggle('hidden', !on);
        if (on) el.innerHTML = painelHtml();
    }
    function atualizar() {
        if (!D()) return;
        if (dedicado()) { const p = (wsProjetos || []).find(x => x.id === atual.projeto_id); if (p && sincProjeto(D(), p)) salvar(); }
        render(); desenhaPainel();
    }
    function sincProjeto(d, p) {
        const antes = JSON.stringify(d);
        const sessoes = (p.sessoes || []).slice().sort(ordCmp), soltas = (p.soltas || []).slice().sort(ordCmp);
        const idS = new Set(sessoes.map(x => x.id)), idE = new Set(todasEtapas(p).map(x => x.id));
        d.nodes = d.nodes.filter(n => !(n.real && !n.ref) && !(n.t === 's' && n.ref && !idS.has(n.ref)) && !(n.t === 'e' && n.ref && !idE.has(n.ref)) && !(n.t === 'p' && n.ref && n.ref !== p.id));
        const vivos = new Set(d.nodes.map(n => n.id));
        d.nodes.forEach(k => { if (k.pai && !vivos.has(k.pai)) { k.pai = null; k.w = TIPO[k.t].w; } });
        d.edges = d.edges.filter(e => vivos.has(e.a) && vivos.has(e.b));
        const achar = (t, ref) => d.nodes.find(n => n.t === t && n.ref === ref);
        const ss = d.nodes.filter(n => n.t === 's' && n.ref);
        const colX = ss.length ? Math.min(...ss.map(n => n.x)) : 360;
        let y = ss.length ? Math.max(...ss.map(n => n.y + (n.h || 100))) + 40 : 40;
        const novos = [], cria = (t, ref, x, yy) => { const n = { id: uid(), t, ref, x, y: yy, w: TIPO[t].w, c: { p: 0, s: 1, e: 2 }[t] }; d.nodes.push(n); return n; };
        sessoes.forEach(sx => {
            let sn = achar('s', sx.id);
            if (!sn) { sn = cria('s', sx.id, colX, y); y += SH + Math.max(1, (sx.etapas || []).length) * (KH + GAP) + GAP + 40; novos.push(sn); }
            (sx.etapas || []).slice().sort(ordCmp).forEach((e, i) => {
                let en = achar('e', e.id); if (!en) en = cria('e', e.id, sn.x + 12, sn.y + SH);
                if (en.pai !== sn.id) en.pai = sn.id;
                if (en.o !== i) en.o = i;
            });
        });
        soltas.forEach(e => {
            let en = achar('e', e.id); if (!en) { en = cria('e', e.id, colX, y); y += 70; novos.push(en); }
            if (en.pai) { en.pai = null; en.w = TIPO.e.w; }
        });
        const raiz = achar('p', p.id) || cria('p', p.id, colX - 290, 60);
        novos.forEach(n => { if (!d.edges.some(e => e.a === raiz.id && e.b === n.id)) d.edges.push({ id: uid(), a: raiz.id, b: n.id }); });
        return JSON.stringify(d) !== antes;
    }
    async function criarAtividadeReal(pId, nome) {
        const p = (wsProjetos || []).find(x => x.id === pId); if (!p) return null;
        const { data, error } = await sb.from('sessoes').insert({ projeto_id: pId, nome, descricao: '', ...(FD_FEAT.ordem ? { ordem: proxOrdem(topoLista(p).map(x => x.o)) } : {}) }).select('id').single();
        if (error) { toast('Erro ao criar a atividade: ' + error.message, 'error'); return null; }
        await sb.from('sessao_usuarios').insert({ sessao_id: data.id, usuario_id: currentUser.id });
        await addLog('create', 'sessao', data.id, { nome });
        return data.id;
    }
    async function criarEtapaReal(pId, sId, nome) {
        const p = (wsProjetos || []).find(x => x.id === pId); if (!p) return null;
        if (!sId && !FD_FEAT.orf) { toast('Para criar etapas avulsas, rode o SQL migracao_etapas_soltas_anexos.sql no Supabase.', 'warning'); return null; }
        const sess = sId ? (p.sessoes || []).find(x => x.id === sId) : null;
        const linha = { nome, descricao: '', status: 'Não iniciado', prioridade: 0, prazo: null, responsavel_id: currentUser.id, sessao_id: sId || null,
            ...(FD_FEAT.orf ? { projeto_id: pId } : {}), ...(FD_FEAT.ordem ? { ordem: sId ? proxOrdem(sess?.etapas) : proxOrdem(topoLista(p).map(x => x.o)) } : {}) };
        const { data, error } = await sb.from('etapas').insert(linha).select('id').single();
        if (error) { toast('Erro ao criar a etapa: ' + error.message, 'error'); return null; }
        if (FD_FEAT.multi) await salvarResponsaveis(data.id, [currentUser.id]);
        await addLog('create', 'etapa', data.id, { nome });
        return data.id;
    }
    function descarta(n) {
        const d = D(); d.nodes = d.nodes.filter(x => x.id !== n.id); d.edges = d.edges.filter(e => e.a !== n.id && e.b !== n.id);
        sel = null; salvar(); render();
    }
    async function efetivar(n) {
        const pId = atual.projeto_id, pai = n.pai ? nodeById(n.pai) : null; let id = null;
        if (n.t === 's') id = await criarAtividadeReal(pId, n.txt);
        else if (!pai || pai.ref) id = await criarEtapaReal(pId, pai ? pai.ref : null, n.txt);
        if (!id) return descarta(n);
        const raiz = D().nodes.find(x => x.t === 'p' && x.ref === pId);
        if (n.t === 's' && raiz && !D().edges.some(e => e.a === raiz.id && e.b === n.id)) D().edges.push({ id: uid(), a: raiz.id, b: n.id });
        n.ref = id; delete n.real; delete n.txt; salvar();
        await renderizarProjetos();
        atualizar();
    }
    async function moverReal(n, alvo) {
        const ctx = findEtapaCtx(n.ref); if (!ctx) return atualizar();
        if (alvo && !alvo.a.ref) alvo = null;
        let o = null;
        if (alvo) {
            const irmaos = kids(alvo.a).filter(k => k.id !== n.id && k.ref);
            o = alvo.idx < irmaos.length ? { beforeId: irmaos[alvo.idx].ref } : { sessaoId: alvo.a.ref };
        } else if (ctx.s) o = { topo: 'end' };
        if (o) await moverEtapa(n.ref, o);
        salvar(); atualizar();
    }
    function painel() {
        const n = selNode(); pn.aberto = !pn.aberto;
        if (n && n.ref && n.t !== 'a') pn.foco = { k: n.t, id: n.ref };
        desenhaPainel(); updToolbar();
    }
    function foco(k, id) {
        const n = D()?.nodes.find(x => x.t === k && x.ref === id);
        sel = n ? { k: 'n', id: n.id } : null; markSel();
        pn.aberto = true; pn.foco = { k, id }; desenhaPainel(); updToolbar();
    }
    async function status(id, v) { await updateEtapaStatus(id, v); atualizar(); }
    function addAoMapa(k, id) { novo(k, { ref: id }); desenhaPainel(); }
    function abrirNoProjetos(k, id) {
        const R = refs();
        if (k === 'e') return irParaEtapa(id);
        const p = k === 'p' ? R.P.get(id) : R.S.get(id)?.p;
        if (p) irProj(p.id); else toast('Item não encontrado (foi excluído?).', 'warning');
    }
    function editarReal() {
        const n = selNode(), f = n && n.ref && n.t !== 'a' ? { k: n.t, id: n.ref } : pn.foco;
        if (!f) return toast('Selecione um item do mapa que venha de um projeto.', 'warning');
        if (!currentUserCanEdit) return toast('Você não tem permissão para editar.', 'warning');
        if (f.k === 'p') return editarProjeto(f.id);
        if (f.k === 'e') return editarEtapa(f.id);
        const o = refs().S.get(f.id); if (o) editarSessao(f.id, o.p.id); else toast('Atividade não encontrada.', 'warning');
    }
    window.addEventListener('fd:projetos', () => { if (root && root.offsetParent !== null && D()) atualizar(); });

    function toWorld(cx, cy) { const r = view.getBoundingClientRect(), v = D().view; return { x: (cx - r.left - v.x) / v.z, y: (cy - r.top - v.y) / v.z }; }
    function track(ev, move, up) {
        const sx = ev.clientX, sy = ev.clientY;
        document.body.classList.add('fl-drag');
        const mv = e => move(e.clientX - sx, e.clientY - sy, e);
        const end = e => {
            document.body.classList.remove('fl-drag');
            window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end);
            if (up) up(e, e.clientX - sx, e.clientY - sy);
        };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
    }
    function dentro(b) {
        return D().nodes.filter(n => n.id !== b.id && (n.x + n.w / 2) > b.x && (n.x + n.w / 2) < b.x + b.w && (n.y + 20) > b.y && (n.y + 20) < b.y + b.h);
    }
    function onDown(ev) {
        if (!D()) return;
        if (ev.button === 1) { ev.preventDefault(); return startPan(ev); }
        if (ev.pointerType === 'mouse' && ev.button !== 0) return;
        if (editing) { if (ev.target.closest('[contenteditable=true]')) return; document.activeElement.blur(); }
        if (ev.target.closest('.fl-pj')) return;
        if (ev.target.closest('[data-pill]')) { alternarDep(); return; }
        if (espaco || modoMao) return startPan(ev);
        const nEl = ev.target.closest('.fl-n'), soma = ev.shiftKey || ev.ctrlKey || ev.metaKey;
        if (!nEl) {
            const g = ev.target.closest('[data-edge]');
            if (g) { sel = { k: 'g', id: g.dataset.edge }; markSel(); return; }
            if (ev.pointerType === 'touch') { setSelIds([]); return startPan(ev); }
            return startMarquee(ev, soma);
        }
        const n = nodeById(nEl.dataset.id); if (!n) return;
        const alvoAct = ev.target.closest('[data-act]'), act = alvoAct ? alvoAct.dataset.act : null;
        if (act === 'toggle') { n.fechada = !n.fechada; salvar(); render(); return; }
        if (act === 'open') { abrirAnexo(+alvoAct.dataset.arq); return; }
        if (act === 'clip') { listaAnexos(n); return; }
        if (act === 'addkid') { if (n.fechada) n.fechada = false; sel = { k: 'n', id: n.id }; markSel(); return novo('e', { pai: n.id, o: 1e9, w: n.w - 24 }); }
        if (soma) { const l = new Set(idsSel()); if (l.has(n.id)) l.delete(n.id); else l.add(n.id); return setSelIds(l); }
        if (!(sel && sel.k === 'm' && grupo.has(n.id))) { sel = { k: 'n', id: n.id }; markSel(); }
        const titulo = !!ev.target.closest('.fl-t');
        if (act === 'port') startLink(ev, n); else if (act === 'resize') startResize(ev, n); else if (sel.k === 'm') startDragGrupo(ev, n); else startDrag(ev, n, titulo);
    }
    function startMarquee(ev, soma) {
        const base = soma ? idsSel() : [], box = document.createElement('div'); box.className = 'fl-mq';
        if (!soma) setSelIds([]);
        view.appendChild(box);
        const r0 = view.getBoundingClientRect(), x0 = ev.clientX - r0.left, y0 = ev.clientY - r0.top; let mexeu = false;
        track(ev, (dx, dy, e) => {
            if (!mexeu && Math.abs(dx) + Math.abs(dy) < 4) return; mexeu = true;
            const r = view.getBoundingClientRect(), v = D().view, x = e.clientX - r.left, y = e.clientY - r.top;
            const l = Math.min(x0, x), t = Math.min(y0, y), w = Math.abs(x - x0), h = Math.abs(y - y0);
            box.style.cssText = `left:${l}px;top:${t}px;width:${w}px;height:${h}px`;
            const X1 = (l - v.x) / v.z, Y1 = (t - v.y) / v.z, X2 = (l + w - v.x) / v.z, Y2 = (t + h - v.y) / v.z, hit = new Set(base);
            D().nodes.forEach(n => {
                if (oculto(n)) return;
                const R = rectOf(n);
                const toca = R.x < X2 && R.x + R.w > X1 && R.y < Y2 && R.y + R.h > Y1, todo = R.x >= X1 && R.x + R.w <= X2 && R.y >= Y1 && R.y + R.h <= Y2;
                if (n.t === 'b' ? todo : toca) hit.add(n.id);
            });
            setSelIds(hit);
        }, () => box.remove());
    }
    function startDragGrupo(ev, n) {
        const todos = new Map(), add = g => todos.set(g.id, g);
        grupo.forEach(id => { const g = nodeById(id); if (!g) return; add(g); if (g.t === 'b') dentro(g).forEach(add); if (g.t === 's') kids(g).forEach(add); });
        const lista = [...todos.values()], ids = new Set(todos.keys()), orig = lista.map(g => [g, g.x, g.y]), tops = () => lista.filter(ehTopo);
        let mexeu = false, solto = false, cx = 0, cy = 0;
        dragAtivo = true;
        track(ev, (dx, dy) => {
            const z = D().view.z; if (Math.abs(dx) + Math.abs(dy) > 3) mexeu = true; if (!mexeu) return;
            if (!solto) { solto = true; if (!dedicado()) grupo.forEach(id => { const g = nodeById(id); if (g && g.pai && !todos.has(g.pai)) desprende(g); }); }
            const r = deslizar(tops().map(caixa), topos().filter(o => !ids.has(o.id)), dx / z - cx, dy / z - cy);
            cx += r.dx; cy += r.dy;
            orig.forEach(([g, x, y]) => { g.x = Math.round(x + cx); g.y = Math.round(y + cy); const el = elOf(g.id); if (el) { el.style.left = g.x + 'px'; el.style.top = g.y + 'px'; } });
            drawEdges();
        }, () => {
            dragAtivo = false;
            if (!mexeu) return setSelIds([n.id]);
            afastar(tops(), lista, topos().filter(o => !ids.has(o.id)));
            salvar(); if (dedicado()) atualizar(); else render();
        });
    }
    function startPan(ev) {
        const v = D().view, ox = v.x, oy = v.y; let mexeu = false;
        track(ev, (dx, dy) => { mexeu = true; v.x = ox + dx; v.y = oy + dy; applyView(); }, () => { if (mexeu) salvar(); });
    }
    function startDrag(ev, n, titulo) {
        const todos = (n.t === 'b' ? dentro(n) : n.t === 's' ? kids(n) : []).concat(n), ids = new Set(todos.map(g => g.id));
        const orig = todos.map(g => [g, g.x, g.y]), tops = () => todos.filter(ehTopo);
        const obst = () => topos().filter(o => !ids.has(o.id) && !(n.t === 'e' && o.t === 's'));
        let mexeu = false, solto = false, alvo = null, cx = 0, cy = 0;
        dragAtivo = true;
        track(ev, (dx, dy, e) => {
            const z = D().view.z; if (Math.abs(dx) + Math.abs(dy) > 3) mexeu = true; if (!mexeu) return;
            if (n.pai && !solto) { solto = true; desprende(n); }
            const r = deslizar(tops().map(caixa), obst(), dx / z - cx, dy / z - cy);
            cx += r.dx; cy += r.dy;
            orig.forEach(([g, x, y]) => { g.x = Math.round(x + cx); g.y = Math.round(y + cy); const el = elOf(g.id); if (el) { el.style.left = g.x + 'px'; el.style.top = g.y + 'px'; } });
            drawEdges();
            if (n.t === 'e') { alvo = alvoSnap(n, toWorld(e.clientX, e.clientY)); mostraSnap(alvo); }
        }, () => {
            dragAtivo = false; mostraSnap(null);
            if (!mexeu) { if (titulo) editar(n.id); return; }
            const livre = () => afastar(tops(), todos, topos().filter(o => !ids.has(o.id)));
            if (n.t === 'e' && n.ref && mexeu && dedicado()) { if (!alvo) livre(); moverReal(n, alvo); return; }
            if (n.t === 'e' && alvo && mexeu) { n.pai = alvo.a.id; n.o = alvo.idx - .5; render(); salvar(); return; }
            if (mexeu) { livre(); salvar(); render(); }
        });
    }
    function startResize(ev, n) {
        const el0 = elOf(n.id), w = n.w, h = n.h || (el0 ? el0.offsetHeight : 120), comAltura = n.t === 'b' || n.t === 'a' || n.t === 'n';
        const minW = n.t === 'b' || n.t === 's' ? 200 : 120, minH = n.t === 'b' ? 120 : 70;
        track(ev, (dx, dy) => {
            const z = D().view.z; n.w = Math.max(minW, Math.round(w + dx / z));
            if (comAltura) n.h = Math.max(minH, Math.round(h + dy / z));
            const el = elOf(n.id); if (!el) return;
            el.style.width = n.w + 'px'; if (comAltura) el.style.height = n.h + 'px';
            if (n.t === 's') kids(n).forEach(k => { const ke = elOf(k.id); if (ke) ke.style.width = (n.w - 24) + 'px'; });
            drawEdges();
        }, () => { salvar(); render(); });
    }
    function startLink(ev, n) {
        const A = rectOf(n), tmp = document.createElementNS(SVGNS, 'path'); tmp.setAttribute('class', 'fl-tmp'); svg.appendChild(tmp);
        track(ev, (dx, dy, e) => { const p = toWorld(e.clientX, e.clientY); tmp.setAttribute('d', bez(A.x + A.w, A.y + A.h / 2, p.x, p.y, true)); }, e => {
            tmp.remove();
            const t = document.elementFromPoint(e.clientX, e.clientY)?.closest('.fl-n'), m = t && nodeById(t.dataset.id);
            if (!m || m.id === n.id || m.t === 'b') return;
            if ((n.t === 'a') !== (m.t === 'a')) return agregar(n.t === 'a' ? n : m, n.t === 'a' ? m : n);
            if (!D().edges.some(x => x.a === n.id && x.b === m.id)) { const id = uid(); D().edges.push({ id, a: n.id, b: m.id }); sel = { k: 'g', id }; salvar(); markSel(); }
        });
    }
    async function agregar(arq, alvo) {
        if (!(await anexar(alvo, [arq.ref]))) return;
        const d = D(); d.nodes = d.nodes.filter(x => x.id !== arq.id); d.edges = d.edges.filter(e => e.a !== arq.id && e.b !== arq.id);
        sel = null; salvar(); render(); if (pn.aberto) desenhaPainel();
    }
    function onClick(ev) {
        const b = ev.target.closest('[data-act="proj"]'); if (!b) return;
        const n = nodeById(b.closest('.fl-n').dataset.id); if (n?.proj) irProj(n.proj);
    }
    function irProj(id) { if (typeof irParaProjeto === 'function') irParaProjeto(id); else { switchTab('projetos'); abrirProjeto(id); } }
    function onDbl(ev) {
        const g = ev.target.closest('[data-edge]');
        if (g) { sel = { k: 'g', id: g.dataset.edge }; markSel(); return alternarDep(); }
        const nEl = ev.target.closest('.fl-n'); if (!nEl || ev.target.closest('.fl-pj') || editing || ev.target.closest('.fl-t')) return;
        const n = nodeById(nEl.dataset.id); if (!n) return;
        if (n.t === 'a') return abrirAnexo(n.ref);
        if (!n.ref) return editar(n.id);
        pn.aberto = true; pn.foco = { k: n.t, id: n.ref }; desenhaPainel(); updToolbar();
    }
    const textoDe = e => String(e.innerText ?? e.textContent ?? '').trim();
    function editar(id) {
        const n = nodeById(id), el = elOf(id)?.querySelector('.fl-t'); if (!n || !el) return;
        const real = !!n.ref && ['p', 's', 'e', 'a'].includes(n.t);
        if (real && n.t !== 'a' && !currentUserCanEdit) return toast('Você não tem permissão para renomear itens do projeto.', 'warning');
        if (real && info(n, refs()).gone) return;
        const antes = textoDe(el);
        editing = true; el.contentEditable = 'true'; el.focus(); document.getSelection().selectAllChildren(el);
        let cancelou = false;
        el.onkeydown = e => {
            if (e.key === 'Enter' && !(e.shiftKey && n.t === 'n')) { e.preventDefault(); el.blur(); }
            if (e.key === 'Escape') { cancelou = true; el.blur(); }
        };
        el.onblur = () => {
            editing = false;
            const v = cancelou ? '' : textoDe(el);
            if (n.real) { if (v) { n.txt = v; render(); efetivar(n); } else descarta(n); return; }
            if (real) { render(); if (v && v !== antes) renomearReal(n, v); return; }
            if (v) { n.txt = v; salvar(); }
            render();
        };
    }
    async function renomearReal(n, nome) {
        const R = refs(), tab = { p: 'projetos', s: 'sessoes', e: 'etapas', a: 'arquivos' }[n.t];
        const obj = n.t === 'p' ? R.P.get(n.ref) : n.t === 's' ? R.S.get(n.ref)?.s : n.t === 'e' ? R.E.get(n.ref)?.e : anxReg.get(n.ref);
        if (!obj) return;
        const { error } = await updateChecado(tab, { nome }, n.ref);
        if (error) { toast('Erro ao renomear: ' + error.message, 'error'); return atualizar(); }
        obj.nome = nome;
        if (n.t !== 'a') addLog('update', { p: 'projeto', s: 'sessao', e: 'etapa' }[n.t], n.ref, { nome: `renomeado para "${nome}"` });
        refreshProjetos(); atualizar();
    }
    document.addEventListener('keydown', ev => {
        if (!root || root.offsetParent === null || !D() || editing) return;
        if (ev.target.closest('input, textarea, select, [contenteditable=true]') || !$('modal-ov').classList.contains('hidden')) return;
        if (ev.code === 'Space') { if (ev.target.closest('button, a')) return; ev.preventDefault(); if (!espaco) { espaco = true; atualizaMao(); } return; }
        if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'a') { ev.preventDefault(); setSelIds(D().nodes.map(n => n.id)); }
        else if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); remover(); }
        else if (ev.key === 'Tab' && selNode()) { ev.preventDefault(); filho(); }
        else if (ev.key === 'Escape') { sel = null; markSel(); }
    });
    document.addEventListener('keyup', ev => { if (ev.code === 'Space' && espaco) { espaco = false; atualizaMao(); } });
    window.addEventListener('blur', () => { if (espaco) { espaco = false; atualizaMao(); } });
    function atualizaMao() { if (view) view.classList.toggle('mao', espaco || modoMao); }
    function mao() { modoMao = !modoMao; atualizaMao(); updToolbar(); }

    function centro() { const r = view.getBoundingClientRect(); return toWorld(r.left + r.width / 2, r.top + r.height / 2); }
    function novo(t, extra, paiId) {
        if (!D()) return null;
        const c = centro(), w = TIPO[t].w, j = () => Math.round((Math.random() - .5) * 60);
        const n = Object.assign({
            id: uid(), t, x: Math.round(c.x - w / 2) + j(), y: Math.round(c.y - 30) + j(), w,
            txt: { b: 'Novo bloco', s: 'Nova atividade', e: 'Nova etapa', n: 'Nota' }[t], c: { p: 0, s: 1, e: 2, n: 3, b: 6 }[t]
        }, t === 'b' ? { h: 240 } : {}, extra || {});
        if (dedicado() && (t === 's' || t === 'e') && !n.ref) n.real = 1;
        D().nodes.push(n); recem.add(n.id);
        if (paiId) D().edges.push({ id: uid(), a: paiId, b: n.id });
        sel = { k: 'n', id: n.id }; salvar(); render();
        if (t !== 'p' && !n.ref) editar(n.id);
        return n;
    }
    function filho() {
        const n = selNode(); if (!n || n.t === 'b' || n.t === 'a') return;
        if (n.t === 's') return novo('e', { pai: n.id, o: 1e9, w: n.w - 24 });
        if (n.t === 'e' && n.pai) return novo('e', { pai: n.pai, o: (n.o ?? 0) + .5, w: n.w });
        const t = { p: 's', s: 'e', e: 'e', n: 'n' }[n.t], irmaos = D().edges.filter(e => e.a === n.id).length;
        novo(t, { x: n.x + n.w + 70, y: n.y + irmaos * 70 }, n.id);
    }
    function cor() { const l = idsSel().map(nodeById).filter(Boolean); if (!l.length) return; l.forEach(n => { n.c = ((n.c || 0) + 1) % COR.length; }); salvar(); render(); }
    async function remover() {
        const alvo = sel; if (!alvo || !D()) return; const d = D();
        if (alvo.k === 'g') {
            const e = d.edges.find(x => x.id === alvo.id), a = e && nodeById(e.a), b = e && nodeById(e.b), c = e && condReal(a, b);
            if (c) {
                if (!confirm('Esta seta é uma dependência real: excluí-la também remove a condição no projeto. Continuar?')) return;
                const r = await sb.from('condicoes').delete().eq('id', c.id);
                if (r.error) return toast('Erro: ' + r.error.message, 'error');
                todasCond().splice(todasCond().indexOf(c), 1); refreshProjetos();
            }
            d.edges = d.edges.filter(x => x.id !== alvo.id);
        } else {
            const ids = new Set(alvo.k === 'm' ? grupo : [alvo.id]);
            if (dedicado()) {
                const reais = [...ids].map(nodeById).filter(x => x && x.ref && x.t !== 'a');
                if (reais.length) {
                    if (ids.size > 1) return toast('Atividades e etapas do projeto são excluídas uma por vez, porque isso apaga de verdade.', 'warning');
                    if (reais[0].t === 'p') return toast('O projeto não pode ser excluído por aqui.', 'warning');
                    return reais[0].t === 'e' ? deletarEtapa(reais[0].ref) : deletarSessaoConfirm(reais[0].ref);
                }
            }
            if (ids.size > 1 && !confirm(`Remover ${ids.size} itens do mapa? (nada é apagado dos projetos)`)) return;
            d.nodes.forEach(k => { if (k.pai && ids.has(k.pai) && !ids.has(k.id)) { k.pai = null; k.w = TIPO[k.t].w; } });
            d.nodes = d.nodes.filter(n => !ids.has(n.id)); d.edges = d.edges.filter(e => !ids.has(e.a) && !ids.has(e.b));
        }
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
            try { localStorage.setItem('fd-flow-' + currentWorkspace.id, String(data.id)); } catch (e) { }
            await abrir();
        }
    }
    async function excluirMapa() {
        if (!atual || !dono() || !confirm(`Excluir o mapa "${atual.nome}"? Os projetos, atividades e etapas não são afetados.`)) return;
        const { error } = await sb.from('flows').delete().eq('id', atual.id);
        if (error) return toast('Erro: ' + error.message, 'error');
        atual = null; fecharModal(); toast('Mapa excluído.');
        try { localStorage.removeItem('fd-flow-' + currentWorkspace.id); } catch (e) { }
        await abrir();
    }

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

    function modalBloco() {
        const b = selNode(); if (!b || b.t !== 'b') return toast('Selecione um bloco.', 'warning');
        const it = dentro(b), na = it.filter(x => x.t === 's').length, ne = it.filter(x => x.t === 'e').length;
        abrirModal('💾 Salvar bloco como projeto', `
            <div class="fg"><label class="fl">Nome do projeto</label><input id="fl-pn" class="fi" value="${escH(b.txt || '')}"/></div>
            <div class="fg"><label class="fl">Descrição</label><textarea id="fl-pd" class="fta"></textarea></div>
            <p class="fhint">Serão criadas ${na} atividade(s) e ${ne} etapa(s) com o que está dentro do bloco (copiando nome, descrição, prazo e prioridade). Etapas encaixadas (ou ligadas por seta) a uma atividade entram nela; as demais ${FD_FEAT.orf ? 'viram etapas soltas' : 'vão para uma atividade "Geral"'}. Setas de dependência (🔒) entre esses itens viram condições. Notas e nós de projeto não entram. Você será o responsável por tudo.</p>`,
            [{ label: 'Criar projeto', cls: 'btn-p', action: `Flow.blocoProjeto('${b.id}')` }, { label: 'Cancelar', cls: 'btn-s', action: 'fecharModal()' }]);
    }
    async function blocoProjeto(id) {
        try { await blocoProjetoInterno(id); }
        catch (e) { console.error(e); toast('Erro ao salvar o projeto: ' + (e && e.message ? e.message : e), 'error'); }
    }
    async function blocoProjetoInterno(id) {
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
            const g = D().edges.find(e => { const a = nodeById(e.a), b = nodeById(e.b); return !(a && b && isDep(e, a, b)) && ((e.a === n.id && sessDe.has(e.b)) || (e.b === n.id && sessDe.has(e.a))); });
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
        const etaDe = new Map();
        if (linhas.length) {
            const r = await sb.from('etapas').insert(linhas).select('id');
            if (r.error) falha = r.error;
            else {
                r.data.forEach((e, i) => etaDe.set(ets[i].id, e.id));
                if (FD_FEAT.multi) await sb.from('etapa_responsaveis').insert(r.data.map(e => ({ etapa_id: e.id, usuario_id: currentUser.id })));
            }
        }
        const depEdges = D().edges.filter(e => { const a = nodeById(e.a), b = nodeById(e.b); return a && b && isDep(e, a, b); });
        if (depEdges.length && !FD_FEAT.cond) toast('As dependências não foram copiadas: rode o SQL migracao_flow_condicoes.sql no Supabase.', 'warning');
        if (FD_FEAT.cond && depEdges.length) {
            const novoItem = n => (n.t === 's' && sessDe.has(n.id) ? { t: 'sessao', id: sessDe.get(n.id) } : n.t === 'e' && etaDe.has(n.id) ? { t: 'etapa', id: etaDe.get(n.id) } : null);
            const vistos = new Set(), conds = [];
            depEdges.forEach(e => {
                const ia = novoItem(nodeById(e.a)), ib = novoItem(nodeById(e.b));
                if (!ia || !ib || (ia.t === ib.t && ia.id === ib.id)) return;
                const k = `${ib.t}:${ib.id}<${ia.t}:${ia.id}`, inv = `${ia.t}:${ia.id}<${ib.t}:${ib.id}`;
                if (vistos.has(k) || vistos.has(inv)) return;
                vistos.add(k);
                conds.push({ workspace_id: currentWorkspace.id, alvo_tipo: ib.t, alvo_id: ib.id, cond_tipo: ia.t, cond_id: ia.id, criado_por: currentUser.id });
            });
            if (conds.length) { const r = await sb.from('condicoes').insert(conds); if (r.error) falha = r.error; }
        }
        b.proj = proj.id; salvar();
        await addLog('create', 'projeto', null, { nome, origem: 'Flow' });
        fecharModal();
        try { await renderizarProjetos(); popularSelectProjetos(); } catch (e) { }
        render();
        if (falha) toast('Projeto criado, mas parte do conteúdo falhou: ' + falha.message, 'warning'); else toast(`Projeto "${nome}" criado a partir do bloco! 🎉`);
    }

    window.Flow = { abrir, trocar, recarregar, novo, filho, cor, remover, zoom, ajustar, modalMapa, salvarMapa, excluirMapa, modalImportar, marcar, importar, modalBloco, blocoProjeto, alternarDep, irProjeto, mao, aba, projAnx, enviar, desanexar, painel, foco, status, addAoMapa, abrirNoProjetos, editarReal };
})();