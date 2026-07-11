import { Router } from "express";
import { Restaurant } from "../models/Restaurant";

const router = Router();

// DEBUG: Log when this file loads
console.log("📦 Loading restaurants router");

// GET all restaurants
router.get("/", async (req, res) => {
  try {
    console.log("📡 GET /api/restaurants");
    const restaurants = await Restaurant.find().limit(20).lean();
    res.json({
      success: true,
      data: restaurants,
      count: restaurants.length
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST - Create restaurant
router.post("/", async (req, res) => {
  console.log("📝 POST /api/restaurants - HIT!");
  console.log("📦 Body:", JSON.stringify(req.body, null, 2));
  
  try {
    // Validate required fields
    if (!req.body.name) {
      return res.status(400).json({ 
        success: false, 
        error: "Name is required" 
      });
    }

    // Create restaurant with simple data first
    const restaurantData = {
      name: req.body.name,
      cuisine: Array.isArray(req.body.cuisine) ? req.body.cuisine : [req.body.cuisine || 'Unknown'],
      deliveryTime: 30,
      minimumOrder: req.body.minOrder || 0,
      coverImage: req.body.coverImage || '',
      address: {
        street: req.body.address || '',
        locality: req.body.address?.split(',')[0]?.trim() || '',
        city: req.body.address?.split(',')[1]?.trim() || '',
        state: req.body.address?.split(',')[2]?.trim() || '',
      },
      menu: req.body.menu?.map(category => ({
        category: category.title || 'Unknown',
        items: category.items?.map(item => ({
          name: item.name,
          description: item.description || '',
          price: item.price || 0,
          isVeg: item.isVeg || false,
          isAvailable: true
        })) || []
      })) || []
    };

    console.log("📝 Creating restaurant with:", JSON.stringify(restaurantData, null, 2));

    const restaurant = new Restaurant(restaurantData);
    await restaurant.save();

    console.log(`✅ Restaurant created: ${restaurant._id}`);

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      restaurant: restaurant
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create restaurant",
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// GET single restaurant
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).lean();
    if (!restaurant) {
      return res.status(404).json({ success: false, error: "Not found" });
    }
    res.json({ success: true, data: restaurant });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

console.log("✅ Restaurants router loaded");

export default router;