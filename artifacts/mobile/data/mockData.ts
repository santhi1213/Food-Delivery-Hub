export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  isVeg: boolean;
  calories?: number;
  popular?: boolean;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  distance: string;
  minOrder: number;
  deliveryFee: number;
  isOpen: boolean;
  isFeatured?: boolean;
  tags: string[];
  gradientColors: [string, string];
  iconName: string;
  menu: MenuSection[];
}

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "ready"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  date: string;
  estimatedTime?: string;
}

export const CATEGORIES: Category[] = [
  { id: "biryani", name: "Biryani", icon: "restaurant", color: "#FF7043" },
  { id: "pizza", name: "Pizza", icon: "pizza", color: "#F06292" },
  { id: "burgers", name: "Burgers", icon: "fast-food", color: "#FFB300" },
  { id: "chinese", name: "Chinese", icon: "cafe", color: "#66BB6A" },
  { id: "desserts", name: "Desserts", icon: "ice-cream", color: "#AB47BC" },
  { id: "beverages", name: "Drinks", icon: "wine", color: "#42A5F5" },
  { id: "south-indian", name: "South Indian", icon: "restaurant-outline", color: "#26A69A" },
  { id: "healthy", name: "Healthy", icon: "leaf", color: "#9CCC65" },
];

export const RESTAURANTS: Restaurant[] = [
  {
    id: "r1",
    name: "Biryani House",
    cuisine: "Hyderabadi, Mughlai",
    rating: 4.5,
    reviewCount: 1243,
    deliveryTime: "25-35",
    distance: "1.2 km",
    minOrder: 149,
    deliveryFee: 29,
    isOpen: true,
    isFeatured: true,
    tags: ["Popular", "Top Rated"],
    gradientColors: ["#D84315", "#FF8A65"],
    iconName: "restaurant",
    menu: [
      {
        title: "Biryani",
        items: [
          { id: "b1", name: "Hyderabadi Chicken Biryani", description: "Slow-cooked with aromatic whole spices and saffron rice", price: 349, rating: 4.8, isVeg: false, popular: true, calories: 850 },
          { id: "b2", name: "Mutton Dum Biryani", description: "Tender mutton pieces in rich dum style", price: 449, rating: 4.7, isVeg: false, popular: true },
          { id: "b3", name: "Veg Dum Biryani", description: "Mixed vegetables in fragrant basmati rice", price: 249, rating: 4.2, isVeg: true },
          { id: "b4", name: "Prawn Biryani", description: "Fresh prawns with coastal masala", price: 399, rating: 4.5, isVeg: false },
        ],
      },
      {
        title: "Starters",
        items: [
          { id: "bs1", name: "Chicken 65", description: "Crispy fried chicken with curry leaves", price: 249, rating: 4.6, isVeg: false, popular: true },
          { id: "bs2", name: "Samosa (2 pcs)", description: "Crispy pastry with spiced potato filling", price: 79, rating: 4.3, isVeg: true },
          { id: "bs3", name: "Seekh Kebab", description: "Minced lamb on skewers, charcoal grilled", price: 299, rating: 4.5, isVeg: false },
        ],
      },
      {
        title: "Beverages",
        items: [
          { id: "bev1", name: "Mango Lassi", description: "Thick yogurt drink with Alphonso mango", price: 99, rating: 4.5, isVeg: true },
          { id: "bev2", name: "Mint Lemonade", description: "Fresh lime with mint and chaat masala", price: 79, rating: 4.3, isVeg: true },
        ],
      },
    ],
  },
  {
    id: "r2",
    name: "Smash & Stack",
    cuisine: "American, Burgers",
    rating: 4.4,
    reviewCount: 876,
    deliveryTime: "20-30",
    distance: "0.8 km",
    minOrder: 199,
    deliveryFee: 0,
    isOpen: true,
    isFeatured: true,
    tags: ["Free Delivery"],
    gradientColors: ["#E65100", "#FFCC02"],
    iconName: "fast-food",
    menu: [
      {
        title: "Burgers",
        items: [
          { id: "bg1", name: "Classic Smash Burger", description: "Double smashed patty, cheddar, pickles, special sauce", price: 299, rating: 4.7, isVeg: false, popular: true },
          { id: "bg2", name: "BBQ Bacon Burger", description: "Smoky BBQ, crispy bacon, caramelized onions", price: 349, rating: 4.5, isVeg: false },
          { id: "bg3", name: "Crispy Chicken Burger", description: "Buttermilk fried chicken, coleslaw, sriracha mayo", price: 279, rating: 4.6, isVeg: false, popular: true },
          { id: "bg4", name: "Mushroom Swiss Veggie", description: "Portobello mushroom, Swiss cheese, truffle aioli", price: 249, rating: 4.3, isVeg: true },
        ],
      },
      {
        title: "Sides",
        items: [
          { id: "f1", name: "Loaded Fries", description: "Crispy fries with cheese sauce and jalapeños", price: 149, rating: 4.4, isVeg: true, popular: true },
          { id: "f2", name: "Onion Rings", description: "Beer-battered crispy onion rings", price: 129, rating: 4.2, isVeg: true },
        ],
      },
      {
        title: "Shakes",
        items: [
          { id: "ms1", name: "Oreo Shake", description: "Thick Oreo milkshake with whipped cream", price: 179, rating: 4.6, isVeg: true, popular: true },
          { id: "ms2", name: "Salted Caramel Shake", description: "House caramel, sea salt, vanilla ice cream", price: 199, rating: 4.5, isVeg: true },
        ],
      },
    ],
  },
  {
    id: "r3",
    name: "Sakura Sushi",
    cuisine: "Japanese",
    rating: 4.7,
    reviewCount: 654,
    deliveryTime: "35-45",
    distance: "2.1 km",
    minOrder: 399,
    deliveryFee: 49,
    isOpen: true,
    tags: ["Premium"],
    gradientColors: ["#880E4F", "#E91E63"],
    iconName: "leaf",
    menu: [
      {
        title: "Rolls",
        items: [
          { id: "sr1", name: "Spicy Tuna Roll", description: "Fresh tuna, cucumber, spicy mayo, tobiko", price: 449, rating: 4.8, isVeg: false, popular: true },
          { id: "sr2", name: "Dragon Roll", description: "Shrimp tempura, avocado, eel sauce", price: 499, rating: 4.7, isVeg: false, popular: true },
          { id: "sr3", name: "Avocado Roll", description: "Fresh avocado, cucumber, sesame seeds", price: 299, rating: 4.3, isVeg: true },
        ],
      },
      {
        title: "Nigiri",
        items: [
          { id: "sn1", name: "Salmon Nigiri (2 pcs)", description: "Premium Atlantic salmon over seasoned rice", price: 349, rating: 4.9, isVeg: false, popular: true },
          { id: "sn2", name: "Tuna Nigiri (2 pcs)", description: "Fresh bluefin over seasoned rice", price: 369, rating: 4.8, isVeg: false },
        ],
      },
      {
        title: "Starters",
        items: [
          { id: "ss1", name: "Edamame", description: "Salted steamed soybeans", price: 129, rating: 4.2, isVeg: true },
          { id: "ss2", name: "Gyoza (6 pcs)", description: "Pan-fried pork dumplings with ponzu", price: 229, rating: 4.5, isVeg: false, popular: true },
          { id: "ss3", name: "Miso Soup", description: "Dashi broth with tofu and wakame", price: 99, rating: 4.4, isVeg: true },
        ],
      },
    ],
  },
  {
    id: "r4",
    name: "Pasta Mia",
    cuisine: "Italian",
    rating: 4.3,
    reviewCount: 489,
    deliveryTime: "30-40",
    distance: "1.7 km",
    minOrder: 249,
    deliveryFee: 29,
    isOpen: true,
    tags: ["New"],
    gradientColors: ["#283593", "#5C6BC0"],
    iconName: "pizza",
    menu: [
      {
        title: "Pasta",
        items: [
          { id: "p1", name: "Spaghetti Carbonara", description: "Egg sauce, pancetta, parmesan, black pepper", price: 349, rating: 4.6, isVeg: false, popular: true, calories: 620 },
          { id: "p2", name: "Penne Arrabbiata", description: "Spicy tomato sauce with garlic and chilli", price: 279, rating: 4.2, isVeg: true, calories: 510 },
          { id: "p3", name: "Fettuccine Alfredo", description: "Rich cream sauce with mushrooms and herbs", price: 319, rating: 4.4, isVeg: true, popular: true },
        ],
      },
      {
        title: "Starters",
        items: [
          { id: "ps1", name: "Garlic Bread", description: "Toasted baguette with herb garlic butter", price: 129, rating: 4.3, isVeg: true },
          { id: "ps2", name: "Chicken Wings", description: "Crispy wings with BBQ or buffalo sauce", price: 299, rating: 4.5, isVeg: false, popular: true },
        ],
      },
      {
        title: "Desserts",
        items: [
          { id: "pd1", name: "Tiramisu", description: "Classic Italian coffee dessert", price: 199, rating: 4.7, isVeg: true, popular: true },
          { id: "pd2", name: "Panna Cotta", description: "Silky vanilla cream with berry coulis", price: 179, rating: 4.4, isVeg: true },
        ],
      },
    ],
  },
  {
    id: "r5",
    name: "Dosa Paradise",
    cuisine: "South Indian",
    rating: 4.4,
    reviewCount: 921,
    deliveryTime: "20-30",
    distance: "0.6 km",
    minOrder: 99,
    deliveryFee: 19,
    isOpen: true,
    tags: ["Budget Friendly"],
    gradientColors: ["#1B5E20", "#43A047"],
    iconName: "restaurant-outline",
    menu: [
      {
        title: "Dosas",
        items: [
          { id: "si1", name: "Masala Dosa", description: "Crispy rice crepe with spiced potato filling", price: 149, rating: 4.6, isVeg: true, popular: true },
          { id: "si2", name: "Rava Onion Dosa", description: "Semolina dosa with caramelized onions", price: 169, rating: 4.4, isVeg: true },
          { id: "si3", name: "Ghee Roast Dosa", description: "Paper thin, ghee roasted until golden", price: 179, rating: 4.5, isVeg: true, popular: true },
        ],
      },
      {
        title: "Rice & Curries",
        items: [
          { id: "sir1", name: "Chettinad Chicken Curry", description: "Aromatic whole spice chicken curry", price: 299, rating: 4.7, isVeg: false, popular: true },
          { id: "sir2", name: "Sambar Rice", description: "Slow-cooked lentil curry with rice", price: 149, rating: 4.2, isVeg: true },
          { id: "sir3", name: "Kerala Fish Curry", description: "Coconut milk fish curry with kodampuli", price: 329, rating: 4.6, isVeg: false },
        ],
      },
      {
        title: "Snacks",
        items: [
          { id: "sis1", name: "Medu Vada (2 pcs)", description: "Crispy lentil donuts with coconut chutney", price: 89, rating: 4.3, isVeg: true },
          { id: "sis2", name: "Idli Sambar (4 pcs)", description: "Steamed rice cakes with sambar", price: 99, rating: 4.2, isVeg: true },
        ],
      },
    ],
  },
  {
    id: "r6",
    name: "The Dessert Lab",
    cuisine: "Desserts, Beverages",
    rating: 4.6,
    reviewCount: 732,
    deliveryTime: "15-25",
    distance: "0.9 km",
    minOrder: 149,
    deliveryFee: 0,
    isOpen: true,
    tags: ["Free Delivery", "Popular"],
    gradientColors: ["#6A1B9A", "#AB47BC"],
    iconName: "ice-cream",
    menu: [
      {
        title: "Cakes",
        items: [
          { id: "c1", name: "Dark Chocolate Lava Cake", description: "Warm molten chocolate, served with vanilla ice cream", price: 249, rating: 4.8, isVeg: true, popular: true },
          { id: "c2", name: "NY Cheesecake Slice", description: "Classic New York cheesecake with berry compote", price: 229, rating: 4.6, isVeg: true },
          { id: "c3", name: "Red Velvet Slice", description: "Moist cake with cream cheese frosting", price: 199, rating: 4.5, isVeg: true },
        ],
      },
      {
        title: "Ice Creams",
        items: [
          { id: "ic1", name: "Nutella Sundae", description: "Three scoops with hot Nutella and roasted nuts", price: 189, rating: 4.7, isVeg: true, popular: true },
          { id: "ic2", name: "Mango Sorbet", description: "Pure Alphonso mango, no added sugar", price: 149, rating: 4.4, isVeg: true },
        ],
      },
      {
        title: "Hot Drinks",
        items: [
          { id: "hb1", name: "Single Origin Pour Over", description: "Ethiopian Yirgacheffe, bright and fruity notes", price: 179, rating: 4.6, isVeg: true, popular: true },
          { id: "hb2", name: "Ceremonial Matcha Latte", description: "Ceremonial grade matcha with oat milk", price: 199, rating: 4.5, isVeg: true },
        ],
      },
    ],
  },
  {
    id: "r7",
    name: "Noodle Dragon",
    cuisine: "Chinese, Pan-Asian",
    rating: 4.2,
    reviewCount: 567,
    deliveryTime: "25-35",
    distance: "1.4 km",
    minOrder: 179,
    deliveryFee: 29,
    isOpen: false,
    tags: [],
    gradientColors: ["#B71C1C", "#EF5350"],
    iconName: "cafe",
    menu: [
      {
        title: "Noodles",
        items: [
          { id: "n1", name: "Wok-Fried Hakka Noodles", description: "Classic Indo-Chinese with mixed veggies", price: 199, rating: 4.3, isVeg: true },
          { id: "n2", name: "Dan Dan Noodles", description: "Spicy Sichuan style with minced pork", price: 249, rating: 4.5, isVeg: false, popular: true },
        ],
      },
      {
        title: "Dim Sum",
        items: [
          { id: "ds1", name: "Har Gow (4 pcs)", description: "Steamed shrimp dumplings", price: 199, rating: 4.6, isVeg: false, popular: true },
          { id: "ds2", name: "Vegetable Dumplings (4 pcs)", description: "Mixed vegetable in delicate wrapper", price: 169, rating: 4.2, isVeg: true },
        ],
      },
    ],
  },
  {
    id: "r8",
    name: "Green Bowl",
    cuisine: "Healthy, Salads, Bowls",
    rating: 4.5,
    reviewCount: 394,
    deliveryTime: "20-30",
    distance: "1.1 km",
    minOrder: 249,
    deliveryFee: 0,
    isOpen: true,
    tags: ["Free Delivery", "Healthy"],
    gradientColors: ["#004D40", "#26A69A"],
    iconName: "leaf",
    menu: [
      {
        title: "Power Bowls",
        items: [
          { id: "pb1", name: "Teriyaki Chicken Bowl", description: "Grilled chicken, edamame, pickled veggies, sesame", price: 349, rating: 4.6, isVeg: false, popular: true },
          { id: "pb2", name: "Falafel & Hummus Bowl", description: "Crispy falafel, roasted veg, tahini dressing", price: 299, rating: 4.5, isVeg: true, popular: true },
          { id: "pb3", name: "Salmon Poke Bowl", description: "Raw salmon, mango, avocado, ponzu", price: 399, rating: 4.8, isVeg: false },
        ],
      },
      {
        title: "Salads",
        items: [
          { id: "sal1", name: "Caesar Salad", description: "Romaine, croutons, parmesan, house dressing", price: 249, rating: 4.3, isVeg: true },
          { id: "sal2", name: "Grilled Chicken Salad", description: "Mixed greens, avocado, cherry tomatoes", price: 299, rating: 4.4, isVeg: false },
        ],
      },
    ],
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: "ord_001",
    restaurantId: "r1",
    restaurantName: "Biryani House",
    items: [
      { id: "b1", name: "Hyderabadi Chicken Biryani", qty: 2, price: 349 },
      { id: "bev1", name: "Mango Lassi", qty: 1, price: 99 },
    ],
    status: "on_the_way",
    subtotal: 797,
    deliveryFee: 29,
    discount: 50,
    total: 776,
    date: "2026-06-10T14:32:00Z",
    estimatedTime: "18 mins",
  },
  {
    id: "ord_002",
    restaurantId: "r2",
    restaurantName: "Smash & Stack",
    items: [
      { id: "bg1", name: "Classic Smash Burger", qty: 1, price: 299 },
      { id: "f1", name: "Loaded Fries", qty: 1, price: 149 },
      { id: "ms1", name: "Oreo Shake", qty: 1, price: 179 },
    ],
    status: "delivered",
    subtotal: 627,
    deliveryFee: 0,
    discount: 0,
    total: 627,
    date: "2026-06-09T19:15:00Z",
  },
  {
    id: "ord_003",
    restaurantId: "r6",
    restaurantName: "The Dessert Lab",
    items: [
      { id: "c1", name: "Dark Chocolate Lava Cake", qty: 2, price: 249 },
      { id: "hb1", name: "Single Origin Pour Over", qty: 2, price: 179 },
    ],
    status: "delivered",
    subtotal: 856,
    deliveryFee: 0,
    discount: 100,
    total: 756,
    date: "2026-06-08T21:00:00Z",
  },
  {
    id: "ord_004",
    restaurantId: "r5",
    restaurantName: "Dosa Paradise",
    items: [
      { id: "si1", name: "Masala Dosa", qty: 2, price: 149 },
      { id: "sir1", name: "Chettinad Chicken Curry", qty: 1, price: 299 },
    ],
    status: "cancelled",
    subtotal: 597,
    deliveryFee: 19,
    discount: 0,
    total: 616,
    date: "2026-06-07T12:00:00Z",
  },
];

export const STATUS_STEPS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: "placed", label: "Order Placed", icon: "checkmark-circle" },
  { key: "confirmed", label: "Confirmed", icon: "storefront" },
  { key: "preparing", label: "Preparing", icon: "flame" },
  { key: "ready", label: "Ready", icon: "bag-check" },
  { key: "picked_up", label: "Picked Up", icon: "bicycle" },
  { key: "on_the_way", label: "On The Way", icon: "navigate" },
  { key: "delivered", label: "Delivered", icon: "home" },
];

export function getStatusIndex(status: OrderStatus): number {
  const flow: OrderStatus[] = ["placed", "confirmed", "preparing", "ready", "picked_up", "on_the_way", "delivered"];
  return flow.indexOf(status);
}
