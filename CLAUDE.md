# CLAUDE.md — Projeto `mrs-marking` (CAP + Fiori Freestyle)

> Este arquivo é o contexto permanente do projeto. **Leia antes de qualquer tarefa.**
> Vale pra qualquer agente (Joule, Claude Code, Copilot). No Build Code, use o mesmo conteúdo como `AGENTS.md`.
> Trabalho em passos pequenos: um pedido por vez, valide, só então avance.

---

## 1. O que é este projeto

Backend CAP Node.js + app Fiori freestyle para o fluxo de **marcação georreferenciada** da MRS.

Um fiscal marca em campo, num trecho da linha férrea (km inicial e final), o serviço de manutenção de via que precisa ser executado. Cada marcação tem geolocalização, tipo de serviço, condição e status.

Escopo desta fase: só o módulo de marcação. Sem OS, material, execução ou conferência.

---

## 2. Stack e layout

- **CAP Node.js** (CDS), SQLite em dev, mock em tudo.
- Namespace do modelo: `mrs.maintenance`.
- Layout padrão CAP (os modelos foram treinados nele, não invente outro):

```
mrs-marking/
├─ db/           # modelo de dados (schema.cds) + seeds em db/data (CSV)
├─ srv/          # MarkingService (.cds + .js)
├─ app/
│  └─ markingservice/   # app Fiori freestyle (UI5), id do app: app-markingservice
├─ test/         # requests.http
├─ package.json
└─ CLAUDE.md     # este arquivo
```

---

## 3. MCP Server de CAP (obrigatório)

Este projeto usa o **`@cap-js/mcp-server`** (server `cds-mcp`). Ele deixa o agente consultar o modelo CDS compilado e a doc oficial do capire antes de gerar código. É o que mata alucinação de sintaxe CDS.

Config do MCP (VS Code / Claude Code):

```json
{
  "mcpServers": {
    "cds-mcp": {
      "command": "npx",
      "args": ["-y", "@cap-js/mcp-server"],
      "env": {}
    }
  }
}
```

Tools disponíveis:

- `search_model`: busca fuzzy nas definições do modelo CDS compilado (entidades, campos, serviços, endpoints HTTP).
- `search_docs`: busca semântica na documentação do CAP (capire), local por embeddings.

### Regras de uso do MCP (não negociáveis)

- Você **DEVE** buscar definições CDS (entidades, campos, serviços, endpoints) com o `cds-mcp`. Só se falhar, pode ler os arquivos `*.cds` do projeto.
- Você **DEVE** buscar na doc do CAP com o `cds-mcp` **toda vez** que for criar ou alterar modelo CDS, usar APIs do `cds`, ou o CLI do CAP. Não proponha nem faça mudança sem antes checar.

---

## 4. Regras de ouro (como trabalhar aqui)

1. Uma tarefa por vez. Nada de gerar o app inteiro num prompt só.
2. Antes de codar, liste em 3 a 5 linhas o que vai fazer. Depois execute.
3. Sempre consulte o `cds-mcp` antes de escrever ou mexer em CDS.
4. Não refatore código de passos anteriores sem eu pedir.
5. Cada tarefa termina com `cds watch` subindo sem erro e o critério de aceite batendo.
6. Em dúvida de regra de negócio, pergunte. Não assuma.
7. Leia o diff. A IA escreve, quem assina é o dev.

---

## 5. Convenções de modelo de dados

- Entidades e campos em **inglês**. Labels, textos e mensagens de erro em **pt-BR**.
- Use `cuid` e `managed` de `@sap/cds/common` nas entidades transacionais.
- Code lists usam o aspecto `sap.common.CodeList` (chave `code`, campo `name`), com `@cds.autoexpose`. Não levam `cuid`.
- Fotos da marcação: `Composition of many Attachment` (mock, sem binário: `fileName`, `mediaType`, `url`).

Entidades do fluxo de marcação:

- `LineSection` (trecho): `code`, `description`, `line`, `subdivision`, `kmStart`, `kmEnd`.
- `ServiceMarking` (marcação): assoc. `LineSection`; `kmFrom`, `kmTo`; `latitude`, `longitude`; `markingDate`; `inspector`; assoc. `ServiceType`, `Condition`, `MarkingStatus`; `notes`; `photos`.
- Code lists: `ServiceType`, `Condition` (OK, ATENCAO, CRITICO), `MarkingStatus` (MARKED, IN_PLANNING, ORDERED, CLOSED, REJECTED).

---

## 6. Convenções de serviço

- Um serviço OData por persona. Aqui: **`MarkingService`** (fiscal), em `srv/marking-service.cds` + `.js`.
- Expõe `ServiceMarking` (leitura e escrita), `LineSection` (leitura), code lists via autoexpose.
- **Status nunca muda por update direto do client.** Só via `action`. Bloqueie e oriente a usar a action.
- Actions de transição: `sendToPlanning()` (MARKED para IN_PLANNING) e `reject(reason)`.
- Validação no create/update: `kmFrom <= kmTo` e ambos dentro de `[kmStart, kmEnd]` do trecho. Violação: `req.error(400, ...)` com mensagem pt-BR clara.
- Transição inválida: `req.error(400, ...)`.

---

## 7. App Fiori Freestyle (`app-markingservice`)

- App **UI5 freestyle** (SAPUI5, não Fiori Elements), em `app/markingservice/`. App id: `app-markingservice`.
- Consome o `MarkingService` via **OData V4** (`sap.ui.model.odata.v4.ODataModel`).
- Estrutura mínima: `manifest.json` (data source apontando pro MarkingService), `Component.js`, views XML e controllers.
- Padrão de telas: List Report da marcação, Object Page com detalhe e as actions (`sendToPlanning`, `reject`).
- Bindings e mudança de status sempre via OData (chamada de action), nunca escrevendo no campo `status`.
- Textos de UI em pt-BR, via `i18n`. Não hardcode label na view.
- Freestyle: você controla a UI. Não dependa de annotations de Fiori Elements, mas pode usar annotations de UI se ajudar.

---

## 8. Autorização e mock (fase atual)

- Mock em tudo: SQLite em dev, seeds em CSV (`db/data`), auth mockada.
- Role do serviço: `Fiscal`. `@requires: 'Fiscal'` no MarkingService.
- Usuário de teste no `package.json`: `fiscal1`.
- Preparar (sem deploy) o profile `production` para HANA Cloud e `xs-security.json` para XSUAA, mas não conectar nada real agora.

---

## 9. Definition of done

- `cds watch` sobe sem erro e sem warning de seed órfão.
- O critério de aceite do passo pedido bate.
- `test/requests.http` cobre o fluxo e passa em ordem.
- Nenhum arquivo fora do escopo do passo foi alterado.

---

## 10. O que NÃO fazer

- Não criar OS, material, execução ou conferência nesta fase.
- Não escrever no campo `status` pelo client. Só via action.
- Não inventar sintaxe CDS. Consulte o `cds-mcp` antes.
- Não trocar o layout `db/ srv/ app/`.
- Não usar travessão longo em texto de UI, i18n ou comentário. Vírgula, dois-pontos ou parêntese.
- Não colar credencial ou dado sensível em prompt.