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

        // Cria o elemento de configuração que o Scalar lê
        const dataScript = document.createElement('script');
        dataScript.id = 'api-reference';
        dataScript.type = 'application/json';
        dataScript.textContent = JSON.stringify(specObj);
        apiContainer.appendChild(dataScript);

        // Verifica se o script motor do Scalar já foi injetado na página antes.
        // Isso evita erros no console e melhora a velocidade ao alternar entre as abas.
        const existingScalarScript = document.getElementById('scalar-engine-script');
        
        if (!existingScalarScript) {
            const scalarScript = document.createElement('script');
            scalarScript.id = 'scalar-engine-script';
            scalarScript.src = 'https://cdn.jsdelivr.net/npm/@scalar/api-reference';
            document.body.appendChild(scalarScript);
        } else {
            // Se o motor já está rodando, recarregamos forçadamente adicionando o script novamente
            // mas apenas no escopo do container para que ele re-renderize os dados novos.
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
