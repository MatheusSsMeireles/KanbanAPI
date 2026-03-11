document.addEventListener('DOMContentLoaded', () => {
    // Referências dos elementos DOM
    const urlForm = document.getElementById('url-form');
    const customUrlInput = document.getElementById('custom-url');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    const loader = document.getElementById('loader');
    const apiContainer = document.getElementById('api-container');
    const tabKanban = document.getElementById('tab-kanban');
    const tabOfficial = document.getElementById('tab-official');

    // Estado da Aplicação
    let currentTab = 'kanban';
    let customBaseUrl = '';

    // ==========================================
    // URLs (Caminhos dos arquivos de API)
    // ==========================================
    
    // 1. Kanban API: Lendo do arquivo que você vai subir no seu GitHub
    const URL_KANBAN_API = './api-1.json';
    
    // 2. Chatwoot Oficial API: Lendo direto do Github do Chatwoot (Online)
    const URL_OFFICIAL_API = 'https://raw.githubusercontent.com/chatwoot/chatwoot/develop/swagger/swagger.json';
    
    // ==========================================
    // CORREÇÕES VISUAIS DO SCALAR (TEMA E BOTÕES)
    // ==========================================
    // Injetamos regras globais via JS para forçar o Scalar a obedecer o Header da LexSec
    const scalarOverrides = document.createElement('style');
    scalarOverrides.innerHTML = `
        /* 1. Ocultar o botão Open API Client e links não desejados no rodapé */
        .scalar-app a[href*="client"],
        .scalar-app a[target="_blank"]:has(svg),
        .scalar-app .sidebar-footer a,
        .open-api-client-button {
            display: none !important;
        }

        /* 2. Ocultar o Toggle de Tema nativo do Scalar (Botão Sol/Lua de baixo) */
        .scalar-app button[role="switch"],
        .scalar-app .sidebar-footer button,
        .scalar-app button[aria-label*="mode" i],
        .scalar-app button[aria-label*="theme" i] {
            display: none !important;
        }

        /* 3. Forçar o Dark Mode do Scalar quando a LexSec estiver no modo escuro */
        html.dark {
            --scalar-color-background-1: #111827 !important;
            --scalar-color-background-2: #1f2937 !important;
            --scalar-color-background-3: #374151 !important;
            
            --scalar-color-text-1: #f3f4f6 !important;
            --scalar-color-text-2: #d1d5db !important;
            --scalar-color-text-3: #9ca3af !important;
            
            --scalar-color-border: #374151 !important;
            
            --scalar-sidebar-background-1: #111827 !important;
            --scalar-sidebar-color-1: #f3f4f6 !important;
            --scalar-sidebar-color-2: #9ca3af !important;
            --scalar-sidebar-border-color: #374151 !important;
            
            --scalar-color-accent: #3b82f6 !important;
            --scalar-button-1: #3b82f6 !important;
            --scalar-button-1-hover: #60a5fa !important;
            
            color-scheme: dark !important;
        }

        /* 4. Forçar o Light Mode do Scalar quando a LexSec estiver no modo claro */
        html:not(.dark) {
            --scalar-color-background-1: #ffffff !important;
            --scalar-color-background-2: #f9fafb !important;
            --scalar-color-background-3: #f3f4f6 !important;
            
            --scalar-color-text-1: #111827 !important;
            --scalar-color-text-2: #4b5563 !important;
            --scalar-color-text-3: #6b7280 !important;
            
            --scalar-color-border: #e5e7eb !important;
            
            --scalar-sidebar-background-1: #ffffff !important;
            --scalar-sidebar-color-1: #111827 !important;
            --scalar-sidebar-color-2: #4b5563 !important;
            --scalar-sidebar-border-color: #e5e7eb !important;
            
            --scalar-color-accent: #2563eb !important;
            --scalar-button-1: #2563eb !important;
            --scalar-button-1-hover: #1d4ed8 !important;
            
            color-scheme: light !important;
        }
    `;
    document.head.appendChild(scalarOverrides);

    // ==========================================
    // INICIALIZAÇÃO E GESTÃO DE TEMAS
    // ==========================================
    function initTheme() {
        if (!themeToggleBtn || !darkIcon || !lightIcon) return;
        
        if (document.documentElement.classList.contains('dark')) {
            lightIcon.classList.remove('hidden');
        } else {
            darkIcon.classList.remove('hidden');
        }

        themeToggleBtn.addEventListener('click', () => {
            darkIcon.classList.toggle('hidden');
            lightIcon.classList.toggle('hidden');

            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            }
        });
    }

    // ==========================================
    // LÓGICA DE ABAS E RENDERIZAÇÃO DA API
    // ==========================================
    window.changeTab = async function(tab) {
        if (currentTab === tab) return;
        currentTab = tab;

        // Troca as cores dos botões ao clicar
        if (tabKanban && tabOfficial) {
            if (tab === 'kanban') {
                tabKanban.className = 'px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center text-brand-600 bg-white dark:bg-gray-800 shadow-sm';
                tabOfficial.className = 'px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200';
            } else {
                tabOfficial.className = 'px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center text-brand-600 bg-white dark:bg-gray-800 shadow-sm';
                tabKanban.className = 'px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200';
            }
        }

        await loadApiSpec();
    };

    async function loadApiSpec() {
        showLoader();
        try {
            // Define de qual URL baixar baseado na aba clicada
            const fetchUrl = currentTab === 'kanban' ? URL_KANBAN_API : URL_OFFICIAL_API;
            const response = await fetch(fetchUrl);
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: Não foi possível acessar o arquivo.`);
            }

            const specData = await response.json();

            // Injeta a URL personalizada se o usuário preencheu o formulário
            if (customBaseUrl) {
                specData.servers = [{ url: customBaseUrl, description: 'Instância Personalizada' }];
            }

            renderScalar(specData);
        } catch (error) {
            console.error(error);
            if (apiContainer) {
                apiContainer.innerHTML = `<div class="p-8 text-center text-red-500 font-medium mt-10">
                    <i class="fa-solid fa-triangle-exclamation text-3xl mb-3"></i><br>
                    Erro ao carregar a documentação.<br>
                    <span class="text-sm text-gray-500 dark:text-gray-400">Detalhe técnico: ${error.message}</span><br><br>
                    Verifique se o arquivo <b>${currentTab === 'kanban' ? 'api-1.json' : 'oficial'}</b> está salvo corretamente no seu repositório.
                </div>`;
            }
        } finally {
            hideLoader();
        }
    }

    function renderScalar(specObj) {
        if (!apiContainer) return;
        
        // Limpa o container para não sobrepor telas antigas
        apiContainer.innerHTML = '';

        // Cria o elemento principal do Scalar
        const dataScript = document.createElement('script');
        dataScript.id = 'api-reference';
        dataScript.type = 'application/json';
        
        // Aplicamos configurações nativas do Scalar para tentar esconder nativamente os controles indesejados
        const scalarConfig = {
            theme: 'default',
            hideDarkModeToggle: true,
            hideClientButton: true
        };
        dataScript.setAttribute('data-configuration', JSON.stringify(scalarConfig));
        
        dataScript.textContent = JSON.stringify(specObj);
        apiContainer.appendChild(dataScript);

        // Verifica se o script motor do Scalar já foi injetado na página antes.
        const existingScalarScript = document.getElementById('scalar-engine-script');
        
        if (!existingScalarScript) {
            const scalarScript = document.createElement('script');
            scalarScript.id = 'scalar-engine-script';
            scalarScript.src = 'https://cdn.jsdelivr.net/npm/@scalar/api-reference';
            document.body.appendChild(scalarScript);
        } else {
            // Recarregamos forçadamente adicionando o script novamente no container
            const scalarScript = document.createElement('script');
            scalarScript.src = 'https://cdn.jsdelivr.net/npm/@scalar/api-reference';
            apiContainer.appendChild(scalarScript);
        }
    }

    // ==========================================
    // EVENTOS DE CONTROLE DA PÁGINA
    // ==========================================
    if (urlForm && customUrlInput) {
        urlForm.addEventListener('submit', (e) => {
            e.preventDefault();
            customBaseUrl = customUrlInput.value.trim();
            loadApiSpec(); // Recarrega a API com a nova base URL aplicada
        });
    }

    function showLoader() {
        if (loader) {
            loader.classList.remove('hidden');
            loader.classList.add('flex');
        }
        if (apiContainer) {
            apiContainer.classList.add('hidden');
        }
    }

    function hideLoader() {
        if (loader) {
            loader.classList.add('hidden');
            loader.classList.remove('flex');
        }
        if (apiContainer) {
            apiContainer.classList.remove('hidden');
        }
    }

    // Inicializa a aplicação
    initTheme();
    loadApiSpec();
});
