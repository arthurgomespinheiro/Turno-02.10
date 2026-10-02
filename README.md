# MUSA · Relatório de Turno

Plataforma web (PWA) da MUSA para o encarregado de turno registrar em campo a
disponibilidade dos equipamentos e os operadores responsáveis. Os dados ficam salvos
**num banco de dados compartilhado na nuvem** (Firebase Firestore) — ou seja, qualquer
relatório preenchido por qualquer pessoa, em qualquer celular, aparece pra todo mundo que
abrir a plataforma. Depois de preencher, dá pra compartilhar o relatório como **texto
formatado no WhatsApp** (sem PDF, sem anexo — o texto já sai pronto na conversa). A tela
inicial mostra uma faixa de indicadores (total de relatórios, enviados hoje, contratos
ativos) para dar uma visão geral rápida.

## Configuração do Firebase

As credenciais do projeto Firebase (`relatorio-de-turno---musa`) já estão preenchidas no
`index.html`, na constante `firebaseConfig`. Se um dia precisar trocar de projeto Firebase,
é só substituir esses valores pelos do novo projeto (Configurações do projeto → Seus apps
→ ícone `</>`).

Lembre-se de que o **Firestore Database** precisa estar criado no projeto, com uma regra
de acesso parecida com esta (aba Regras do Firestore):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /relatorios_turno/{doc} {
      allow read, write: if true;
    }
  }
}
```

**Atenção:** essa regra deixa os dados abertos para leitura e escrita por qualquer pessoa
que tenha o link do app — igual a uma planilha do Google compartilhada "qualquer pessoa
com o link pode editar". Para uso interno de equipe costuma ser aceitável, mas vale ter em
mente.

## Estrutura do projeto

```
turno-app/
├── index.html          → app completo: HTML + CSS + JS em um único arquivo
├── manifest.json         → configuração do PWA (nome, ícone, cores)
├── service-worker.js     → cache do app shell para abrir mais rápido / offline
├── icons/icon.svg        → ícone do app
├── CNAME.example         → modelo para configurar domínio próprio (veja seção específica)
└── README.md
```

Não há build step — hospede em qualquer serviço de arquivos estáticos (GitHub Pages,
Netlify, Vercel).

## No iPhone, abra sempre por um link publicado

No iOS, abrir o `index.html` direto pelo Arquivos/Mail/AirDrop usa o modo de
pré-visualização do sistema (Quick Look), que não executa JavaScript. Publique o app e
abra o link pelo Safari.

## Como o app funciona

0. **Indicadores no topo**: total de relatórios salvos na nuvem, quantos foram enviados
   hoje, e quantos contratos estão ativos — dá uma visão geral assim que a página abre.
   Também aparece um indicador de conexão (verde = online, vermelho = offline) ao lado dos
   ícones do topo.
1. **Contrato**: Decanter, MOMC, Ouro Negro, Retaludamento, Peneira 3 ou Peneira 4 — cada
   um carrega sua própria lista de equipamentos (constante `CONTRACTS` em `index.html`).
   Trocar o contrato depois de já ter marcado algum status pede confirmação.
2. **Dados do Turno**: Data, Horário do Turno (07:00 às 19:00 ou 19:00 às 07:00), Turma
   (A/B/C/D) e Nome do Encarregado.
3. **Controle de Equipamentos**: 3 status — **Disponível** (Nome do Operador, obrigatório),
   **Sem Operador**, **Em Manutenção** (Motivo da Manutenção, obrigatório).
4. **Observações do Turno**: campo de texto livre.
5. **Finalizar Relatório**: valida os campos obrigatórios e salva o relatório no
   **Firestore** (nuvem compartilhada). Sem internet no momento, o envio fica em fila
   local e é enviado sozinho assim que a conexão voltar.
6. **Pós-geração**:
   - **Compartilhar no WhatsApp**: abre o WhatsApp com o relatório inteiro já escrito como
     texto formatado (contrato, dados do turno, resumo DF/UF por grupo, cada equipamento
     com status/operador/motivo, observações) — pronto para enviar, sem anexo.
   - **Copiar Texto**: copia esse mesmo texto para a área de transferência.
7. **Histórico** (ícone 🕘): relatórios salvos na nuvem (de qualquer pessoa, qualquer
   celular), com reenviar por WhatsApp, excluir, ou exportar tudo em JSON (para Power BI).

## Resumo DF / UF por grupo

O texto do WhatsApp inclui, por grupo de equipamento — agrupado pelo prefixo do código (as
letras antes dos números, ex.: CB, ES, PC, TE, MN, CP, TI):

- **DF** (Disponível + Sem Operador): quantos equipamentos daquele grupo estavam
  fisicamente disponíveis, com ou sem operador, sobre o total do contrato.
- **UF** (Disponível): quantos estavam disponíveis já com operador, sobre o total.

## Personalização de contratos e equipamentos

Edite a constante `CONTRACTS` em `index.html` para adicionar, remover ou mover
equipamentos entre contratos, ou criar/renomear contratos (lembre de adicionar o botão
correspondente em `#contratoGroup` no HTML).

## Publicar em domínio próprio

### Se estiver hospedando no GitHub Pages

1. No registrador do domínio, crie um registro DNS do tipo **CNAME**:
   - Nome/Host: o subdomínio que quiser (ex.: `turno`)
   - Valor/Aponta para: `seu-usuario.github.io`
2. No repositório, renomeie `CNAME.example` para **`CNAME`** (sem extensão) e deixe só o
   domínio completo dentro, ex.: `turno.musa.com.br`.
3. Em **Settings → Pages**, confirme o "Custom domain" e marque "Enforce HTTPS" quando
   disponível.

### Se preferir Netlify ou Vercel

Ambos têm uma tela de "Add custom domain" no painel do site, que já mostra quais registros
DNS criar.

## Segurança e próximos passos possíveis

Como as regras do Firestore acima ficam abertas, para um controle mais restrito no futuro
dá para adicionar autenticação (Firebase Authentication) e regras que só liberam escrita
para usuários logados.
