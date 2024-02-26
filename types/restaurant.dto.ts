import type { Restaurant } from './restaurant'

export type RestaurantDTO = Pick<Restaurant, 'displayName' | 'mapKeyword'>
