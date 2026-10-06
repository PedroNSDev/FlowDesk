const DASHBOARD_ESTILO = `.dash-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap;margin-bottom:6px}
.dash-head .home-sub{margin-bottom:16px}
.dash-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:16px}
.dash-kpi{--c:var(--acc);display:flex;gap:12px;align-items:center;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px 16px;box-shadow:var(--sh);cursor:pointer;position:relative;overflow:hidden;transition:.18s}
.dash-kpi::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--c)}
.dash-kpi:hover{transform:translateY(-3px);box-shadow:var(--sh-md)}
.dash-kpi-ic{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.25rem;background:color-mix(in srgb,var(--c) 14%,#fff);flex-shrink:0}
.dash-kpi-v{font-size:1.65rem;font-weight:800;line-height:1.1;color:var(--c)}
.dash-kpi-l{font-size:.76rem;font-weight:600;color:var(--text);margin-top:1px}
.dash-kpi-s{font-size:.7rem;color:var(--muted);margin-top:1px}
.dash-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:16px}
.dash-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px;box-shadow:var(--sh);min-width:0}
.dash-s3{grid-column:span 3}
.dash-s4{grid-column:span 4}
.dash-s5{grid-column:span 5}
.dash-s6{grid-column:span 6}
.dash-s8{grid-column:span 8}
.dash-ct{font-size:.74rem;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:var(--muted);margin-bottom:14px;display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.dash-cs{font-size:.7rem;font-weight:500;text-transform:none;letter-spacing:0}
.dash-vazio{text-align:center;color:var(--muted);font-size:.82rem;padding:26px 10px}
.dash-donut-wrap{display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:center}
.dash-donut{width:150px;height:150px;flex-shrink:0}
.dash-seg{transition:stroke-dasharray .9s cubic-bezier(.2,.8,.2,1)}
.dash-donut-v{font-size:26px;font-weight:800;fill:var(--text);font-family:var(--font)}
.dash-donut-l{font-size:9.5px;fill:var(--muted);font-family:var(--font)}
.dash-leg{display:flex;flex-direction:column;gap:9px;font-size:.8rem}
.dash-leg-i{display:flex;align-items:center;gap:8px}
.dash-leg-i i{width:10px;height:10px;border-radius:3px;display:inline-block}
.dash-leg-i b{margin-left:auto;padding-left:14px}
.dash-cols{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:8px;height:190px;align-items:end}
.dash-col{display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;gap:4px}
.dash-col[onclick]{cursor:pointer}
.dash-col-n{font-size:.74rem;font-weight:700;height:16px;color:var(--text)}
.dash-col-track{flex:1;width:100%;display:flex;align-items:flex-end;background:#f4f6fd;border-radius:7px;overflow:hidden}
.dash-col-bar{width:100%;background:linear-gradient(180deg,#818cf8,var(--acc));border-radius:7px 7px 0 0;transform-origin:bottom;animation:dashGrowY .7s cubic-bezier(.2,.8,.2,1) both;transition:filter .15s}
.dash-col:hover .dash-col-bar{filter:brightness(1.12)}
.dash-col.late .dash-col-bar{background:linear-gradient(180deg,#f87171,var(--danger))}
.dash-col.atual .dash-col-bar{background:linear-gradient(180deg,#fbbf24,var(--warn))}
.dash-col-l{font-size:.62rem;color:var(--muted);white-space:nowrap}
.dash-col.late .dash-col-l{color:var(--danger);font-weight:700}
.dash-rows{display:flex;flex-direction:column;gap:12px}
.dash-row{display:grid;grid-template-columns:minmax(0,130px) minmax(0,1fr) auto;gap:10px;align-items:center;font-size:.8rem}
.dash-row-n{display:flex;align-items:center;gap:7px;min-width:0}
.dash-row-n span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600}
.dash-row-t{font-size:.72rem;color:var(--muted);white-space:nowrap}
.dash-bar{height:10px;border-radius:999px;background:#eef1fb;overflow:hidden;display:flex}
.dash-bar>div{height:100%;transform-origin:left;animation:dashGrowX .8s cubic-bezier(.2,.8,.2,1) both}
.dash-prios{display:flex;flex-direction:column;gap:10px}
.dash-prio{display:grid;grid-template-columns:62px minmax(0,1fr) 24px;gap:8px;align-items:center;font-size:.76rem}
.dash-prio-l{color:var(--muted)}
.dash-prio-n{text-align:right;font-weight:700}
.dash-ins{display:flex;flex-direction:column;gap:10px}
.dash-in{display:flex;gap:12px;padding:11px 13px;border-radius:12px;border:1px solid var(--border);border-left-width:4px;background:#fcfcff;transition:.15s}
.dash-in[onclick]{cursor:pointer}
.dash-in[onclick]:hover{transform:translateX(3px);box-shadow:var(--sh)}
.dash-in.danger{border-left-color:var(--danger);background:#fff7f7}
.dash-in.warn{border-left-color:var(--warn);background:#fffbf0}
.dash-in.info{border-left-color:var(--acc);background:#f8f9ff}
.dash-in.ok{border-left-color:var(--ok);background:#f4fdf9}
.dash-in-ic{font-size:1.25rem;line-height:1.2}
.dash-in-t{font-weight:700;font-size:.86rem}
.dash-in-d{font-size:.78rem;color:var(--muted);margin-top:2px}
.dash-foco{display:flex;flex-direction:column;gap:9px}
.dash-fi{display:flex;align-items:center;gap:11px;padding:10px 12px;border:1px solid var(--border);border-radius:12px;cursor:pointer;transition:.15s;background:#fff}
.dash-fi:hover{border-color:var(--acc);box-shadow:var(--sh)}
.dash-fi-b{width:4px;align-self:stretch;border-radius:4px;flex-shrink:0}
.dash-fi-i{flex:1;min-width:0}
.dash-fi-n{font-weight:600;font-size:.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dash-fi-c{font-size:.72rem;color:var(--muted);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dash-time{display:flex;flex-direction:column;gap:9px}
.dash-ti{display:flex;align-items:center;gap:11px;cursor:pointer;padding:6px;border-radius:10px;transition:.15s}
.dash-ti:hover{background:var(--acc-lt)}
.dash-ti-d{width:44px;border-radius:10px;padding:5px 0;text-align:center;flex-shrink:0;color:#fff;background:linear-gradient(135deg,var(--acc),#6366f1)}
.dash-ti-d.pz{background:linear-gradient(135deg,var(--warn),#fbbf24)}
.dash-ti-d b{display:block;font-size:1.05rem;line-height:1}
.dash-ti-d small{font-size:.58rem;text-transform:uppercase;letter-spacing:.06em;opacity:.9}
.dash-ti-n{font-weight:600;font-size:.83rem}
.dash-ti-s{font-size:.72rem;color:var(--muted)}
@keyframes dashGrowY{from{transform:scaleY(0)}}
@keyframes dashGrowX{from{transform:scaleX(0)}}
@media(max-width:1200px){
    .dash-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}
    .dash-s3,.dash-s4,.dash-s5,.dash-s8{grid-column:span 6}
}
@media(max-width:760px){
    .dash-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}
    .dash-s3,.dash-s4,.dash-s5,.dash-s6,.dash-s8{grid-column:span 12}
    .dash-row{grid-template-columns:minmax(0,100px) minmax(0,1fr) auto}
}`;

