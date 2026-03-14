import { Restaurant, Category, Promotion } from './types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Burger', icon: '🍔' },
  { id: '2', name: 'Pizza', icon: '🍕' },
  { id: '3', name: 'Sushi', icon: '🍣' },
  { id: '4', name: 'Pasta', icon: '🍝' },
  { id: '5', name: 'Salad', icon: '🥗' },
  { id: '6', name: 'Dessert', icon: '🍰' },
  { id: '7', name: 'Drinks', icon: '🥤' },
];

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'res-1',
    name: 'Burger Haven',
    rating: 4.8,
    deliveryTime: '20-30 min',
    deliveryFee: 40,
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80',
    categories: ['Burger', 'Fast Food'],
    isFeatured: true,
    menu: [
      {
        id: 'm1',
        name: 'Classic Cheeseburger',
        description: 'Juicy beef patty with cheddar cheese, lettuce, tomato, and our secret sauce.',
        price: 249,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
        category: 'Burger'
      },
      {
        id: 'm2',
        name: 'Bacon BBQ Burger',
        description: 'Beef patty topped with crispy bacon, onion rings, and smoky BBQ sauce.',
        price: 329,
        image: 'https://images.unsplash.com/photo-1553979459-d2229ba7443b?auto=format&fit=crop&w=400&q=80',
        category: 'Burger'
      }
    ]
  },
  {
    id: 'res-2',
    name: 'Pizza Roma',
    rating: 4.6,
    deliveryTime: '30-45 min',
    deliveryFee: 60,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    categories: ['Pizza', 'Italian'],
    menu: [
      {
        id: 'm3',
        name: 'Margherita Pizza',
        description: 'Fresh mozzarella, basil, and tomato sauce on a thin crust.',
        price: 499,
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=400&q=80',
        category: 'Pizza'
      },
      {
        id: 'm4',
        name: 'Pepperoni Feast',
        description: 'Loaded with spicy pepperoni and extra mozzarella.',
        price: 599,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=400&q=80',
        category: 'Pizza'
      }
    ]
  },
  {
    id: 'res-3',
    name: 'Sushi Zen',
    rating: 4.9,
    deliveryTime: '25-40 min',
    deliveryFee: 80,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    categories: ['Sushi', 'Japanese'],
    isFeatured: true,
    menu: [
      {
        id: 'm5',
        name: 'California Roll',
        description: 'Crab, avocado, and cucumber wrapped in seaweed and rice.',
        price: 799,
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=400&q=80',
        category: 'Sushi'
      }
    ]
  },
  {
    id: 'res-4',
    name: 'Pasta Fresca',
    rating: 4.7,
    deliveryTime: '35-50 min',
    deliveryFee: 50,
    image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=800&q=80',
    categories: ['Pasta', 'Italian'],
    menu: [
      {
        id: 'm6',
        name: 'Spaghetti Carbonara',
        description: 'Creamy sauce with pancetta, egg yolk, and parmesan.',
        price: 399,
        image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=400&q=80',
        category: 'Pasta'
      }
    ]
  },
  {
    id: 'res-5',
    name: 'Green Garden',
    rating: 4.5,
    deliveryTime: '15-25 min',
    deliveryFee: 0,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    categories: ['Salad', 'Healthy'],
    menu: [
      {
        id: 'm7',
        name: 'Quinoa Bowl',
        description: 'Organic quinoa with roasted vegetables and lemon tahini dressing.',
        price: 299,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
        category: 'Salad'
      }
    ]
  },
  {
    id: 'res-6',
    name: 'Steakhouse Prime',
    rating: 4.9,
    deliveryTime: '45-60 min',
    deliveryFee: 120,
    image: 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?auto=format&fit=crop&w=800&q=80',
    categories: ['Steak', 'Fine Dining'],
    menu: [
      {
        id: 'm8',
        name: 'Ribeye Steak',
        description: 'Prime ribeye steak served with garlic butter and mashed potatoes.',
        price: 1299,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80',
        category: 'Main'
      }
    ]
  }
];

export const PROMOTIONS: Promotion[] = [
  {
    id: 'p1',
    title: '50% OFF',
    subtitle: 'On your first order from Burger Haven',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    color: 'bg-orange-500',
    restaurantId: 'res-1'
  },
  {
    id: 'p2',
    title: 'Free Delivery',
    subtitle: 'Enjoy zero delivery fee on all Sushi Zen orders',
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80',
    color: 'bg-emerald-600',
    restaurantId: 'res-3'
  },
  {
    id: 'p3',
    title: 'Weekend Special',
    subtitle: 'Buy 1 Get 1 Free on all Pizza Roma classics',
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80',
    color: 'bg-red-600',
    restaurantId: 'res-2'
  }
];
