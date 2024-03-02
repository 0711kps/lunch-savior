import { createRestaurant, deleteRestaurants } from '../repositories/restaurant-repository.ts'

export const submitView = async (callbackId: string, stateValues: Record<string, any>) => {
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
