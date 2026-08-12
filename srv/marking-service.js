const cds = require('@sap/cds')

const MARKED = 'MARKED'
const IN_PLANNING = 'IN_PLANNING'
const REJECTED = 'REJECTED'
const CLOSED = 'CLOSED'

module.exports = cds.service.impl(async function () {
  const { ServiceMarking } = this.entities

  this.before(['CREATE', 'UPDATE'], ServiceMarking, async req => {
    if ('status' in req.data || 'status_code' in req.data) {
      return req.error(400, 'Não é permitido alterar o status diretamente. Use as ações sendToPlanning ou reject.')
    }

    let { kmFrom, kmTo, lineSection_ID } = req.data
    if (req.event === 'UPDATE' && (kmFrom == null || kmTo == null || !lineSection_ID)) {
      const current = await SELECT.one.from(req.subject)
      kmFrom = kmFrom ?? current?.kmFrom
      kmTo = kmTo ?? current?.kmTo
      lineSection_ID = lineSection_ID ?? current?.lineSection_ID
    }

    if (kmFrom == null || kmTo == null) return

    if (Number(kmFrom) > Number(kmTo)) {
      return req.error(400, 'km inicial não pode ser maior que o km final')
    }

    if (!lineSection_ID) return
    const section = await SELECT.one.from('mrs.maintenance.LineSection').where({ ID: lineSection_ID })
    if (!section) return

    if (Number(kmFrom) < Number(section.kmStart) || Number(kmTo) > Number(section.kmEnd)) {
      return req.error(400, `km fora do range do trecho ${section.code}`)
    }
  })

  this.on('sendToPlanning', ServiceMarking, async req => {
    const marking = await SELECT.one.from(req.subject)
    if (!marking) return req.error(404, 'Marcação não encontrada.')

    if (marking.status_code !== MARKED) {
      return req.error(400, `Não é possível enviar para planejamento uma marcação com status ${marking.status_code}. Só marcações em MARKED podem ir para IN_PLANNING.`)
    }

    await UPDATE(req.subject).with({ status_code: IN_PLANNING })
  })

  this.on('reject', ServiceMarking, async req => {
    const { reason } = req.data
    const marking = await SELECT.one.from(req.subject)
    if (!marking) return req.error(404, 'Marcação não encontrada.')

    if (marking.status_code === CLOSED) {
      return req.error(400, 'Não é possível rejeitar uma marcação já fechada (CLOSED).')
    }

    await UPDATE(req.subject).with({ status_code: REJECTED, notes: reason })
  })
})
