---
tipo: spec
projeto: mrs-marking
entidade: LineSection
tags:
  - mrs
  - cap
  - spec
  - entidade
status: ativo
date: 2026-08-12
---
# SPEC E01: Trecho (LineSection)

## O que é (visão de negócio)

O trecho é o pedaço físico da linha férrea, delimitado por um km inicial e um km final. É a unidade de referência de tudo: toda marcação acontece **dentro de um trecho**. Sem trecho, não há onde marcar.

## Papel no processo

Cadastro de referência (master data). Já existe antes da operação começar. O fiscal não cria trecho em campo: ele escolhe o trecho e marca o serviço dentro dele.

## Regras de negócio

- `kmEnd >= kmStart` (um trecho não anda pra trás).
- `code` identifica o trecho de forma única (ex: `L1-SUB3`).
- É a fronteira de validação da marcação: o km marcado tem que cair dentro de `[kmStart, kmEnd]`.

## Campos

Aspectos: `cuid`, `managed`.

| Campo | Tipo | Obrig. | Descrição |
|---|---|---|---|
| code | String(20) | sim | Código único do trecho. |
| description | String(200) | sim | Descrição do trecho. |
| line | String(50) | sim | Linha férrea. |
| subdivision | String(50) | não | Subdivisão da linha. |
| kmStart | Decimal(9,3) | sim | Km inicial. |
| kmEnd | Decimal(9,3) | sim | Km final. `>= kmStart`. |

## Relacionamentos

- Referenciado por [[SPEC-E02-marcacao]] (`ServiceMarking.lineSection`).

## Seeds (mock)

3 trechos com linha, subdivisão e faixas de km plausíveis.

## Conexões
- [[SPEC-00-visao-geral]]
- [[SPEC-E02-marcacao]]
