import { Router } from "express";
import { Restaurant } from "../models/Restaurant";

const router = Router();

const SEED_DATA = [
  {
    name: "Biryani House",
    cuisine: "Hyderabadi, Mughlai",
    rating: 4.5, reviewCount: 1243,
    deliveryTime: "25-35", distance: "1.2 km",
    minOrder: 149, deliveryFee: 29,
    isOpen: true, isFeatured: true,
    tags: ["Popular", "Top Rated"],
    gradientColors: ["#D84315", "#FF8A65"],
    iconName: "restaurant",
    location: { lat: 12.9352, lng: 77.6245 },
    address: "12, 80 Feet Rd, Koramangala, Bangalore",
    menu: [
      {
        title: "Biryani", items: [
          { name: "Hyderabadi Chicken Biryani", description: "Slow-cooked with aromatic whole spices and saffron rice", price: 349, isVeg: false, popular: true, calories: 850, rating: 4.8 },
          { name: "Mutton Dum Biryani", description: "Tender mutton pieces in rich dum style", price: 449, isVeg: false, popular: true, rating: 4.7 },
          { name: "Veg Dum Biryani", description: "Mixed vegetables in fragrant basmati rice", price: 249, isVeg: true, rating: 4.2 },
          { name: "Prawn Biryani", description: "Fresh prawns with coastal masala", price: 399, isVeg: false, rating: 4.5 },
        ],
      },
      {
        title: "Starters", items: [
          { name: "Chicken 65", description: "Crispy fried chicken with curry leaves", price: 249, isVeg: false, popular: true, rating: 4.6 },
          { name: "Samosa (2 pcs)", description: "Crispy pastry with spiced potato filling", price: 79, isVeg: true, rating: 4.3 },
        ],
      },
      {
        title: "Beverages", items: [
          { name: "Mango Lassi", description: "Thick yogurt drink with Alphonso mango", price: 99, isVeg: true, rating: 4.5 },
        ],
      },
    ],
  },
  {
    name: "Smash & Stack",
    cuisine: "American, Burgers",
    rating: 4.4, reviewCount: 876,
    deliveryTime: "20-30", distance: "0.8 km",
    minOrder: 199, deliveryFee: 0,
    isOpen: true, isFeatured: true,
    tags: ["Free Delivery"],
    gradientColors: ["#E65100", "#FFCC02"],
    iconName: "fast-food",
    location: { lat: 12.9380, lng: 77.6270 },
    address: "5th Block, Koramangala, Bangalore",
    menu: [
      {
        title: "Burgers", items: [
          { name: "Classic Smash Burger", description: "Double smashed patty, cheddar, pickles, special sauce", price: 299, isVeg: false, popular: true, rating: 4.7 },
          { name: "Crispy Chicken Burger", description: "Buttermilk fried chicken, coleslaw, sriracha mayo", price: 279, isVeg: false, popular: true, rating: 4.6 },
          { name: "Mushroom Swiss Veggie", description: "Portobello mushroom, Swiss cheese, truffle aioli", price: 249, isVeg: true, rating: 4.3 },
        ],
      },
      {
        title: "Sides", items: [
          { name: "Loaded Fries", description: "Crispy fries with cheese sauce and jalapeños", price: 149, isVeg: true, popular: true, rating: 4.4 },
        ],
      },
      {
        title: "Shakes", items: [
          { name: "Oreo Shake", description: "Thick Oreo milkshake with whipped cream", price: 179, isVeg: true, popular: true, rating: 4.6 },
        ],
      },
    ],
  },
  {
    name: "Sakura Sushi",
    cuisine: "Japanese",
    rating: 4.7, reviewCount: 654,
    deliveryTime: "35-45", distance: "2.1 km",
    minOrder: 399, deliveryFee: 49,
    isOpen: true,
    tags: ["Premium"],
    gradientColors: ["#880E4F", "#E91E63"],
    iconName: "leaf",
    location: { lat: 12.9310, lng: 77.6290 },
    address: "Indiranagar 100 Feet Road, Bangalore",
    menu: [
      {
        title: "Rolls", items: [
          { name: "Spicy Tuna Roll", description: "Fresh tuna, cucumber, spicy mayo, tobiko", price: 449, isVeg: false, popular: true, rating: 4.8 },
          { name: "Dragon Roll", description: "Shrimp tempura, avocado, eel sauce", price: 499, isVeg: false, popular: true, rating: 4.7 },
          { name: "Avocado Roll", description: "Fresh avocado, cucumber, sesame seeds", price: 299, isVeg: true, rating: 4.3 },
        ],
      },
      {
        title: "Starters", items: [
          { name: "Gyoza (6 pcs)", description: "Pan-fried pork dumplings with ponzu", price: 229, isVeg: false, popular: true, rating: 4.5 },
          { name: "Edamame", description: "Salted steamed soybeans", price: 129, isVeg: true, rating: 4.2 },
        ],
      },
    ],
  },
  {
    name: "Dosa Paradise",
    cuisine: "South Indian",
    rating: 4.4, reviewCount: 921,
    deliveryTime: "20-30", distance: "0.6 km",
    minOrder: 99, deliveryFee: 19,
    isOpen: true,
    tags: ["Budget Friendly"],
    gradientColors: ["#1B5E20", "#43A047"],
    iconName: "restaurant-outline",
    location: { lat: 12.9330, lng: 77.6180 },
    address: "3rd Cross, Koramangala 1st Block, Bangalore",
    menu: [
      {
        title: "Dosas", items: [
          { name: "Masala Dosa", description: "Crispy rice crepe with spiced potato filling", price: 149, isVeg: true, popular: true, rating: 4.6 },
          { name: "Ghee Roast Dosa", description: "Paper thin, ghee roasted until golden", price: 179, isVeg: true, popular: true, rating: 4.5 },
        ],
      },
      {
        title: "Rice & Curries", items: [
          { name: "Chettinad Chicken Curry", description: "Aromatic whole spice chicken curry", price: 299, isVeg: false, popular: true, rating: 4.7 },
          { name: "Kerala Fish Curry", description: "Coconut milk fish curry with kodampuli", price: 329, isVeg: false, rating: 4.6 },
        ],
      },
    ],
  },
  {
    name: "The Dessert Lab",
    cuisine: "Desserts, Beverages",
    rating: 4.6, reviewCount: 732,
    deliveryTime: "15-25", distance: "0.9 km",
    minOrder: 149, deliveryFee: 0,
    isOpen: true,
    tags: ["Free Delivery", "Popular"],
    gradientColors: ["#6A1B9A", "#AB47BC"],
    iconName: "ice-cream",
    location: { lat: 12.9370, lng: 77.6220 },
    address: "7th Block, Koramangala, Bangalore",
    menu: [
      {
        title: "Cakes", items: [
          { name: "Dark Chocolate Lava Cake", description: "Warm molten chocolate, served with vanilla ice cream", price: 249, isVeg: true, popular: true, rating: 4.8 },
          { name: "NY Cheesecake Slice", description: "Classic New York cheesecake with berry compote", price: 229, isVeg: true, rating: 4.6 },
        ],
      },
      {
        title: "Hot Drinks", items: [
          { name: "Single Origin Pour Over", description: "Ethiopian Yirgacheffe, bright and fruity notes", price: 179, isVeg: true, popular: true, rating: 4.6 },
          { name: "Ceremonial Matcha Latte", description: "Ceremonial grade matcha with oat milk", price: 199, isVeg: true, rating: 4.5 },
        ],
      },
    ],
  },
  {
    name: "Green Bowl",
    cuisine: "Healthy, Salads, Bowls",
    rating: 4.5, reviewCount: 394,
    deliveryTime: "20-30", distance: "1.1 km",
    minOrder: 249, deliveryFee: 0,
    isOpen: true,
    tags: ["Free Delivery", "Healthy"],
    gradientColors: ["#004D40", "#26A69A"],
    iconName: "leaf",
    location: { lat: 12.9295, lng: 77.6260 },
    address: "HSR Layout Sector 1, Bangalore",
    menu: [
      {
        title: "Power Bowls", items: [
          { name: "Teriyaki Chicken Bowl", description: "Grilled chicken, edamame, pickled veggies, sesame", price: 349, isVeg: false, popular: true, rating: 4.6 },
          { name: "Falafel & Hummus Bowl", description: "Crispy falafel, roasted veg, tahini dressing", price: 299, isVeg: true, popular: true, rating: 4.5 },
          { name: "Salmon Poke Bowl", description: "Raw salmon, mango, avocado, ponzu", price: 399, isVeg: false, rating: 4.8 },
        ],
      },
    ],
  },
];

router.post("/restaurants", async (req, res) => {
  try {
    const count = await Restaurant.countDocuments();
    if (count > 0) {
      res.json({ message: `Already seeded (${count} restaurants)` });
      return;
    }
    await Restaurant.insertMany(SEED_DATA);
    res.json({ message: `Seeded ${SEED_DATA.length} restaurants` });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Seed failed" });
  }
});

router.delete("/restaurants", async (req, res) => {
  try {
    await Restaurant.deleteMany({});
    res.json({ message: "All restaurants deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;
