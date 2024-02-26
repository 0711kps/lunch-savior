import { Application, Router } from 'https://deno.land/x/oak@v12.6.1/mod.ts'
//import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
//import data from "./data.json" assert { type: "json" };
import type { DenoRestaurantDTO } from './types/denoRestaurant.dto'
import type { RestaurantDTO } from './types/restaurant.dto'
import type { Restaurant } from './types/restaurant'
import { nanoid } from "https://deno.land/x/nanoid/async.ts"
import Slack from 'npm:@slack/web-api'

const kv = await Deno.openKv()
const slack = new Slack.WebClient(Deno.env.get('SLACK_TOKEN'))

const restaurantList = async (): Restaurant[] => {
  const pool: Restaurant[] = []
  for await (const restaurant: DenoRestaurantDTO of kv.list({ prefix: ['restaurant'] })) {
    pool.push(Object.assign({}, {id: restaurant.key }, restaurant.value))
  }

  return pool
}

const randomRestaurant = async (): Restaurant => {
  const pool = await getRestaurantList()
  return pool[Math.floor(Math.random() * pool.length)]
}

const formatRestaurant = (restaurant: Restaurant): string => {
  return `<https://www.google.com/maps/search/小巨蛋+${restaurant.mapKeyword} | ${restaurant.displayName}>`
}

const createRestaurant = async (params: RestaurantDTO): Promise<void> => {
  await kv.set(['restaurant', nanoid()], params)
}

const deleteRestaurant = async (key: string): Promise<void> => {
  await kv.delete(['restaurant', key])
}

const router = new Router()
router
  .post('/api/v1/random_restaurants', async (ctx) => {
    const restaurantName = formatRestaurant(await randomRestaurant())
    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${restaurantName}*`
        }
      },
      {
        type: "divider"
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "增加餐廳"
            },
            action_id: 'addRestaurantModal'
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "刪除餐廳"
            },
            action_id: "deleteRestaurantModal"
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
    let view
    const requestBody = await ctx.request.body()
    const formData = await requestBody.value
    const payload = JSON.parse(formData.get('payload'))
    const action_id = payload.actions[0].action_id
    const trigger_id = payload.trigger_id
    switch(action_id) {
      case 'addRestaurantModal':
        view = {
	        "type": "modal",
	        "title": {
		        "type": "plain_text",
		        "text": "新增餐廳"
	        },
	        "submit": {
		        "type": "plain_text",
		        "text": "增加"
	        },
	        "close": {
		        "type": "plain_text",
		        "text": "取消"
	        },
	        "blocks": [
		        {
			        "type": "input",
			        "element": {
				        "type": "plain_text_input",
				        "action_id": "plain_text_input-action"
			        },
			        "label": {
				        "type": "plain_text",
				        "text": "餐廳名稱"
			        }
		        },
		        {
			        "type": "input",
              "optional": true,
			        "element": {
				        "type": "plain_text_input",
				        "action_id": "plain_text_input-action"
			        },
			        "label": {
				        "type": "plain_text",
				        "text": "關鍵字(空白將使用餐廳名稱)",
				        "emoji": true
			        }
		        }
	        ]
        }
        break
      case 'deleteRestaurantModal':
        view = {
	        "type": "modal",
	        "title": {
		        "type": "plain_text",
		        "text": "刪除餐廳"
	        },
	        "submit": {
		        "type": "plain_text",
		        "text": "刪除"
	        },
	        "close": {
		        "type": "plain_text",
		        "text": "取消"
	        },
	        "blocks": [
		        {
			        "type": "input",
			        "element": {
				        "type": "multi_static_select",
				        "placeholder": {
					        "type": "plain_text",
					        "text": "Select options",
					        "emoji": true
				        },
				        "options": [
					        {
						        "text": {
							        "type": "plain_text",
							        "text": "*plain_text option 0*",
							        "emoji": true
						        },
						        "value": "value-0"
					        },
					        {
						        "text": {
							        "type": "plain_text",
							        "text": "*plain_text option 1*",
							        "emoji": true
						        },
						        "value": "value-1"
					        },
					        {
						        "text": {
							        "type": "plain_text",
							        "text": "*plain_text option 2*",
							        "emoji": true
						        },
						        "value": "value-2"
					        }
				        ],
				        "action_id": "multi_static_select-action"
			        },
			        "label": {
				        "type": "plain_text",
				        "text": "選擇餐廳"
			        }
		        }
	        ]
        }
        break
    }
    await slack.views.open({
      view,
      trigger_id
    })

    ctx.response.status = 200
  })

const app = new Application();
//app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());
//app.use(router.allowedMethods());

await app.listen({ port: 8000 });
