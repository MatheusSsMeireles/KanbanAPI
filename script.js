document.addEventListener('DOMContentLoaded', () => {
    // Referências DOM Globais
    const globalSettingsForm = document.getElementById('global-settings-form');
    const customUrlInput = document.getElementById('custom-url');
    const globalTokenInput = document.getElementById('global-token');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    const langToggleBtn = document.getElementById('lang-toggle');
    const currentLangText = document.getElementById('current-lang-text');
    const loader = document.getElementById('loader');
    const apiRenderArea = document.getElementById('api-render-area');
    const sidebarNav = document.getElementById('sidebar-nav');
    const searchInput = document.getElementById('search-endpoints');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobile-overlay');

    // Estado Global
    let currentTab = 'kanban';
    let customBaseUrl = '';
    let globalToken = '';
    let apiData = null; 
    let currentLang = localStorage.getItem('api-lang') || 'pt';

    // URLs
    const URL_KANBAN_API = './api-1.json';
    const URL_OFFICIAL_API = 'https://raw.githubusercontent.com/chatwoot/chatwoot/develop/swagger/swagger.json';

    // ==========================================
    // 1. DICIONÁRIO DE TRADUÇÃO (PT/EN)
    // ==========================================
    const uiTranslations = {
        pt: {
            searchPlaceholder: "Buscar rotas...",
            loading: "Construindo documentação interativa...",
            baseUrlTitle: "Base URL para as requisições",
            params: "Parâmetros da Requisição",
            required: "Obrigatório",
            optional: "Opcional",
            noDesc: "Sem descrição disponível.",
            codeExample: "Exemplo de Código",
            testApi: "Testar API",
            requestExample: "Exemplo de Requisição",
            responseSuccess: "Exemplo de Resposta (Sucesso)",
            noExample: "Nenhum exemplo estruturado retornado.",
            fillFields: "Preencha os campos abaixo para testar esta rota em tempo real. O <code>api_access_token</code> será puxado do cabeçalho da página.",
            sendRequest: "Enviar Requisição",
            serverResponse: "Resposta do Servidor:",
            bodyLabel: "Corpo (JSON)",
            invalidJson: "O formato do JSON no Corpo é inválido. Corrija e tente novamente."
        },
        en: {
            searchPlaceholder: "Search endpoints...",
            loading: "Building interactive documentation...",
            baseUrlTitle: "Base URL for requests",
            params: "Request Parameters",
            required: "Required",
            optional: "Optional",
            noDesc: "No description available.",
            codeExample: "Code Example",
            testApi: "Test API",
            requestExample: "Request Example",
            responseSuccess: "Response Example (Success)",
            noExample: "No structured example returned.",
            fillFields: "Fill the fields below to test this route in real time. The <code>api_access_token</code> will be fetched from the page header.",
            sendRequest: "Send Request",
            serverResponse: "Server Response:",
            bodyLabel: "Body (JSON)",
            invalidJson: "Invalid JSON format in Body. Please fix and try again."
        }
    };

    const categoryDictPT = {
        "Account Users": "Usuários da Conta",
        "Account AgentBots": "Robôs da Conta",
        "Account": "Conta",
        "Agents": "Agentes",
        "Audit Logs": "Logs de Auditoria",
        "Canned Responses": "Respostas Rápidas",
        "Contacts": "Contatos",
        "Contact Labels": "Marcadores de Contato",
        "Conversation Assignments": "Atribuições de Conversa",
        "Conversation Labels": "Marcadores de Conversa",
        "Conversations": "Conversas",
        "Custom Attributes": "Atributos Personalizados",
        "Custom Filters": "Filtros Personalizados",
        "Inboxes": "Caixas de Entrada",
        "Integrations": "Integrações",
        "Messages": "Mensagens",
        "Profile": "Perfil",
        "Reports": "Relatórios",
        "Teams": "Equipes",
        "Users": "Usuários",
        "Webhooks": "Webhooks",
        "Funnels": "Funis de Vendas",
        "Kanban Items": "Itens do Kanban",
        "Checklist": "Checklists",
        "Notes": "Notas",
        "Scheduled Messages": "Mensagens Agendadas",
        "Debug": "Depuração"
    };

    function translateCategory(text, lang) {
        if (!text) return text;
        if (lang === 'pt' && categoryDictPT[text]) return categoryDictPT[text];
        if (lang === 'en') {
            // Conversão básica reversa se estiver traduzindo o Kanban (PT -> EN)
            const reverseDict = Object.fromEntries(Object.entries(categoryDictPT).map(([k, v]) => [v, k]));
            if (reverseDict[text]) return reverseDict[text];
        }
        return text;
    }

    function translateEndpointTitle(text, lang) {
        if (!text) return "";
        let t = text;
        if (lang === 'pt') {
            t = t.replace(/^List all /i, "Listar todos os ");
            t = t.replace(/^List /i, "Listar ");
            t = t.replace(/^Create an /i, "Criar ");
            t = t.replace(/^Create a /i, "Criar ");
            t = t.replace(/^Create /i, "Criar ");
            t = t.replace(/^Get an /i, "Obter ");
            t = t.replace(/^Get a /i, "Obter ");
            t = t.replace(/^Get /i, "Obter ");
            t = t.replace(/^Update an /i, "Atualizar ");
            t = t.replace(/^Update a /i, "Atualizar ");
            t = t.replace(/^Update /i, "Atualizar ");
            t = t.replace(/^Delete an /i, "Excluir ");
            t = t.replace(/^Delete a /i, "Excluir ");
            t = t.replace(/^Delete /i, "Excluir ");

            t = t.replace(/details/gi, "detalhes");
            t = t.replace(/Account Users/gi, "Usuários da Conta");
            t = t.replace(/Account User/gi, "Usuário da Conta");
            t = t.replace(/AgentBots/gi, "Robôs");
            t = t.replace(/AgentBot/gi, "Robô");
            t = t.replace(/Agent Bot/gi, "Robô");
            t = t.replace(/Agent/gi, "Agente");
            t = t.replace(/Account/gi, "Conta");
            t = t.replace(/Users/gi, "Usuários");
            t = t.replace(/User/gi, "Usuário");
            t = t.replace(/Conversations/gi, "Conversas");
            t = t.replace(/Conversation/gi, "Conversa");
            t = t.replace(/Messages/gi, "Mensagens");
            t = t.replace(/Message/gi, "Mensagem");
            t = t.replace(/Inboxes/gi, "Caixas de Entrada");
            t = t.replace(/Inbox/gi, "Caixa de Entrada");
            t = t.replace(/Contacts/gi, "Contatos");
            t = t.replace(/Contact/gi, "Contato");
            t = t.replace(/Teams/gi, "Equipes");
            t = t.replace(/Team/gi, "Equipe");
        } else if (lang === 'en') {
            t = t.replace(/^Listar todos os /i, "List all ");
            t = t.replace(/^Listar /i, "List ");
            t = t.replace(/^Criar um /i, "Create a ");
            t = t.replace(/^Criar uma /i, "Create a ");
            t = t.replace(/^Criar /i, "Create ");
            t = t.replace(/^Obter detalhes /i, "Get details ");
            t = t.replace(/^Obter /i, "Get ");
            t = t.replace(/^Atualizar /i, "Update ");
            t = t.replace(/^Excluir /i, "Delete ");
            t = t.replace(/^Mover /i, "Move ");
            t = t.replace(/^Atribuir /i, "Assign ");
            t = t.replace(/^Remover /i, "Remove ");
            t = t.replace(/^Buscar /i, "Search ");

            t = t.replace(/Funis de Vendas/gi, "Funnels");
            t = t.replace(/Itens do Kanban/gi, "Kanban Items");
            t = t.replace(/agente/gi, "agent");
            t = t.replace(/em massa/gi, "in bulk");
            t = t.replace(/etapa/gi, "stage");
        }
        return t;
    }

    // ==========================================
    // 2. UTILITÁRIOS E UI
    // ==========================================
    function initTheme() {
        if (!themeToggleBtn) return;
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) lightIcon.classList.remove('hidden');
        else darkIcon.classList.remove('hidden');

        themeToggleBtn.addEventListener('click', () => {
            darkIcon.classList.toggle('hidden');
            lightIcon.classList.toggle('hidden');
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('color-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        });
    }

    function initLang() {
        currentLangText.innerText = currentLang.toUpperCase();
        searchInput.placeholder = uiTranslations[currentLang].searchPlaceholder;
        document.getElementById('loader-text').innerText = uiTranslations[currentLang].loading;

        langToggleBtn.addEventListener('click', () => {
            currentLang = currentLang === 'pt' ? 'en' : 'pt';
            localStorage.setItem('api-lang', currentLang);
            currentLangText.innerText = currentLang.toUpperCase();
            searchInput.placeholder = uiTranslations[currentLang].searchPlaceholder;
            document.getElementById('loader-text').innerText = uiTranslations[currentLang].loading;
            
            // Recarrega a renderização para aplicar as traduções
            if (apiData) {
                renderSidebar(apiData);
                renderMainContent(apiData);
            }
        });
    }

    if(mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
            mobileOverlay.classList.toggle('hidden');
        });
        mobileOverlay.addEventListener('click', () => {
            sidebar.classList.add('-translate-x-full');
            mobileOverlay.classList.add('hidden');
        });
    }

    window.changeTab = async function(tab) {
        if (currentTab === tab) return;
        currentTab = tab;
        
        document.querySelectorAll('#tab-kanban, #tab-official').forEach(btn => {
            btn.className = "px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200";
        });
        const activeBtnDesktop = document.getElementById(`tab-${tab}`);
        if(activeBtnDesktop) activeBtnDesktop.className = "px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center text-brand-600 bg-white dark:bg-gray-900 shadow-sm";

        if(window.innerWidth < 768) {
            sidebar.classList.add('-translate-x-full');
            mobileOverlay.classList.add('hidden');
        }

        await loadApiSpec();
    };

    window.syntaxHighlight = function(json) {
        if (typeof json != 'string') json = JSON.stringify(json, undefined, 2);
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                    match = match.replace(/"/g, '');
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    window.copyToClipboard = function(text, btnId) {
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById(btnId);
            if(btn) {
                const originalHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check text-emerald-500"></i>';
                setTimeout(() => btn.innerHTML = originalHtml, 2000);
            }
        });
    }

    window.switchPlaygroundTab = function(endpointId, tabType) {
        const codeTabBtn = document.getElementById(`tab-btn-code-${endpointId}`);
        const testTabBtn = document.getElementById(`tab-btn-test-${endpointId}`);
        const codeView = document.getElementById(`view-code-${endpointId}`);
        const testView = document.getElementById(`view-test-${endpointId}`);

        const activeClass = "border-b-2 border-brand-500 text-gray-900 dark:text-white font-medium";
        const inactiveClass = "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300";

        if (tabType === 'code') {
            codeTabBtn.className = `px-4 py-2 text-sm transition-colors ${activeClass}`;
            testTabBtn.className = `px-4 py-2 text-sm transition-colors ${inactiveClass}`;
            codeView.classList.remove('hidden');
            testView.classList.add('hidden');
        } else {
            testTabBtn.className = `px-4 py-2 text-sm transition-colors ${activeClass}`;
            codeTabBtn.className = `px-4 py-2 text-sm transition-colors ${inactiveClass}`;
            testView.classList.remove('hidden');
            codeView.classList.add('hidden');
        }
    }

    // ==========================================
    // 3. PARSER DO OPENAPI
    // ==========================================
    function resolveRef(ref, spec) {
        if(!ref) return null;
        const parts = ref.replace('#/', '').split('/');
        let current = spec;
        for(let part of parts) {
            if(current[part] === undefined) return null;
            current = current[part];
        }
        return current;
    }

    function getExampleFromSchema(schema, spec, depth = 0) {
        if(depth > 3) return {};
        if (!schema) return null;
        if (schema.$ref) schema = resolveRef(schema.$ref, spec) || schema;
        if (schema.example !== undefined) return schema.example;

        if (schema.type === 'object' || schema.properties) {
            let obj = {};
            for (let key in schema.properties) {
                let prop = schema.properties[key];
                if (prop.$ref) prop = resolveRef(prop.$ref, spec) || prop;
                obj[key] = prop.example !== undefined ? prop.example : getExampleFromSchema(prop, spec, depth + 1);
            }
            return obj;
        }
        if (schema.type === 'array' && schema.items) {
            return [getExampleFromSchema(schema.items, spec, depth + 1)];
        }
        switch(schema.type) {
            case 'string': return "string";
            case 'integer': case 'number': return 0;
            case 'boolean': return true;
            default: return "exemplo";
        }
    }

    function processApiSpec(rawSpec) {
        const baseUrl = customBaseUrl || (rawSpec.servers && rawSpec.servers[0] ? rawSpec.servers[0].url : (rawSpec.host ? `https://${rawSpec.host}${rawSpec.basePath || ''}` : 'https://api.chatwoot.com/api/v1'));
        let categories = {};

        if(rawSpec.tags) {
            rawSpec.tags.forEach(t => {
                categories[t.name] = { name: t.name, description: t.description, endpoints: [] };
            });
        }

        if(rawSpec.paths) {
            Object.keys(rawSpec.paths).forEach(path => {
                const methods = rawSpec.paths[path];
                Object.keys(methods).forEach(method => {
                    if(method === 'parameters') return;
                    
                    const op = methods[method];
                    const tagName = (op.tags && op.tags.length > 0) ? op.tags[0] : 'Geral';
                    
                    if(!categories[tagName]) categories[tagName] = { name: tagName, description: '', endpoints: [] };

                    const endpoint = {
                        id: op.operationId || `${method}-${path.replace(/\//g, '-')}`,
                        method: method.toUpperCase(),
                        path: path,
                        fullUrl: `${baseUrl}${path}`,
                        summary: op.summary || 'Sem título',
                        description: op.description || '',
                        parameters: op.parameters || [],
                        bodyExample: null,
                        responseExample: null
                    };

                    if(op.requestBody && op.requestBody.content && op.requestBody.content['application/json']) {
                        const content = op.requestBody.content['application/json'];
                        endpoint.bodyExample = content.example || getExampleFromSchema(content.schema, rawSpec);
                    } else if (op.parameters) {
                        const bodyParam = op.parameters.find(p => p.in === 'body');
                        if (bodyParam && bodyParam.schema) endpoint.bodyExample = getExampleFromSchema(bodyParam.schema, rawSpec);
                    }

                    if(op.responses) {
                        const successCode = op.responses['200'] ? '200' : (op.responses['201'] ? '201' : null);
                        if(successCode) {
                            const res = op.responses[successCode];
                            if(res.content && res.content['application/json']) {
                                const content = res.content['application/json'];
                                endpoint.responseExample = content.example || getExampleFromSchema(content.schema, rawSpec);
                            } else if (res.schema) {
                                endpoint.responseExample = getExampleFromSchema(res.schema, rawSpec);
                            } else {
                                endpoint.responseExample = { success: true };
                            }
                        }
                    }

                    categories[tagName].endpoints.push(endpoint);
                });
            });
        }

        return {
            info: rawSpec.info || {},
            baseUrl: baseUrl,
            categories: Object.values(categories).filter(c => c.endpoints.length > 0)
        };
    }

    // ==========================================
    // 4. RENDERIZAÇÃO
    // ==========================================
    function getMethodStyle(method) {
        const styles = {
            'GET': { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800', label: 'GET' },
            'POST': { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-800', label: 'POST' },
            'PUT': { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800', label: 'PUT' },
            'PATCH': { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-200 dark:border-orange-800', label: 'PATCH' },
            'DELETE': { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30', border: 'border-rose-200 dark:border-rose-800', label: 'DELETE' }
        };
        return styles[method] || { color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200', label: method };
    }

    function renderSidebar(data) {
        let html = '';
        data.categories.forEach(cat => {
            const translatedCat = translateCategory(cat.name, currentLang);
            html += `
                <div class="mb-6 endpoint-group" data-tag="${cat.name.toLowerCase()}">
                    <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">${translatedCat}</h3>
                    <ul class="space-y-1">
            `;
            cat.endpoints.forEach(ep => {
                const translatedSum = translateEndpointTitle(ep.summary, currentLang);
                html += `
                    <li>
                        <a href="#${ep.id}" class="sidebar-link block px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 rounded-md transition-colors" data-search="${translatedSum.toLowerCase()} ${ep.path.toLowerCase()}">
                            ${translatedSum}
                        </a>
                    </li>
                `;
            });
            html += `</ul></div>`;
        });
        sidebarNav.innerHTML = html;
    }

    function renderMainContent(data) {
        const uiText = uiTranslations[currentLang];
        
        let html = `
            <div class="mb-16 border-b border-gray-200 dark:border-gray-800 pb-12 pt-8">
                <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">${data.info.title || 'API Documentation'}</h1>
                <p class="text-lg text-gray-600 dark:text-gray-400 max-w-3xl prose dark:prose-invert">${data.info.description ? data.info.description.replace(/\n/g, '<br>') : ''}</p>
                
                <div class="mt-8 flex flex-col md:flex-row gap-4 items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 max-w-2xl">
                    <div class="flex items-center flex-1 w-full">
                        <i class="fa-solid fa-server text-brand-500 text-xl mr-4"></i>
                        <div class="overflow-hidden">
                            <p class="text-sm font-semibold text-gray-900 dark:text-white">${uiText.baseUrlTitle}</p>
                            <code class="text-sm text-gray-600 dark:text-gray-400 font-mono truncate block">${data.baseUrl}</code>
                        </div>
                    </div>
                </div>
            </div>
        `;

        data.categories.forEach(cat => {
            const translatedCat = translateCategory(cat.name, currentLang);
            html += `<div class="mb-20">`;
            
            // BUG FIX APLICADO AQUI: Removido as classes "sticky top-[72px]" para o texto não ficar por cima
            html += `<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8 py-4 border-b border-gray-100 dark:border-gray-800">${translatedCat}</h2>`;
            
            cat.endpoints.forEach(ep => {
                const style = getMethodStyle(ep.method);
                const translatedSum = translateEndpointTitle(ep.summary, currentLang);
                
                const pathParams = ep.parameters.filter(p => p.in === 'path');
                const queryParams = ep.parameters.filter(p => p.in === 'query');

                // Tabela Esquerda (Teoria)
                let paramsHtml = '';
                if(pathParams.length > 0 || queryParams.length > 0) {
                    paramsHtml += `<h4 class="text-sm font-semibold text-gray-900 dark:text-white mt-8 mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">${uiText.params}</h4>`;
                    paramsHtml += `<ul class="space-y-4">`;
                    [...pathParams, ...queryParams].forEach(p => {
                        paramsHtml += `
                            <li class="flex flex-col border-b border-gray-100 dark:border-gray-800/50 pb-4 last:border-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="font-mono text-sm text-gray-900 dark:text-white font-medium">${p.name}</span>
                                    <span class="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">${p.in === 'query' ? 'Query' : 'Path'}</span>
                                    ${p.required ? `<span class="text-[10px] uppercase font-bold text-rose-500">${uiText.required}</span>` : `<span class="text-[10px] uppercase text-gray-400">${uiText.optional}</span>`}
                                </div>
                                <span class="text-sm text-gray-600 dark:text-gray-400">${p.description || uiText.noDesc}</span>
                            </li>
                        `;
                    });
                    paramsHtml += `</ul>`;
                }

                // Códigos cURL
                const jsonBodyStr = ep.bodyExample ? JSON.stringify(ep.bodyExample, null, 2) : '';
                const escapedBodyStr = jsonBodyStr.replace(/'/g, "'\\''"); 
                let curlCode = `curl -X ${ep.method} "${ep.fullUrl}" \\\n  -H "api_access_token: SEU_TOKEN_AQUI"`;
                if(ep.bodyExample) curlCode += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${escapedBodyStr}'`;

                // Formulário de Teste (Playground)
                let testInputsHtml = '';
                pathParams.forEach(p => {
                    testInputsHtml += `
                        <div class="mb-3">
                            <label class="block text-xs text-gray-400 mb-1">${p.name} <span class="text-rose-500">*</span></label>
                            <input type="text" id="input-${ep.id}-path-${p.name}" class="playground-input" placeholder="${p.example || ''}">
                        </div>`;
                });
                queryParams.forEach(p => {
                    testInputsHtml += `
                        <div class="mb-3">
                            <label class="block text-xs text-gray-400 mb-1">${p.name} ${p.required ? '<span class="text-rose-500">*</span>' : ''}</label>
                            <input type="text" id="input-${ep.id}-query-${p.name}" class="playground-input" placeholder="${p.example || ''}">
                        </div>`;
                });

                let bodyEditorHtml = '';
                if (ep.bodyExample && (ep.method === 'POST' || ep.method === 'PUT' || ep.method === 'PATCH')) {
                    bodyEditorHtml = `
                        <div class="mb-4">
                            <label class="block text-xs text-gray-400 mb-1">${uiText.bodyLabel}</label>
                            <textarea id="input-${ep.id}-body" rows="6" class="playground-input font-mono text-xs">${jsonBodyStr}</textarea>
                        </div>
                    `;
                }

                // LAYOUT DE 2 COLUNAS
                html += `
                    <div id="${ep.id}" class="endpoint-card pt-12 pb-16 border-b border-gray-100 dark:border-gray-800/50 flex flex-col xl:flex-row gap-12">
                        
                        <!-- Coluna 1: Explicação -->
                        <div class="xl:w-5/12 flex-shrink-0">
                            <div class="flex items-center gap-3 mb-4">
                                <span class="text-xs font-bold px-2.5 py-1 rounded border ${style.bg} ${style.color} ${style.border}">${style.label}</span>
                            </div>
                            
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${translatedSum}</h3>
                            <div class="flex items-center bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded p-2 mb-4 overflow-x-auto">
                                <code class="text-sm font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">${ep.path}</code>
                            </div>

                            <div class="text-sm text-gray-600 dark:text-gray-400 prose dark:prose-invert">
                                ${ep.description ? ep.description.replace(/\n/g, '<br>') : ''}
                            </div>

                            ${paramsHtml}
                        </div>

                        <!-- Coluna 2: Playground e Códigos -->
                        <div class="xl:w-7/12 flex-shrink-0 flex flex-col bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-xl self-start sticky top-28">
                            
                            <!-- Tabs Superiores -->
                            <div class="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937]">
                                <button id="tab-btn-code-${ep.id}" onclick="switchPlaygroundTab('${ep.id}', 'code')" class="px-4 py-2 text-sm border-b-2 border-brand-500 text-gray-900 dark:text-white font-medium transition-colors">${uiText.codeExample}</button>
                                <button id="tab-btn-test-${ep.id}" onclick="switchPlaygroundTab('${ep.id}', 'test')" class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"><i class="fa-solid fa-play text-[10px] mr-1"></i> ${uiText.testApi}</button>
                            </div>

                            <!-- VIEW 1: Exemplo de Código -->
                            <div id="view-code-${ep.id}" class="flex flex-col">
                                <div class="bg-[#1f2937] px-4 py-2 flex items-center justify-between border-b border-gray-800">
                                    <span class="text-xs font-medium text-gray-400">${uiText.requestExample}</span>
                                    <button id="copy-curl-${ep.id}" onclick="copyToClipboard(\`${curlCode.replace(/`/g, '\\`')}\`, 'copy-curl-${ep.id}')" class="text-gray-400 hover:text-white transition-colors" title="Copiar"><i class="fa-solid fa-copy"></i></button>
                                </div>
                                <div class="p-4 bg-[#111827] overflow-x-auto">
                                    <pre><code class="text-sm text-gray-300 font-mono">${curlCode}</code></pre>
                                </div>
                                <div class="bg-[#1f2937] px-4 py-2 flex items-center justify-between border-y border-gray-800">
                                    <span class="text-xs font-medium text-gray-400">${uiText.responseSuccess}</span>
                                </div>
                                <div class="p-4 bg-[#111827] overflow-x-auto max-h-[300px] overflow-y-auto">
                                    <pre><code class="text-sm font-mono leading-relaxed block">${ep.responseExample ? syntaxHighlight(ep.responseExample) : `<span class="text-gray-500">${uiText.noExample}</span>`}</code></pre>
                                </div>
                            </div>

                            <!-- VIEW 2: Testar API (Playground) -->
                            <div id="view-test-${ep.id}" class="hidden flex flex-col p-4 bg-white dark:bg-[#111827]">
                                <div class="mb-4">
                                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">${uiText.fillFields}</p>
                                    ${testInputsHtml}
                                    ${bodyEditorHtml}
                                </div>
                                
                                <button onclick="executeApiCall('${ep.id}', '${ep.method}', '${ep.fullUrl}')" class="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <i id="spinner-${ep.id}" class="fa-solid fa-circle-notch animate-spin hidden"></i>
                                    <span>${uiText.sendRequest}</span>
                                </button>

                                <!-- Área de Resultado da Chamada -->
                                <div id="result-area-${ep.id}" class="mt-6 hidden">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">${uiText.serverResponse}</span>
                                        <span id="status-badge-${ep.id}" class="text-xs font-bold px-2 py-0.5 rounded">200 OK</span>
                                    </div>
                                    <div class="bg-gray-50 dark:bg-[#0a0f1c] border border-gray-200 dark:border-gray-800 rounded-lg p-3 max-h-[300px] overflow-y-auto overflow-x-auto">
                                        <pre><code id="result-json-${ep.id}" class="text-xs font-mono"></code></pre>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        });

        apiRenderArea.innerHTML = html;
    }

    // ==========================================
    // 5. LÓGICA DE CHAMADA DA API (PLAYGROUND)
    // ==========================================
    window.executeApiCall = async function(endpointId, method, originalUrl) {
        const spinner = document.getElementById(`spinner-${endpointId}`);
        const resultArea = document.getElementById(`result-area-${endpointId}`);
        const statusBadge = document.getElementById(`status-badge-${endpointId}`);
        const resultJson = document.getElementById(`result-json-${endpointId}`);
        const uiText = uiTranslations[currentLang];
        
        globalToken = globalTokenInput.value.trim();

        spinner.classList.remove('hidden');
        resultArea.classList.add('hidden');
        
        let finalUrl = originalUrl;
        let queryParams = [];

        const pathInputs = document.querySelectorAll(`[id^="input-${endpointId}-path-"]`);
        pathInputs.forEach(input => {
            const paramName = input.id.replace(`input-${endpointId}-path-`, '');
            const val = input.value.trim();
            finalUrl = finalUrl.replace(`{${paramName}}`, val ? encodeURIComponent(val) : `{${paramName}}`);
        });

        const queryInputs = document.querySelectorAll(`[id^="input-${endpointId}-query-"]`);
        queryInputs.forEach(input => {
            const paramName = input.id.replace(`input-${endpointId}-query-`, '');
            const val = input.value.trim();
            if(val) queryParams.push(`${encodeURIComponent(paramName)}=${encodeURIComponent(val)}`);
        });

        if(queryParams.length > 0) {
            finalUrl += `?${queryParams.join('&')}`;
        }

        let fetchOptions = {
            method: method,
            headers: {
                'api_access_token': globalToken || 'TOKEN_NAO_INFORMADO',
                'Accept': 'application/json'
            }
        };

        const bodyInput = document.getElementById(`input-${endpointId}-body`);
        if (bodyInput && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            fetchOptions.headers['Content-Type'] = 'application/json';
            try {
                fetchOptions.body = JSON.stringify(JSON.parse(bodyInput.value)); 
            } catch (e) {
                spinner.classList.add('hidden');
                alert(uiText.invalidJson);
                return;
            }
        }

        try {
            const response = await fetch(finalUrl, fetchOptions);
            const contentType = response.headers.get("content-type");
            let responseData;
            
            if (contentType && contentType.indexOf("application/json") !== -1) {
                responseData = await response.json();
            } else {
                responseData = { text: await response.text() };
            }

            statusBadge.innerText = `${response.status} ${response.statusText}`;
            if(response.ok) {
                statusBadge.className = "text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400";
            } else {
                statusBadge.className = "text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400";
            }

            resultJson.innerHTML = syntaxHighlight(responseData);
            resultArea.classList.remove('hidden');

        } catch (error) {
            statusBadge.innerText = `CORS / Network Error`;
            statusBadge.className = "text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400";
            resultJson.innerHTML = `<span class="text-orange-500">Erro de conexão. Geralmente ocorre por bloqueio de CORS do navegador. <br><br>Detalhe: ${error.message}</span>`;
            resultArea.classList.remove('hidden');
        } finally {
            spinner.classList.add('hidden');
        }
    }


    // ==========================================
    // 6. CARREGAMENTO INICIAL
    // ==========================================
    async function loadApiSpec() {
        showLoader();
        try {
            const fetchUrl = currentTab === 'kanban' ? URL_KANBAN_API : URL_OFFICIAL_API;
            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error(`Erro ${response.status}: Não foi possível acessar o arquivo.`);

            const rawSpec = await response.json();
            apiData = processApiSpec(rawSpec);

            renderSidebar(apiData);
            renderMainContent(apiData);

        } catch (error) {
            console.error(error);
            apiRenderArea.innerHTML = `
                <div class="p-12 text-center text-red-500 font-medium mt-10 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/50">
                    <i class="fa-solid fa-triangle-exclamation text-4xl mb-4"></i><br>
                    Não foi possível processar a documentação.<br>
                    <span class="text-sm text-gray-500 dark:text-red-400/70">Erro: ${error.message}</span><br><br>
                    Certifique-se de que o arquivo existe.
                </div>`;
            sidebarNav.innerHTML = '';
        } finally {
            hideLoader();
        }
    }

    if (globalSettingsForm) {
        globalSettingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            customBaseUrl = customUrlInput.value.trim();
            globalToken = globalTokenInput.value.trim();
            
            const btn = globalSettingsForm.querySelector('button');
            const originalText = btn.innerText;
            btn.innerHTML = '<i class="fa-solid fa-check"></i>';
            setTimeout(() => btn.innerText = originalText, 1500);

            loadApiSpec();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.sidebar-link').forEach(link => {
                const text = link.getAttribute('data-search');
                link.parentElement.style.display = text.includes(term) ? 'block' : 'none';
            });
            document.querySelectorAll('.endpoint-group').forEach(group => {
                const hasVisibleLinks = Array.from(group.querySelectorAll('li')).some(li => li.style.display !== 'none');
                group.style.display = hasVisibleLinks ? 'block' : 'none';
            });
        });
    }

    function showLoader() {
        if (loader) { loader.classList.remove('hidden'); loader.classList.add('flex'); loader.style.opacity = '1'; }
    }
    function hideLoader() {
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => { loader.classList.add('hidden'); loader.classList.remove('flex'); }, 300);
        }
    }

    window.addEventListener('scroll', () => {
        let current = '';
        document.querySelectorAll('.endpoint-card').forEach(card => {
            if (pageYOffset >= card.offsetTop - 150) current = card.getAttribute('id');
        });
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
        });
    });

    // Start App
    initTheme();
    initLang();
    loadApiSpec();
});
