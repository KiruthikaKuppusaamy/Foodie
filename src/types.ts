export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  image: string;
  categories: string[];
  menu: MenuItem[];
  isFeatured?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
  restaurantId: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  restaurant: Restaurant;
  timestamp: number;
  status: string;
  paymentMethod?: string;
}

export interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  color: string;
  restaurantId?: string;
}
