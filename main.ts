import { Application, Router } from 'https://deno.land/x/oak@v12.6.1/mod.ts'
// import type { DenoRestaurantDTO } from './types/denoRestaurant.dto'
import type { RestaurantDTO } from './types/restaurant.dto'
import type { Restaurant } from './types/restaurant'
import { nanoid } from "https://deno.land/x/nanoid/async.ts"
import { WebClient as SlackClient } from 'npm:@slack/web-api'
import type { ModalView, PlainTextOption } from 'npm:@slack/types'

const kv = await Deno.openKv()
const slack = new SlackClient(Deno.env.get('SLACK_TOKEN'))

const restaurantList = async (): Promise<Restaurant[]> => {
  const pool: Restaurant[] = []
  for await (const restaurant of kv.list({ prefix: ['restaurant'] })) {
    pool.push(Object.assign({}, {id: restaurant.key[1] }, restaurant.value) as Restaurant)
  }

  return pool
}

const randomRestaurant = async (): Promise<Restaurant> => {
  const pool = await restaurantList()
  return pool[Math.floor(Math.random() * pool.length)]
}

const formatRestaurant = (restaurant: Restaurant): string => {
  return `<https://www.google.com/maps/search/小巨蛋+${restaurant.mapKeyword} | ${restaurant.displayName}>`
}

const createRestaurant = async (params: RestaurantDTO): Promise<void> => {
  await kv.set(['restaurant', await nanoid(5)], params)
}

const deleteRestaurants = async (keys: string[]): Promise<void> => {
  await Promise.all(keys.map(key => kv.delete(['restaurant', key])))
}

const openModal = async ({ action_id, trigger_id}: { action_id: string, trigger_id: string}) => {
  let view: ModalView = {
    type: 'modal',
    title: {
      type: 'plain_text',
      text: ''
    },
    submit: {
      type: 'plain_text',
      text: ''
    },
    close: {
		  type: "plain_text",
		  text: "取消"
	  },
    blocks: []
  }
  switch(action_id) {
    case 'addRestaurantModal':
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
				  options: restaurantOptions,
				  action_id: 'targets'
			  },
			  label: {
				  type: 'plain_text',
				  text: '選擇餐廳',
          emoji: true
			  }
		  })
      break
    default:
      return
  }

  await slack.views.open({
    view,
    trigger_id
  })
}

const submitView = async (callbackId: string, stateValues: Record<string, any>) => {
  switch(callbackId) {
    case 'deleteRestaurant':
      const targets = stateValues.restaurantMenu.targets.selected_options
      const restaurantKeys = targets.map((option: Record<string, any>) => option.value)
      await deleteRestaurants(restaurantKeys)
      break
    case 'createRestaurant':
      const displayName = stateValues.displayNameField.input.value
      const mapKeyword = stateValues?.mapKeywordField?.input?.value || displayName
      await createRestaurant({ displayName, mapKeyword })
      break
  }
}

const router = new Router()
router
  .post('/api/v1/random_restaurants', async (ctx) => {
    const restaurantName = formatRestaurant(await randomRestaurant())
    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${restaurantName}*`
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '增加餐廳'
            },
            action_id: 'addRestaurantModal'
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '刪除餐廳'
            },
            action_id: 'deleteRestaurantModal'
          } 
       ]
      }
    ]
    const requestBody = await ctx.request.body()
    const formData = await requestBody.value
    const channel = formData.get('channel_id')
    await slack.chat.postMessage({ channel, blocks })

    ctx.response.status = 200
  })
  .post('/api/v1/interactive', async (ctx) => {
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

const app = new Application();
app.use(router.routes());

await app.listen({ port: 8000 });
