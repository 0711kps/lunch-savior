import { modalBase } from './modalBase.ts'

const addRestaurantModal = () => {
  const view = Object.assign({}, modalBase)

  view.title.text = '新增餐廳'
  view.callback_id = 'createRestaurant'
  view.submit!.text = '增加'
  view.blocks.push({
    type: 'input',
    block_id: 'displayNameField',
	  element: {
		  "type": 'plain_text_input',
      action_id: 'input',
      placeholder: {
        type: 'plain_text',
        text: '餐廳名稱'
      }
	  },
	  label: {
		  type: 'plain_text',
		  text: '餐廳名稱'
	  }
  })
  view.blocks.push({
    type: 'input',
    optional: true,
    block_id: 'mapKeywordField',
	  element: {
		  type: 'plain_text_input',
      action_id: 'input',
      placeholder: {
			  type: 'plain_text',
			  text: '空白將使用餐廳名稱'
		  }
	  },
	  label: {
		  type: 'plain_text',
		  text: '關鍵字',
		  emoji: true
	  }
  })

  return view
}


export { addRestaurantModal }
