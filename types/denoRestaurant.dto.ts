import type { Restaurant } from './restaurant'

export type DenoRestaurantDTO = {
  key: string[]
  value: Omit<Restaurant, "id">
  versionstamp: string
}
