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
# SPEC S01: MarkingService (serviço do fiscal)

Serviço OData da persona Fiscal. Arquivos `srv/marking-service.cds` e `srv/marking-service.js`. Opera sobre as entidades das specs [[SPEC-E01-trecho]], [[SPEC-E02-marcacao]] e o vocabulário de [[SPEC-E04-vocabulario-e-status]].

---

## Exposição

`service MarkingService` expõe:

| Projeção | Acesso | Origem |
|---|---|---|
| ServiceMarking | leitura e escrita | mrs.maintenance.ServiceMarking |
| LineSection | somente leitura | mrs.maintenance.LineSection |
| ServiceType, Condition, MarkingStatus | autoexpose | code lists |

Autorização (mock): `@requires: 'Fiscal'`. Usuário de teste `fiscal1` no `package.json`.

---

## Actions de transição de status

Status nunca muda por update direto do client. Só pelas actions abaixo (bound em ServiceMarking). Ciclo completo em [[SPEC-E04-vocabulario-e-status]].

| Action | Parâmetro | Transição | Efeito |
|---|---|---|---|
| sendToPlanning | nenhum | MARKED para IN_PLANNING | Marca como pronta pro programador. |
| reject | reason: String | qualquer status ativo para REJECTED | Grava o motivo em `notes`. |

Transição inválida (ex: sendToPlanning numa marcação já ORDERED) retorna `req.error(400, ...)` com mensagem pt-BR.

---

## Validações (create e update de ServiceMarking)

1. `kmFrom <= kmTo`. Senão: erro 400 "km inicial não pode ser maior que o km final".
2. `kmFrom` e `kmTo` dentro de `[kmStart, kmEnd]` do LineSection associado. Senão: erro 400 "km fora do range do trecho <code>".
3. Bloquear escrita direta no campo `status` pelo client. Orientar a usar as actions.

Mensagens sempre em pt-BR, claras, com o dado que falhou.

---

## Regras de negócio

- Marcação nova nasce em `MARKED`.
- Só marcação em `MARKED` pode ir para `IN_PLANNING`.
- `reject` pode ser chamada em qualquer status ativo (não CLOSED).
- Toda transição usa `managed` (quem e quando) automaticamente.

## Conexões
- [[SPEC-00-visao-geral]]
- [[SPEC-E02-marcacao]]
- [[SPEC-E04-vocabulario-e-status]]
- [[SPEC-A01-app-markingservice]]
