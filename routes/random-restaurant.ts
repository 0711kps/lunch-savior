import { Router } from 'https://deno.land/x/oak@v12.6.1/mod.ts'
import { slackClient as slack } from '../slack-instance.ts'
import { randomRestaurant } from '../repositories/restaurant-repository.ts'
import type { Restaurant } from '../types/restaurant.ts'

const formatRestaurant = (restaurant: Restaurant): string => {
  return `<https://www.google.com/maps/search/小巨蛋+${restaurant.mapKeyword} | ${restaurant.displayName}>`
}

const randomRestaurantRouter = new Router()
randomRestaurantRouter.post('/api/v1/random_restaurants', async (ctx) => {
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

export { randomRestaurantRouter }
