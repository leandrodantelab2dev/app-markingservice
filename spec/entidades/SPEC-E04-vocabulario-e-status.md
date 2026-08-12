---
tipo: spec
projeto: mrs-marking
entidade: ServiceType, Condition, MarkingStatus
tags:
  - mrs
  - cap
  - spec
  - entidade
  - codelist
status: ativo
date: 2026-08-12
---
# SPEC E04: Vocabulário e Ciclo de Status

Três code lists que dão sentido à marcação. Aspecto `sap.common.CodeList` (chave `code`, campo `name`), anotadas com `@cds.autoexpose`. Sem `cuid`.

---

## ServiceType (tipo de serviço)

### Visão de negócio
Diz o que precisa ser feito no trecho. É o catálogo de serviços de manutenção de via. Padroniza a linguagem entre fiscal, planejamento e terceiro.

| code | name (pt-BR) |
|---|---|
| SLEEPER_REPLACEMENT | Troca de dormente |
| TAMPING | Socaria |
| FASTENING_REPLACEMENT | Troca de fixação |
| RAIL_GRINDING | Esmerilhamento de trilho |
| DITCH_CLEANING | Desobstrução de valeta |

---

## Condition (condição)

### Visão de negócio
Grau de severidade do que o fiscal encontrou. Ajuda a priorizar: crítico fura a fila.

| code | name (pt-BR) |
|---|---|
| OK | Normal |
| ATENCAO | Atenção |
| CRITICO | Crítico |

---

## MarkingStatus (ciclo de vida da marcação)

### Visão de negócio
Onde a marcação está no fluxo. É o coração do controle: cada transição é uma decisão de negócio, não uma edição de campo. Por isso status só muda por action (ver [[SPEC-S01-marking-service]]).

| code | name (pt-BR) | Significado |
|---|---|---|
| MARKED | Marcado | Recém-criada em campo. Estado inicial. |
| IN_PLANNING | Em planejamento | Enviada pro programador montar a OS. |
| ORDERED | Ordenado | Virou ordem de serviço. |
| CLOSED | Fechado | Ciclo concluído. |
| REJECTED | Rejeitado | Descartada, com motivo em `notes`. |

### Diagrama de estados

```
MARKED ──sendToPlanning──► IN_PLANNING ──► ORDERED ──► CLOSED
   │                            │
   └──────── reject ────────────┴──────────► REJECTED
```

Transições válidas nesta fase: `MARKED → IN_PLANNING` (via `sendToPlanning`) e qualquer status ativo `→ REJECTED` (via `reject`). `ORDERED` e `CLOSED` entram nos próximos módulos.

## Conexões
- [[SPEC-00-visao-geral]]
- [[SPEC-E02-marcacao]]
- [[SPEC-S01-marking-service]]
