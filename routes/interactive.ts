import { Router } from 'https://deno.land/x/oak@v12.6.1/mod.ts'
import { submitView } from '../view-submissions/index.ts'
import { openModal } from '../modals/index.ts'

const interactiveRouter = new Router()
interactiveRouter.post('/api/v1/interactive', async (ctx) => {
  const requestBody = await ctx.request.body()
  const formData = await requestBody.value
  const payload = JSON.parse(formData.get('payload'))

  switch (payload.type) {
    case 'block_actions':
      const action_id = payload.actions[0].action_id
      const trigger_id = payload.trigger_id
      await openModal({ action_id, trigger_id })
      break
    case 'view_submission':
      const callbackId = payload.view.callback_id
      const stateValues = payload.view.state.values
      submitView(callbackId, stateValues)
      break
  }
  ctx.response.status = 200
})

export { interactiveRouter }
