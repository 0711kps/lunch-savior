import { modalBase } from './modalBase.ts'
import type { ModalView, PlainTextOption } from 'npm:@slack/types'

const deleteRestaurantModal = (menuOptions: PlainTextOption[]): ModalView => {
  const view = JSON.parse(JSON.stringify(modalBase))
  view.title.text = '刪除餐廳'
  view.callback_id = 'deleteRestaurant'
  view.submit!.text = '刪除'
  view.blocks.push({
		type: 'input',
    block_id: 'restaurantMenu',
		element: {
			type: 'multi_static_select',
			placeholder: {
				type: 'plain_text',
				text: '要刪除的餐廳',
				emoji: true
			},
			options: menuOptions,
			action_id: 'targets'
		},
		label: {
			type: 'plain_text',
			text: '選擇餐廳',
      emoji: true
		}
	})
  return view
}

export { deleteRestaurantModal }
