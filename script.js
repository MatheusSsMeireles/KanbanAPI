// ==========================================
// LÓGICA DE GERENCIAMENTO DE TEMA (DARK/LIGHT)
// ==========================================
const themeToggleBtn = document.getElementById('theme-toggle');
const darkIcon = document.getElementById('theme-toggle-dark-icon');
const lightIcon = document.getElementById('theme-toggle-light-icon');

// Verifica tema salvo ou preferência do sistema
function initializeTheme() {
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        lightIcon.classList.remove('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        darkIcon.classList.remove('hidden');
    }
}

// Botão de alternância
themeToggleBtn.addEventListener('click', function() {
    // Troca os ícones
    darkIcon.classList.toggle('hidden');
    lightIcon.classList.toggle('hidden');

    // Troca a classe no HTML e salva no localStorage
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('color-theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
    }
});


// ==========================================
// LÓGICA DE NAVEGAÇÃO (TABS)
// ==========================================
function switchTab(tabId) {
    // Oculta todas as sections
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    
    // Reseta estilo dos botões
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('text-brand-600', 'border-b-2', 'border-brand-600', 'dark:text-brand-500', 'dark:border-brand-500');
        el.classList.add('text-gray-500', 'dark:text-gray-400');
    });

    // Ativa section correta
    document.getElementById(tabId).classList.add('active');
    
    // Ativa botão correspondente
    const activeBtn = document.getElementById('btn-' + tabId);
    activeBtn.classList.remove('text-gray-500', 'dark:text-gray-400');
    activeBtn.classList.add('text-brand-600', 'border-b-2', 'border-brand-600', 'dark:text-brand-500', 'dark:border-brand-500');
}


// ==========================================
// INICIALIZAÇÃO E SWAGGER UI
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    initializeTheme();

    const savedUrl = localStorage.getItem('chatwoot_base_url');
    if (savedUrl) {
        document.getElementById('base_url').value = savedUrl;
        initSwagger(savedUrl);
    }

    // Intercepta o form de configuração
    document.getElementById('setup-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const baseUrl = document.getElementById('base_url').value.trim();
        localStorage.setItem('chatwoot_base_url', baseUrl);

        // Feedback visual
        const statusLabel = document.getElementById('config-status');
        statusLabel.classList.remove('hidden');
        setTimeout(() => statusLabel.classList.add('hidden'), 3000);

        await initSwagger(baseUrl);
        switchTab('kanban');
    });
});

async function initSwagger(baseUrl) {
    document.getElementById('swagger-placeholder').style.display = 'none';
    document.getElementById('swagger-error').classList.add('hidden');
    
    try {
        const response = await fetch('api-1.json');
        
        if (!response.ok) throw new Error("Não foi possível carregar o arquivo JSON.");
        
        const specData = await response.json();

        // Substitui a URL base estática pela URL da LexSec/Usuário
        specData.servers = [
            {
                url: `${baseUrl.replace(/\/$/, '')}/api/v1`,
                description: "Servidor Customizado"
            }
        ];

        window.ui = SwaggerUIBundle({
            spec: specData,
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
            ],
            plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "BaseLayout",
            onComplete: function() {
                console.log("Swagger UI carregado com sucesso!");
            }
        });
    } catch (error) {
        console.error("Erro ao montar o Swagger UI:", error);
        document.getElementById('swagger-error').classList.remove('hidden');
        document.getElementById('swagger-placeholder').style.display = 'block';
    }
}
