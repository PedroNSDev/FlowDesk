// ================= ELEMENTOS =================
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');

const displayName = document.getElementById('display-name');
const displayLevel = document.getElementById('display-level');

// ================= USUÁRIOS =================
const usuarios = [
    { id:1, name:"Admin", username:"admin", senha:"123", nivel:2 },
    { id:2, name:"User", username:"user", senha:"123", nivel:1 },
    { id:3, name:"Visitante", username:"visit", senha:"123", nivel:0 },
    { id:4, name:"Pedro", username:"pedro2", senha:"123", nivel:1 },
    { id:5, name:"vania", username:"vania10", senha:"123", nivel:1 }
    
];

// ================= STORAGE =================
const STORAGE_KEY = "sistema-projetos";

let currentUser = null;
let logs = [];

// ================= BANCO =================
let projetosDB = [
{
    id:1,
    nome:"Projeto A",
    descricao:"Sistema teste",
    usuarios:[1,2],
    sessoes:[
        {
            id:1,
            nome:"Sessão 1",
            descricao:"Frontend",
            usuarios:[2],
            etapas:[
                {
                    id:1,
                    nome:"Login",
                    descricao:"Tela login",
                    status:"Não iniciado",
                    usuarios:[2]
                }
            ]
        }
    ]
}
];

// ================= STORAGE =================
function salvarDados(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        projetos: projetosDB,
        logs: logs
    }));
}

function carregarDados(){
    const dados = localStorage.getItem(STORAGE_KEY);
    if(dados){
        const parsed = JSON.parse(dados);
        projetosDB = parsed.projetos || [];
        logs = parsed.logs || [];
    }
}

carregarDados();

// ================= HELPERS =================
function getUserById(id){
    return usuarios.find(u => u.id === id);
}

