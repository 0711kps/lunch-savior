import { kvInstance as kv } from './kv-instance.ts'
import { nanoid } from "https://deno.land/x/nanoid/async.ts"
import type { RestaurantDTO } from '../types/restaurant.dto.ts'
import type { Restaurant } from '../types/restaurant'

export const restaurantList = async (): Promise<Restaurant[]> => {
  const pool: Restaurant[] = []
  for await (const restaurant of kv.list({ prefix: ['restaurant'] })) {
    pool.push(Object.assign({}, {id: restaurant.key[1] }, restaurant.value) as Restaurant)
  }

  return pool
}

const prevSuggestionIds: string[] = []

export const randomRestaurant = async (): Promise<Restaurant> => {
  const pool = await restaurantList()
  const historyMaxSize = pool.length > 5 ? Math.ceil(pool.length * 0.4) : 1
  if (prevSuggestionIds.length >= historyMaxSize) prevSuggestionIds.slice(prevSuggestionIds.length - historyMaxSize)

  const filteredPool = pool.filter(restaurant => !prevSuggestionIds.includes(restaurant.id))
  const suggestion = filteredPool[Math.floor(Math.random() * filteredPool.length)]
  prevSuggestionIds.push(suggestion.id)
  return suggestion
}

export const createRestaurant = async (params: RestaurantDTO): Promise<void> => {
  await kv.set(['restaurant', await nanoid(5)], params)
}

export const deleteRestaurants = async (keys: string[]): Promise<void> => {
  await Promise.all(keys.map(key => kv.delete(['restaurant', key])))
}
