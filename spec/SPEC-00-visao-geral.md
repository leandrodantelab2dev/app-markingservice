---
tipo: spec
projeto: mrs-marking
tags:
  - mrs
  - cap
  - spec
status: ativo
date: 2026-08-12
---
# SPEC 00: Visão Geral do Domínio (fluxo de marcação)

Ponto de partida das specs. Cada entidade tem sua própria spec, escrita como visão de negócio (o que é no mundo real, papel no processo, ciclo de vida, regras) e depois a tabela técnica.

## O negócio em uma frase

Um fiscal da MRS percorre a via férrea e **marca em campo**, de forma georreferenciada, todo serviço de manutenção que precisa ser executado num **trecho** da linha. Cada marcação vira insumo pro planejamento das ordens de serviço.

## Mapa das entidades

```
Trecho (LineSection)
   └─ é referenciado por ─┐
                          ▼
                    Marcação (ServiceMarking) ── tem ──► Foto (Attachment) [0..n]
                          │
             classificada por vocabulário:
             Tipo de serviço · Condição · Status (ciclo de vida)
```

## Specs por entidade (visão de negócio)

| Spec | Entidade | O que representa |
|---|---|---|
| [[SPEC-E01-trecho]] | LineSection | Pedaço físico da linha (km inicial e final). |
| [[SPEC-E02-marcacao]] | ServiceMarking | O registro que o fiscal cria em campo. Coração do módulo. |
| [[SPEC-E03-foto]] | Attachment | Evidência visual da marcação. |
| [[SPEC-E04-vocabulario-e-status]] | Code lists | Tipo de serviço, condição e o ciclo de status. |

## Specs de comportamento e UI

| Spec | O que cobre |
|---|---|
| [[SPEC-S01-marking-service]] | Serviço OData do fiscal: exposição, actions, validações. |
| [[SPEC-A01-app-markingservice]] | App Fiori freestyle que consome o serviço. |

## Convenções globais

Namespace `mrs.maintenance`, arquivo `db/schema.cds`. Entidades e campos em inglês, labels e mensagens em pt-BR. Entidades transacionais usam `cuid` e `managed` de `@sap/cds/common`. Code lists usam `sap.common.CodeList` com `@cds.autoexpose`. Escopo desta fase: só marcação (sem OS, material, execução ou conferência).

