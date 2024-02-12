import type { Restaurant } from './restaurant'

export type RestaurantDTO = {
  key: string[]
  value: Omit<Restaurant, "id">
  versionstamp: string
}
