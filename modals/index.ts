export * from './delete-restaurant-modal.ts'
export * from './add-restaurant-modal.ts'

import { slackClient as slack } from '../slack-instance.ts'
import { addRestaurantModal } from './add-restaurant-modal.ts'
import { deleteRestaurantModal } from './delete-restaurant-modal.ts'
import { restaurantList } from '../repositories/restaurant-repository.ts'
import type { ModalView, PlainTextOption } from 'npm:@slack/types'

export const openModal = async ({ action_id, trigger_id}: { action_id: string, trigger_id: string}): Promise<void> => {
  let view: ModalView

  switch(action_id) {
    case 'addRestaurantModal':
      view = addRestaurantModal()
      break
    case 'deleteRestaurantModal':
      const restaurantOptions: PlainTextOption[] = (await restaurantList()).map(restaurant => {
        return {
					"text": {
						"type": "plain_text",
						"text": `${restaurant.displayName}`,
						"emoji": true
					},
					"value": restaurant.id.toString()
				}
      })
      view = deleteRestaurantModal(restaurantOptions)
      break
    default:
      return
  }

  await slack.views.open({
    view,
    trigger_id
  })
}