document.head.appendChild(Object.assign(document.createElement('style'), { textContent: DASHBOARD_ESTILO }));

let dashEscopo = localStorage.getItem('fd-dash-escopo') || 'workspace';
let dashDados = null;

const DASH_COR_STATUS = { naoIniciado: '#cbd5e1', andamento: '#f59e0b', concluido: '#10b991' };
const DASH_COR_PRIO = ['#94a3b8', '#38bdf8', '#818cf8', '#f59e0b', '#ef4444'];
const DASH_LBL_PRIO = ['0 · Baixa', '1', '2', '3', '4 · Alta'];

function dashFmt(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function dashData(s) { return new Date(s + 'T00:00:00'); }
function dashHoje() { const h = new Date(); h.setHours(0, 0, 0, 0); return h; }
function dashDias(s) { return Math.round((dashData(s) - dashHoje()) / 86400000); }
function dashCurta(s) { return dashData(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); }
function dashPl(n, s, p) { return n === 1 ? s : p; }
function dashPct(a, b) { return b ? Math.round(a / b * 100) : 0; }

function dashMetricas(lista) {
    const abertas = lista.filter(e => e.status !== 'Concluído');
    const m = {
        total: lista.length,
        abertas,
        naoIniciado: lista.filter(e => e.status === 'Não iniciado').length,
        andamento: lista.filter(e => e.status === 'Em andamento').length,
        concluidas: lista.filter(e => e.status === 'Concluído').length,
        vencidas: abertas.filter(e => e.prazo && dashDias(e.prazo) < 0).sort((a, b) => a.prazo.localeCompare(b.prazo)),
        hoje: abertas.filter(e => e.prazo && dashDias(e.prazo) === 0),
        proximas: abertas.filter(e => e.prazo && dashDias(e.prazo) > 0 && dashDias(e.prazo) <= 7).sort((a, b) => a.prazo.localeCompare(b.prazo)),
        semPrazo: abertas.filter(e => !e.prazo),
        semResp: abertas.filter(e => !e.responsavel_id),
        altaPrio: abertas.filter(e => (e.prioridade || 0) >= 3)
    };
    m.taxa = dashPct(m.concluidas, m.total);
    return m;
}

function dashPorResponsavel(lista) {
    const mapa = new Map();
    lista.forEach(e => {
        const k = e.responsavel_id || 0;
        if (!mapa.has(k)) {
            const u = wsMembers.find(x => x.id === k);
            mapa.set(k, { id: k, nome: k ? (u ? u.nome : 'Ex-membro') : 'Sem responsável', nao: 0, and: 0, ok: 0, total: 0, abertas: 0 });
        }
        const r = mapa.get(k);
        r.total++;
        if (e.status === 'Concluído') r.ok++;
        else { r.abertas++; if (e.status === 'Em andamento') r.and++; else r.nao++; }
    });
    return [...mapa.values()].sort((a, b) => b.abertas - a.abertas || b.total - a.total).slice(0, 6);
}

function dashPorProjeto(lista) {
    const mapa = new Map();
    lista.forEach(e => {
        const p = e.sessoes && e.sessoes.projetos;
        if (!p) return;
        if (!mapa.has(p.id)) mapa.set(p.id, { id: p.id, nome: p.nome, total: 0, ok: 0, vencidas: 0 });
        const r = mapa.get(p.id);
        r.total++;
        if (e.status === 'Concluído') r.ok++;
        else if (e.prazo && dashDias(e.prazo) < 0) r.vencidas++;
    });
    return [...mapa.values()].sort((a, b) => b.total - a.total).slice(0, 7);
}

function dashSemanas(abertas) {
    const ini = dashHoje();
    ini.setDate(ini.getDate() - ((ini.getDay() + 6) % 7));
    const b = [{ rotulo: 'Atrasadas', n: 0, tipo: 'late' }];
    for (let i = 0; i < 8; i++) {
        const d = new Date(ini);
        d.setDate(d.getDate() + i * 7);
        b.push({ rotulo: dashCurta(dashFmt(d)), n: 0, tipo: i === 0 ? 'atual' : 'norm', data: dashFmt(d) });
    }
    abertas.forEach(e => {
        if (!e.prazo) return;
        if (dashDias(e.prazo) < 0) { b[0].n++; return; }
        const idx = Math.floor(Math.round((dashData(e.prazo) - ini) / 86400000) / 7);
        if (idx >= 0 && idx < 8) b[idx + 1].n++;
    });
    return b;
}

function dashPrioridades(abertas) {
    const n = [0, 0, 0, 0, 0];
    abertas.forEach(e => { n[Math.min(4, Math.max(0, e.prioridade || 0))]++; });
    return n;
}

function dashDonut(partes, centro, sub) {
    const r = 54, C = 2 * Math.PI * r;
    const total = partes.reduce((t, p) => t + p.v, 0);
    let acc = 0;
    const segs = partes.filter(p => p.v > 0).map(p => {
        const len = p.v / total * C;
        const vis = Math.max(len - (partes.filter(x => x.v > 0).length > 1 ? 2 : 0), 0.5);
        const s = `<circle class="dash-seg" cx="70" cy="70" r="${r}" fill="none" stroke="${p.cor}" stroke-width="16" stroke-dasharray="0 ${C}" stroke-dashoffset="${-acc}" data-da="${vis} ${C - vis}" transform="rotate(-90 70 70)"><title>${escH(p.nome)}: ${p.v}</title></circle>`;
        acc += len;
        return s;
    }).join('');
    return `<svg viewBox="0 0 140 140" class="dash-donut"><circle cx="70" cy="70" r="${r}" fill="none" stroke="#eef2ff" stroke-width="16"/>${segs}<text x="70" y="70" text-anchor="middle" class="dash-donut-v">${centro}</text><text x="70" y="87" text-anchor="middle" class="dash-donut-l">${sub}</text></svg>`;
}

function dashColunas(semanas) {
    const max = Math.max(1, ...semanas.map(s => s.n));
    return `<div class="dash-cols">${semanas.map(s => `
        <div class="dash-col ${s.tipo}" ${s.data ? `onclick="dashIrData('${s.data}')"` : ''} title="${s.n} ${dashPl(s.n, 'prazo', 'prazos')}">
            <div class="dash-col-n">${s.n || ''}</div>
            <div class="dash-col-track"><div class="dash-col-bar" style="height:${s.n ? Math.max(6, s.n / max * 100) : 0}%"></div></div>
            <div class="dash-col-l">${s.rotulo}</div>
        </div>`).join('')}</div>`;
}

function dashLinhasResp(rows) {
    const max = Math.max(1, ...rows.map(r => r.total));
    return `<div class="dash-rows">${rows.map(r => {
        const u = wsMembers.find(x => x.id === r.id);
        const av = u ? avatar(u) : `<span class="av" style="background:#94a3b8">?</span>`;
        const w = k => r[k] / max * 100;
        return `<div class="dash-row" title="${escH(r.nome)}: ${r.ok} concluídas · ${r.and} em andamento · ${r.nao} não iniciadas">
            <div class="dash-row-n">${av}<span>${escH(r.nome)}</span></div>
            <div class="dash-bar"><div style="width:${w('ok')}%;background:${DASH_COR_STATUS.concluido}"></div><div style="width:${w('and')}%;background:${DASH_COR_STATUS.andamento}"></div><div style="width:${w('nao')}%;background:${DASH_COR_STATUS.naoIniciado}"></div></div>
            <div class="dash-row-t">${r.abertas} ${dashPl(r.abertas, 'aberta', 'abertas')}</div>
        </div>`;
    }).join('')}</div>`;
}

function dashLinhasProj(rows) {
    return `<div class="dash-rows">${rows.map(p => {
        const pct = dashPct(p.ok, p.total);
        return `<div class="dash-row" title="${escH(p.nome)}: ${p.ok} de ${p.total} concluídas">
            <div class="dash-row-n"><span>${escH(p.nome)}</span></div>
            <div class="dash-bar"><div style="width:${pct}%;background:linear-gradient(90deg,#34d399,${DASH_COR_STATUS.concluido})"></div></div>
            <div class="dash-row-t">${pct}%${p.vencidas ? ` · <b style="color:var(--danger)">${p.vencidas}⚠</b>` : ''}</div>
        </div>`;
    }).join('')}</div>`;
}

function dashLinhasPrio(n) {
    const max = Math.max(1, ...n);
    return `<div class="dash-prios">${n.map((v, i) => `
        <div class="dash-prio"><span class="dash-prio-l">${DASH_LBL_PRIO[i]}</span>
        <div class="dash-bar"><div style="width:${v / max * 100}%;background:${DASH_COR_PRIO[i]}"></div></div>
        <span class="dash-prio-n">${v}</span></div>`).join('')}</div>`;
}

function dashInsights(m, porResp, porProj, semanas) {
    const l = [];
    const ws = dashEscopo === 'workspace';
    if (m.vencidas.length) {
        const mais = m.vencidas[0];
        const dias = -dashDias(mais.prazo);
        l.push({ p: 5, cls: 'danger', ic: '🔥', t: `${m.vencidas.length} ${dashPl(m.vencidas.length, 'etapa vencida', 'etapas vencidas')}`, d: `A mais antiga é "${mais.nome}", atrasada há ${dias} ${dashPl(dias, 'dia', 'dias')}.`, data: mais.prazo });
    }
    if (m.hoje.length) {
        const nomes = m.hoje.slice(0, 2).map(e => `"${e.nome}"`).join(' e ');
        l.push({ p: 4, cls: 'warn', ic: '⏰', t: `${m.hoje.length} ${dashPl(m.hoje.length, 'prazo vence hoje', 'prazos vencem hoje')}`, d: `${nomes}${m.hoje.length > 2 ? ` e mais ${m.hoje.length - 2}` : ''}.`, data: dashFmt(dashHoje()) });
    }
    if (m.proximas.length) {
        const prox = m.proximas[0];
        const dias = dashDias(prox.prazo);
        l.push({ p: 3, cls: 'info', ic: '📆', t: `${m.proximas.length} ${dashPl(m.proximas.length, 'prazo', 'prazos')} nos próximos 7 dias`, d: `O próximo é "${prox.nome}", em ${dias} ${dashPl(dias, 'dia', 'dias')}.`, data: prox.prazo });
    }
    const topo = porResp.find(r => r.id);
    if (ws && topo && m.abertas.length >= 4 && topo.abertas / m.abertas.length >= 0.4) {
        l.push({ p: 3, cls: 'warn', ic: '⚖️', t: 'Carga concentrada', d: `${topo.nome} responde por ${dashPct(topo.abertas, m.abertas.length)}% das etapas em aberto (${topo.abertas} de ${m.abertas.length}).` });
    }
    if (ws && m.semResp.length) {
        l.push({ p: 3, cls: 'warn', ic: '🙋', t: `${m.semResp.length} ${dashPl(m.semResp.length, 'etapa sem responsável', 'etapas sem responsável')}`, d: 'Atribua um responsável para que nenhuma entrega fique sem dono.' });
    }
    if (m.altaPrio.length) {
        l.push({ p: 2, cls: 'warn', ic: '🚩', t: `${m.altaPrio.length} ${dashPl(m.altaPrio.length, 'etapa', 'etapas')} de alta prioridade em aberto`, d: 'Prioridade 3 ou 4 ainda não concluída.' });
    }
    if (m.semPrazo.length) {
        l.push({ p: 1, cls: 'info', ic: '🗓️', t: `${m.semPrazo.length} ${dashPl(m.semPrazo.length, 'etapa aberta sem prazo', 'etapas abertas sem prazo')}`, d: 'Sem data de entrega elas não aparecem na Agenda.' });
    }
    const pior = porProj.filter(p => p.total >= 3).sort((a, b) => a.ok / a.total - b.ok / b.total)[0];
    if (pior && pior.ok / pior.total < 0.5) {
        l.push({ p: 1, cls: 'info', ic: '🧭', t: 'Projeto com menor avanço', d: `"${pior.nome}" está com ${dashPct(pior.ok, pior.total)}% concluído (${pior.ok} de ${pior.total}).` });
    }
    const pico = [...semanas.slice(1)].sort((a, b) => b.n - a.n)[0];
    if (pico && pico.n >= 3) {
        l.push({ p: 1, cls: 'info', ic: '📈', t: 'Semana mais cheia', d: `A semana de ${pico.rotulo} concentra ${pico.n} prazos.`, data: pico.data });
    }
    if (m.total && m.concluidas === m.total) {
        l.push({ p: 0, cls: 'ok', ic: '🎉', t: 'Tudo concluído', d: 'Todas as etapas deste escopo foram finalizadas.' });
    } else if (m.taxa >= 70 && !m.vencidas.length) {
        l.push({ p: 0, cls: 'ok', ic: '🚀', t: 'Bom ritmo', d: `${m.taxa}% das etapas concluídas e nenhuma vencida.` });
    }
    if (!l.length) l.push({ p: 0, cls: 'info', ic: '✨', t: 'Nada a destacar', d: 'Sem alertas por enquanto.' });
    return l.sort((a, b) => b.p - a.p).slice(0, 5);
}

function dashRenderInsight(i) {
    return `<div class="dash-in ${i.cls}" ${i.data ? `onclick="dashIrData('${i.data}')"` : ''}>
        <div class="dash-in-ic">${i.ic}</div>
        <div><div class="dash-in-t">${escH(i.t)}</div><div class="dash-in-d">${escH(i.d)}</div></div>
    </div>`;
}

function dashFoco(minhas) {
    const abertas = minhas.filter(e => e.status !== 'Concluído');
    const ord = [...abertas].sort((a, b) => {
        if (!a.prazo && !b.prazo) return (b.prioridade || 0) - (a.prioridade || 0);
        if (!a.prazo) return 1;
        if (!b.prazo) return -1;
        return a.prazo.localeCompare(b.prazo);
    }).slice(0, 5);
    if (!ord.length) return '<div class="dash-vazio">🎉 Nenhuma etapa em aberto atribuída a você.</div>';
    return `<div class="dash-foco">${ord.map(e => {
        const cor = !e.prazo ? '#cbd5e1' : dashDias(e.prazo) < 0 ? 'var(--danger)' : dashDias(e.prazo) <= 2 ? 'var(--warn)' : 'var(--acc)';
        const proj = e.sessoes && e.sessoes.projetos ? e.sessoes.projetos.nome : '—';
        return `<div class="dash-fi" ${e.prazo ? `onclick="dashIrData('${e.prazo}')"` : ''}>
            <div class="dash-fi-b" style="background:${cor}"></div>
            <div class="dash-fi-i"><div class="dash-fi-n">${escH(e.nome)}</div><div class="dash-fi-c">📁 ${escH(proj)} · ${e.status}</div></div>
            ${e.prazo ? `<span class="badge ${prazoClass(e.prazo, e.status)}">${prazoLabel(e.prazo, e.status)}</span>` : '<span class="badge b-gray">Sem prazo</span>'}
        </div>`;
    }).join('')}</div>`;
}

function dashLinhaTempo(lista, eventos) {
    const itens = [];
    eventos.forEach(ev => itens.push({ data: ev.data, nome: ev.nome, sub: ev.hora ? `🕐 ${ev.hora.slice(0, 5)}` : 'Evento', pz: false }));
    lista.filter(e => e.status !== 'Concluído' && e.prazo && dashDias(e.prazo) >= 0 && dashDias(e.prazo) <= 14)
        .forEach(e => itens.push({ data: e.prazo, nome: e.nome, sub: `⏰ Prazo · ${e.sessoes && e.sessoes.projetos ? e.sessoes.projetos.nome : '—'}`, pz: true }));
    itens.sort((a, b) => a.data.localeCompare(b.data));
    if (!itens.length) return '<div class="dash-vazio">📭 Nada agendado para os próximos 14 dias.</div>';
    return `<div class="dash-time">${itens.slice(0, 7).map(i => {
        const d = dashData(i.data);
        return `<div class="dash-ti" onclick="dashIrData('${i.data}')">
            <div class="dash-ti-d ${i.pz ? 'pz' : ''}"><b>${String(d.getDate()).padStart(2, '0')}</b><small>${d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</small></div>
            <div style="min-width:0"><div class="dash-ti-n">${escH(i.nome)}</div><div class="dash-ti-s">${escH(i.sub)}</div></div>
        </div>`;
    }).join('')}</div>`;
}

function dashIrData(data) {
    if (typeof agIrParaData === 'function') agIrParaData(data);
    else switchTab('eventos');
}

function dashTrocarEscopo(e) {
    dashEscopo = e;
    localStorage.setItem('fd-dash-escopo', e);
    dashRender();
}

function dashAnimar(c) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
        c.querySelectorAll('.dash-seg').forEach(s => s.setAttribute('stroke-dasharray', s.dataset.da));
    }));
    c.querySelectorAll('.dash-num').forEach(el => {
        const alvo = +el.dataset.v, suf = el.dataset.s || '', t0 = performance.now();
        const passo = t => {
            const p = Math.min(1, (t - t0) / 700);
            el.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 3))) + suf;
            if (p < 1) requestAnimationFrame(passo);
        };
        requestAnimationFrame(passo);
    });
}

