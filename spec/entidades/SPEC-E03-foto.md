---
tipo: spec
projeto: mrs-marking
entidade: Attachment
tags:
  - mrs
  - cap
  - spec
  - entidade
status: ativo
date: 2026-08-12
---
# SPEC E03: Foto (Attachment)

## O que é (visão de negócio)

Evidência visual da marcação. O fiscal fotografa o problema no trilho, dormente ou valeta pra dar contexto ao planejamento e à execução. Uma imagem vale mais que a descrição.

## Papel no processo

Anexo de apoio. Não vive sozinha: sempre pertence a uma marcação. Nesta fase é mock (só metadados e URL), sem upload de binário real.

## Regras de negócio

- Sempre composta dentro de uma marcação (`ServiceMarking.photos`).
- Não é entidade exposta de forma independente.
- Uma marcação pode ter zero ou várias fotos.

## Campos

Aspectos: `cuid`.

| Campo | Tipo | Obrig. | Descrição |
|---|---|---|---|
| fileName | String(255) | sim | Nome do arquivo. |
| mediaType | String(100) | sim | MIME (ex: `image/jpeg`). |
| url | String(500) | sim | URL da imagem (mock). |

## Relacionamentos

- Composição de [[SPEC-E02-marcacao]] (`photos`).

## Conexões
- [[SPEC-00-visao-geral]]
- [[SPEC-E02-marcacao]]
