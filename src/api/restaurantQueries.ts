import { gql } from '@apollo/client';
import { restaurantGraphqlClient } from '../lib/apolloClient';
import type { MenuItemSummary, Restaurant } from '../types/restaurant';

export const GET_ALL_RESTAURANTS = gql`
  query GetAllRestaurants {
    getAllRestaurants {
      restaurantId
      name
      address
      phoneNumber
      email
      description
      openingHours
      isOpen
      isAvailable
    }
  }
`;

export const GET_MENU_ITEMS_BY_RESTAURANT_ID = gql`
  query GetMenuItemsByRestaurantId($restaurantId: ID!) {
    getMenuItemsByRestaurantId(restaurantId: $restaurantId) {
      menuItemId
      name
      description
      price
    }
  }
`;

export async function fetchRestaurantsGraphql(): Promise<Restaurant[]> {
  const { data } = await restaurantGraphqlClient.query<{ getAllRestaurants: Restaurant[] }>({
    query: GET_ALL_RESTAURANTS,
    fetchPolicy: 'network-only',
  });
  return data?.getAllRestaurants ?? [];
}

export async function fetchMenuItemsGraphql(restaurantId: string): Promise<MenuItemSummary[]> {
  const { data } = await restaurantGraphqlClient.query<{
    getMenuItemsByRestaurantId: MenuItemSummary[];
  }>({
    query: GET_MENU_ITEMS_BY_RESTAURANT_ID,
    variables: { restaurantId },
    fetchPolicy: 'network-only',
  });
  return data?.getMenuItemsByRestaurantId ?? [];
}