function formatStatus(status){
    return status
        .toLowerCase()
        .replace(" ", "-")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// ================= LOG =================
function addLog(msg){
    const data = new Date().toLocaleString();
    logs.push(`[${data}] ${currentUser.name}: ${msg}`);
}

// ================= LOGIN =================
function fazerLogin(){
    const u = usernameInput.value;
    const p = passwordInput.value;

    const user = usuarios.find(x=>x.username===u && x.senha===p);

    if(user){
        currentUser = user;
        loginError.style.display = 'none';
        mostrarTela(false);
        carregarDashboard();
    } else {
        loginError.style.display = 'block';
    }
}

function fazerLogout(){
    currentUser = null;

    document.getElementById('logs-container').classList.add('hidden');
    document.getElementById('log-entries').innerHTML = "";

    mostrarTela(true);
}

// ================= TELA =================
function mostrarTela(login=true){
    document.getElementById('login-screen').classList.toggle('hidden', !login);
    document.getElementById('dashboard-screen').classList.toggle('hidden', login);
}

/// ================= DASH =================
function carregarDashboard(){
    const displayUser = document.getElementById('display-user');
    
    displayUser.textContent = `${currentUser.name}: ${currentUser.username} (Nível ${currentUser.nivel}): /${currentUser.id}`;

    renderizarProjetos();

    const logsPanel = document.getElementById('logs-container');

    if(currentUser.nivel === 2){
        logsPanel.classList.remove('hidden');
        mostrarLogs();
    } else {
        logsPanel.classList.add('hidden');
    }
}

// ================= RENDER =================
function renderizarProjetos(){
    const container = document.getElementById('projetos-container');
    container.innerHTML = "";

    projetosDB.forEach(p=>{

        let sessoesHTML = p.sessoes.map(s=>{

          
            const colabsHTML = s.usuarios.map(uid=>{
                const u = getUserById(uid);
                if(!u) return "";

                return `
                    <div class="colab-item">
                        <b>${u.name}</b>
                        <small>(${u.username}) - Nível ${u.nivel}</small>
                    </div>
                `;
            }).join("");

            let etapasHTML = s.etapas.map(e=>`
                <div class="step-box status-${formatStatus(e.status)}">
                    <div>
                        <b>${e.nome}</b> (${e.status})<br>
                        <small>${e.descricao}</small>
                    </div>

                    ${currentUser.nivel>=1 ? `
                    <div style="display:flex; gap:5px;">
                        <button class="btn-small" onclick="editarEtapa(${p.id},${s.id},${e.id})">Editar</button>
                        <button class="btn-small" onclick="alterarStatus(${p.id},${s.id},${e.id})">Status</button>
                    </div>
                    ` : ""}
                </div>
            `).join("");

            // Utilizando <details> para expandir/retrair a Sessão
            return `
            <details class="session-box" open>
                <summary>
                    <h4>${s.nome}</h4>
                </summary>
                <div class="session-content">
                    <p>${s.descricao}</p>

                    <button class="btn-small" onclick="toggleColaboradores(${s.id})">
                        👥 Colaboradores
                    </button>

                    <div id="colab-${s.id}" class="colaboradores-box hidden">
                        ${colabsHTML || "<p>Nenhum colaborador</p>"}
                    </div>

                    ${etapasHTML}

                    ${currentUser.nivel>=1 ? `<button onclick="criarEtapa(${p.id},${s.id})">+ Etapa</button>`:""}
                </div>
            </details>
            `;
        }).join("");

        // Utilizando <details> para expandir/retrair o Projeto
        container.innerHTML += `
        <details class="project-card" open>
            <summary>
                <h3>${p.nome}</h3>
                <span class="project-desc">${p.descricao}</span>
            </summary>
            <div class="project-content">
                ${sessoesHTML}
                ${currentUser.nivel>=1 ? `<button onclick="criarSessao(${p.id})">+ Sessão</button>`:""}
            </div>
        </details>
        `;
    });

    if(currentUser.nivel>=1){
        container.innerHTML += `<button onclick="criarProjeto()">+ Projeto</button>`;
    }
}
// ================= COLABORADORES =================
function toggleColaboradores(sessaoId){
    const div = document.getElementById(`colab-${sessaoId}`);
    div.classList.toggle('hidden');
}

// ================= CRIAR =================
function criarProjeto(){
    const nome = prompt("Nome do projeto:");
    if(!nome) return;

    projetosDB.push({
        id:Date.now(),
        nome,
        descricao:"Novo projeto",
        usuarios:[currentUser.id],
        sessoes:[]
    });

    addLog("Criou projeto: "+nome);
    salvarDados();
    renderizarProjetos();
}
function criarSessao(pId){
    const nome = prompt("Nome da sessão:");
    if(!nome) return;

    const proj = projetosDB.find(p=>p.id===pId);

    // PLACEHOLDER :V
    garantirUsuarioNoProjeto(proj, currentUser.id);

    proj.sessoes.push({
        id:Date.now(),
        nome,
        descricao:"Nova sessão",
        usuarios:[currentUser.id],
        etapas:[]
    });

    addLog("Criou sessão: "+nome);
    salvarDados();
    renderizarProjetos();
}function criarEtapa(pId,sId){
    const nome = prompt("Nome da etapa:");
    if(!nome) return;

    const proj = projetosDB.find(p=>p.id===pId);
    const sess = proj.sessoes.find(s=>s.id===sId);
        // PLACEHOLDER :V
    garantirUsuarioNoProjeto(proj, currentUser.id);
    if(!sess.usuarios.includes(currentUser.id)){
        sess.usuarios.push(currentUser.id);
    }

    sess.etapas.push({
        id:Date.now(),
        nome,
        descricao:"Nova etapa",
        status:"Não iniciado",
        usuarios:[currentUser.id]
    });

    addLog("Criou etapa: "+nome);
    salvarDados();
    renderizarProjetos();
}

// ================= EDITAR =================
function editarEtapa(pId,sId,eId){
    const proj = projetosDB.find(p=>p.id===pId);
    const sess = proj.sessoes.find(s=>s.id===sId);
    const etapa = sess.etapas.find(e=>e.id===eId);

    const novo = prompt("Novo nome:", etapa.nome);
    if(!novo) return;

    etapa.nome = novo;

    addLog("Editou etapa: "+novo);
    salvarDados();
    renderizarProjetos();
}

// ================= STATUS =================
function alterarStatus(pId,sId,eId){
    const proj = projetosDB.find(p=>p.id===pId);
    const sess = proj.sessoes.find(s=>s.id===sId);
    const etapa = sess.etapas.find(e=>e.id===eId);

    const ordem = ["Não iniciado", "Em progresso", "Finalizado"];

    let index = ordem.indexOf(etapa.status);
    index = (index + 1) % ordem.length;

    etapa.status = ordem[index];

    addLog("Alterou status para: " + etapa.status);
    salvarDados();
    renderizarProjetos();
}
function garantirUsuarioNoProjeto(proj, userId){
    if(!proj.usuarios.includes(userId)){
        proj.usuarios.push(userId);
    }
}



// ================= LOGS =================
function mostrarLogs(){
    if(currentUser.nivel !== 2) return;

    const div = document.getElementById('logs-container');
    div.classList.remove('hidden');

    document.getElementById('log-entries').innerHTML =
        logs.map(l=>`<p>> ${l}</p>`).join("");
}


