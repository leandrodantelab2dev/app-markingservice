---
tipo: spec
projeto: mrs-marking
entidade: ServiceMarking
tags:
  - mrs
  - cap
  - spec
  - entidade
status: ativo
date: 2026-08-12
---
# SPEC E02: Marcação (ServiceMarking)

## O que é (visão de negócio)

É o registro que o fiscal cria em campo quando identifica um serviço de manutenção a ser feito. Guarda **onde** (trecho + km + geolocalização), **o quê** (tipo de serviço), **em que estado** (condição) e **em que ponto do fluxo** (status). É o coração deste módulo.

## Papel no processo

Ponto de entrada de todo o processo de manutenção. A marcação nasce em campo e alimenta o planejamento das ordens de serviço. Uma marcação georreferenciada = uma demanda rastreável.

## Ciclo de vida

Status controlado pelo ciclo definido em [[SPEC-E04-vocabulario-e-status]]:

```
MARKED ──sendToPlanning──► IN_PLANNING ──► ORDERED ──► CLOSED
   │                            │
   └──────── reject ────────────┴──────────► REJECTED
```

Nasce em `MARKED`. Status muda só por action do serviço, nunca por edição direta.

## Regras de negócio

- `kmFrom <= kmTo`.
- `kmFrom` e `kmTo` dentro de `[kmStart, kmEnd]` do trecho associado.
- Toda marcação tem trecho, tipo, condição e status (obrigatórios).
- `notes` também recebe o motivo quando a marcação é rejeitada.
- Geolocalização (lat/long) registrada no momento da marcação.

## Campos

Aspectos: `cuid`, `managed`.

| Campo | Tipo | Obrig. | Descrição |
|---|---|---|---|
| lineSection | Association to LineSection | sim | Trecho marcado. |
| kmFrom | Decimal(9,3) | sim | Km inicial. Dentro do trecho. |
| kmTo | Decimal(9,3) | sim | Km final. `>= kmFrom`. |
| latitude | Decimal(9,6) | sim | Geolocalização (lat). |
| longitude | Decimal(9,6) | sim | Geolocalização (long). |
| markingDate | DateTime | sim | Data e hora da marcação. |
| inspector | String(100) | sim | Fiscal que marcou. |
| serviceType | Association to ServiceType | sim | Tipo de serviço. |
| condition | Association to Condition | sim | Condição encontrada. |
| status | Association to MarkingStatus | sim | Status atual. Default `MARKED`. |
| notes | String(1000) | não | Observações e motivo de rejeição. |
| photos | Composition of many Attachment | não | Fotos da marcação. |

## Relacionamentos

- Pertence a um [[SPEC-E01-trecho]].
- Compõe zero ou mais [[SPEC-E03-foto]].
- Classificada por [[SPEC-E04-vocabulario-e-status]] (tipo, condição, status).

## Seeds (mock)

5 marcações válidas, lat/long no Brasil, km dentro do trecho, status variados. Nenhuma FK órfã.

## Conexões
- [[SPEC-00-visao-geral]]
- [[SPEC-E01-trecho]]
- [[SPEC-E03-foto]]
- [[SPEC-E04-vocabulario-e-status]]
- [[SPEC-S01-marking-service]]
