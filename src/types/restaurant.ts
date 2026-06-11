export interface Restaurant {
  restaurantId: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  description: string;
  openingHours: string;
  isOpen: boolean;
  isAvailable: boolean;
}

export interface MenuItem {
  menuItemId: string;
  name: string;
  description: string;
  price: number;
  restaurantId: string;
}