function dashRender() {
    const c = document.getElementById('home-container');
    const todas = dashDados.etapas;
    const meu = dashEscopo === 'meu';
    const escopo = meu ? todas.filter(e => e.responsavel_id === currentUser.id) : todas;
    const m = dashMetricas(escopo);
    const porResp = dashPorResponsavel(escopo);
    const porProj = dashPorProjeto(escopo);
    const semanas = dashSemanas(m.abertas);
    const prios = dashPrioridades(m.abertas);
    const insights = dashInsights(m, porResp, porProj, semanas);
    const hora = new Date().getHours();
    const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
    const eventos = dashDados.eventos.filter(ev => dashDias(ev.data) <= 14);
    const proxPrazo = [...m.hoje, ...m.proximas][0];

    const kpis = [
        { ic: '📋', l: 'Total de etapas', v: m.total, sub: `${m.abertas.length} em aberto`, cor: 'var(--acc)', alvo: 'progresso' },
        { ic: '🎯', l: 'Taxa de conclusão', v: m.taxa, s: '%', sub: `${m.concluidas} de ${m.total} concluídas`, cor: 'var(--ok)', alvo: 'progresso' },
        { ic: '⚡', l: 'Em andamento', v: m.andamento, sub: `${m.naoIniciado} ainda não iniciadas`, cor: 'var(--warn)', alvo: 'progresso' },
        { ic: '🔥', l: 'Vencidas', v: m.vencidas.length, sub: m.hoje.length ? `${m.hoje.length} ${dashPl(m.hoje.length, 'vence', 'vencem')} hoje` : 'nenhuma vence hoje', cor: m.vencidas.length ? 'var(--danger)' : 'var(--muted)', alvo: 'eventos' },
        { ic: '⏳', l: 'Próximos 7 dias', v: m.hoje.length + m.proximas.length, sub: proxPrazo ? `próximo: ${dashCurta(proxPrazo.prazo)}` : 'sem prazos à vista', cor: '#7c3aed', alvo: 'eventos' }
    ];

    const avisoHtml = typeof avisoAtivo !== 'undefined' && avisoAtivo
        ? `<div class="notice-wrap anim-item" style="margin-bottom:16px"><span class="n-icon">📌</span><div class="n-text"><span class="n-label">Recado do Administrador</span><span class="n-msg">${escH(avisoAtivo.mensagem)}</span></div></div>`
        : '';

    const vazioEscopo = '<div class="dash-vazio">Sem etapas para exibir.</div>';

    c.innerHTML = `
        <div class="dash-head anim-item">
            <div>
                <div class="home-greeting">${saudacao}, ${escH(currentUser.nome.split(' ')[0])}! 👋</div>
                <div class="home-sub">${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} · ${escH(currentWorkspace.nome)}</div>
            </div>
            <div class="proj-view-switch">
                <button class="btn btn-s btn-sm ${meu ? 'active' : ''}" onclick="dashTrocarEscopo('meu')">Meu trabalho</button>
                <button class="btn btn-s btn-sm ${meu ? '' : 'active'}" onclick="dashTrocarEscopo('workspace')">Workspace</button>
            </div>
        </div>
        ${avisoHtml}
        <div class="dash-kpis">
            ${kpis.map((k, i) => `
            <div class="dash-kpi anim-item" style="--c:${k.cor};animation-delay:${i * 0.05}s" onclick="switchTab('${k.alvo}')">
                <div class="dash-kpi-ic">${k.ic}</div>
                <div><div class="dash-kpi-v"><span class="dash-num" data-v="${k.v}" data-s="${k.s || ''}">${k.v}${k.s || ''}</span></div>
                <div class="dash-kpi-l">${k.l}</div><div class="dash-kpi-s">${k.sub}</div></div>
            </div>`).join('')}
        </div>
        <div class="dash-grid">
            <div class="dash-card dash-s4 anim-item" style="animation-delay:.1s">
                <div class="dash-ct">Distribuição por status</div>
                ${m.total ? `<div class="dash-donut-wrap">
                    ${dashDonut([
                        { nome: 'Concluídas', v: m.concluidas, cor: DASH_COR_STATUS.concluido },
                        { nome: 'Em andamento', v: m.andamento, cor: DASH_COR_STATUS.andamento },
                        { nome: 'Não iniciadas', v: m.naoIniciado, cor: DASH_COR_STATUS.naoIniciado }
                    ], m.taxa + '%', 'concluído')}
                    <div class="dash-leg">
                        <div class="dash-leg-i"><i style="background:${DASH_COR_STATUS.concluido}"></i>Concluídas<b>${m.concluidas}</b></div>
                        <div class="dash-leg-i"><i style="background:${DASH_COR_STATUS.andamento}"></i>Em andamento<b>${m.andamento}</b></div>
                        <div class="dash-leg-i"><i style="background:${DASH_COR_STATUS.naoIniciado}"></i>Não iniciadas<b>${m.naoIniciado}</b></div>
                    </div></div>` : vazioEscopo}
            </div>
            <div class="dash-card dash-s5 anim-item" style="animation-delay:.15s">
                <div class="dash-ct">Prazos por semana<span class="dash-cs">etapas em aberto · clique para abrir na Agenda</span></div>
                ${dashColunas(semanas)}
            </div>
            <div class="dash-card dash-s3 anim-item" style="animation-delay:.2s">
                <div class="dash-ct">Prioridade<span class="dash-cs">em aberto</span></div>
                ${m.abertas.length ? dashLinhasPrio(prios) : '<div class="dash-vazio">Nada em aberto.</div>'}
            </div>
            <div class="dash-card dash-s6 anim-item" style="animation-delay:.25s">
                <div class="dash-ct">Insights</div>
                <div class="dash-ins">${insights.map(dashRenderInsight).join('')}</div>
            </div>
            <div class="dash-card dash-s6 anim-item" style="animation-delay:.3s">
                <div class="dash-ct">Seu foco agora<span class="dash-cs">suas etapas mais urgentes</span></div>
                ${dashFoco(todas.filter(e => e.responsavel_id === currentUser.id))}
            </div>
            <div class="dash-card dash-s4 anim-item" style="animation-delay:.35s">
                <div class="dash-ct">Próximos 14 dias</div>
                ${dashLinhaTempo(escopo, eventos)}
            </div>
            <div class="dash-card ${meu ? 'dash-s8' : 'dash-s4'} anim-item" style="animation-delay:.4s">
                <div class="dash-ct">Progresso por projeto</div>
                ${porProj.length ? dashLinhasProj(porProj) : vazioEscopo}
            </div>
            ${meu ? '' : `<div class="dash-card dash-s4 anim-item" style="animation-delay:.45s">
                <div class="dash-ct">Carga por responsável</div>
                ${porResp.length ? dashLinhasResp(porResp) : vazioEscopo}
            </div>`}
        </div>`;
    dashAnimar(c);
}

async function carregarHome() {
    const c = document.getElementById('home-container');
    if (!dashDados) c.innerHTML = '<div class="loading-c"><div class="spinner"></div></div>';
    const hoje = dashHoje();
    const fim = new Date(hoje);
    fim.setDate(fim.getDate() + 14);
    const [rEt, rEv] = await Promise.all([
        sb.from('etapas')
            .select('id, nome, status, prazo, prioridade, responsavel_id, sessoes!inner(id, nome, projeto_id, projetos!inner(id, nome, workspace_id))')
            .eq('sessoes.projetos.workspace_id', currentWorkspace.id),
        sb.from('eventos').select('*')
            .eq('workspace_id', currentWorkspace.id)
            .gte('data', dashFmt(hoje)).lte('data', dashFmt(fim))
            .order('data', { ascending: true }).order('hora', { ascending: true })
    ]);
    if (rEt.error) {
        c.innerHTML = `<div class="empty-state"><div class="ei">⚠️</div><h3>Erro ao carregar o dashboard</h3><p>${escH(rEt.error.message)}</p></div>`;
        return;
    }
    dashDados = { etapas: rEt.data || [], eventos: rEv.data || [] };
    dashRender();
}