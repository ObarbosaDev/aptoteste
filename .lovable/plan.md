
# Sistema de Gestão Condominial - CondoApp

## Visão Geral
Aplicação frontend completa de gestão condominial com interface moderna, responsiva, e dados mockados. Três perfis de usuário com dashboards e funcionalidades específicas.

---

## 1. Design & Identidade Visual
- **Paleta moderna:** Tons de azul/indigo como cor primária, cinzas neutros, acentos em verde/amarelo para status
- **Tipografia limpa:** Inter/sans-serif
- **Layout:** Sidebar de navegação à esquerda (colapsável no mobile), header com avatar e info do usuário
- **Cards com sombras suaves**, tabelas com filtros, modais elegantes
- **Dark mode** disponível

## 2. Tela de Login
- Formulário centralizado com e-mail e senha
- Seleção de perfil para demo (morador, porteiro, síndico)
- Redirecionamento automático para o dashboard do perfil selecionado

## 3. Dashboard do Síndico
- **Cards de resumo:** Encomendas pendentes, moradores ativos, visitantes hoje, ocorrências abertas
- **Gráficos:** Encomendas por mês, ocorrências por tipo (usando Recharts)
- Tabela de últimas encomendas e ocorrências abertas
- Botões de ação rápida

## 4. Painel do Porteiro
- Ações rápidas: Registrar encomenda, registrar visitante, validar QR Code
- Lista de encomendas pendentes com fotos miniatura
- Resumo diário (totais do dia)

## 5. Painel do Morador
- Card destaque: "Você tem X encomendas aguardando"
- Lista de encomendas pendentes com botão "Ver QR Code"
- Histórico de encomendas retiradas
- Avisos do síndico
- Botão "Abrir ocorrência"

## 6. Módulo de Encomendas
- Formulário de registro com preview de foto, tipo, bloco, unidade, morador
- Listagem com filtros (status, data, bloco)
- Tela de validação/retirada com simulação de QR Code
- Modal com canvas para assinatura digital
- Detalhes da encomenda com timeline de status

## 7. Módulo de Visitantes
- Formulário de registro de entrada
- Lista de visitantes com status (dentro/saiu)
- Botão de registro de saída
- Histórico com filtros

## 8. Módulo de Reservas
- Calendário visual de ocupação dos espaços comuns
- Formulário de solicitação de reserva
- Lista de reservas com status (pendente, aprovada, rejeitada)
- Gestão de aprovações (visão síndico)

## 9. Módulo de Avisos e Assembleias
- Listagem de avisos com destaque para novos
- Formulário de criação (síndico)
- Detalhes do aviso/assembleia com data, local e descrição

## 10. Módulo de Ocorrências
- Formulário de abertura com tipo, descrição e foto opcional
- Listagem com filtros por status
- Detalhes com timeline: abertura → resposta do síndico → resolução
- Área de resposta do síndico

## 11. Navegação & Responsividade
- Sidebar com ícones e labels, específica por perfil
- Navbar mobile com menu hamburger
- Todas as telas responsivas (desktop, tablet, celular)
