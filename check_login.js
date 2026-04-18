// check_login.js - Verificação de login para todas as páginas
const SUPABASE_URL = 'https://xnyegqtpjhuymazcdwzt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gRlCJtxzX0Rzt14AKeOzww_K4ThHZt5';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkLogin() {
    const userId = localStorage.getItem('fd-user-id');
    if (!userId) {
        if (window.location.pathname !== '/index.html') {
            window.location.href = 'index.html';
        }
        return false;
    }
    try {
        const { data: user } = await sb.from('usuarios').select('id').eq('id', userId).single();
        if (!user) {
            localStorage.removeItem('fd-user-id');
            if (window.location.pathname !== '/index.html') {
                window.location.href = 'index.html';
            }
            return false;
        }
    } catch (e) {
        console.error('Erro ao verificar login:', e);
        localStorage.removeItem('fd-user-id');
        if (window.location.pathname !== '/index.html') {
            window.location.href = 'index.html';
        }
        return false;
    }

    return true;
}

// Executar automaticamente ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
});