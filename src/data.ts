import { Restaurant, Category } from './types';

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
    deliveryFee: 2.99,
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80',
    categories: ['Burger', 'Fast Food'],
    isFeatured: true,
    menu: [
      {
        id: 'm1',
        name: 'Classic Cheeseburger',
        description: 'Juicy beef patty with cheddar cheese, lettuce, tomato, and our secret sauce.',
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
        category: 'Burger'
      },
      {
        id: 'm2',
        name: 'Bacon BBQ Burger',
        description: 'Beef patty topped with crispy bacon, onion rings, and smoky BBQ sauce.',
        price: 14.99,
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
    deliveryFee: 3.50,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    categories: ['Pizza', 'Italian'],
    menu: [
      {
        id: 'm3',
        name: 'Margherita Pizza',
        description: 'Fresh mozzarella, basil, and tomato sauce on a thin crust.',
        price: 16.99,
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=400&q=80',
        category: 'Pizza'
      },
      {
        id: 'm4',
        name: 'Pepperoni Feast',
        description: 'Loaded with spicy pepperoni and extra mozzarella.',
        price: 18.99,
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
    deliveryFee: 4.99,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    categories: ['Sushi', 'Japanese'],
    isFeatured: true,
    menu: [
      {
        id: 'm5',
        name: 'California Roll',
        description: 'Crab, avocado, and cucumber wrapped in seaweed and rice.',
        price: 10.99,
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
    deliveryFee: 3.99,
    image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=800&q=80',
    categories: ['Pasta', 'Italian'],
    menu: [
      {
        id: 'm6',
        name: 'Spaghetti Carbonara',
        description: 'Creamy sauce with pancetta, egg yolk, and parmesan.',
        price: 15.99,
        image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=400&q=80',
        category: 'Pasta'
      }
    ]
  }
];
