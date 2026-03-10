// ==========================================
// 1. DADOS COMPLETOS DA API KANBAN (EMBUTIDO)
// Isso evita depender de requests para api-1.json
// ==========================================
const KANBAN_SPEC = {
    "openapi": "3.1.0",
    "info": {
      "title": "Chatwoot Kanban API",
      "description": "API para gerenciamento de Funnels e Kanban Items no Chatwoot.\n\n## Recursos Principais\n\n* **Funnels**: Gerenciamento de funis de vendas\n* **Kanban Items**: Itens do quadro Kanban\n* **Estágios**: Controle de estágios do funil\n* **Estatísticas**: Métricas e relatórios\n* **Agentes**: Atribuição e gerenciamento de agentes\n* **Checklist**: Gerenciamento de tarefas\n* **Notas**: Sistema de anotações\n\n## Autenticação\n\nEsta API utiliza autenticação via token. Inclua o header:\n
