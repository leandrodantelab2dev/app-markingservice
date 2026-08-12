---
tipo: spec
projeto: mrs-marking
tags:
  - mrs
  - cap
  - fiori
  - spec
status: ativo
date: 2026-08-12
---
# SPEC A01: App Fiori Freestyle `app-markingservice`

App UI5 freestyle (SAPUI5, não Fiori Elements) em `app/markingservice/`. App id: `app-markingservice`. Consome a [[SPEC-S01-marking-service]] via OData V4. Usa as entidades das specs [[SPEC-E01-trecho]], [[SPEC-E02-marcacao]] e [[SPEC-E04-vocabulario-e-status]].

---

## Base técnica

- Modelo: `sap.ui.model.odata.v4.ODataModel` apontando pro MarkingService.
- `manifest.json` com o dataSource do MarkingService e o modelo default OData V4.
- Roteamento: List (`marcações`) e Object (`detalhe da marcação`).
- Textos de UI em pt-BR via `i18n`. Nada hardcoded na view.

---

## Tela 1: Lista de marcações (List Report)

Tabela de `ServiceMarking` com colunas:

| Coluna | Campo |
|---|---|
| Trecho | lineSection/code |
| Km | kmFrom + kmTo |
| Tipo | serviceType/name |
| Condição | condition/name |
| Status | status/name |
| Data | markingDate |

- Filtro por status e por trecho.
- Botão "Nova marcação".
- Clique na linha abre a Tela 2.

---

## Tela 2: Detalhe da marcação (Object Page)

- Campos da marcação (trecho, km, geolocalização, tipo, condição, status, fiscal, notas).
- Galeria simples das `photos` (url mock).
- Botões de ação:
  - "Enviar para planejamento": chama a action `sendToPlanning`. Visível só se status = MARKED.
  - "Rejeitar": abre diálogo pedindo o motivo, chama `reject(reason)`.
- Após a action, refresh do binding pra refletir o novo status.

---

## Regras de UI

- Mudança de status sempre via chamada de action OData. Nunca escrever no campo `status`.
- Condição CRITICO destacada visualmente (ex: cor/estado de erro).
- Campos km e geolocalização com máscara/validação básica no cliente, mas a validação forte é do backend (SPEC-S01).
- Freestyle: você controla a UI. Pode usar annotations de UI, mas não depende de Fiori Elements.

## Conexões
- [[SPEC-00-visao-geral]]
- [[SPEC-E02-marcacao]]
- [[SPEC-S01-marking-service]]
