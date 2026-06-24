// import { Router } from "express";
// import { Restaurant } from "../models/Restaurant";

// const router = Router();

// router.get("/", async (req, res) => {
//   try {
//     const { category, search, featured, limit = "20", page = "1" } = req.query as Record<string, string>;
//     const query: Record<string, unknown> = {};

//     if (category) {
//       query["$or"] = [
//         { cuisine: { $regex: category, $options: "i" } },
//         { tags: { $elemMatch: { $regex: category, $options: "i" } } },
//         { "menu.title": { $regex: category, $options: "i" } },
//       ];
//     }
//     if (search) {
//       query["$or"] = [
//         { name: { $regex: search, $options: "i" } },
//         { cuisine: { $regex: search, $options: "i" } },
//         { "menu.items.name": { $regex: search, $options: "i" } },
//       ];
//     }
//     if (featured === "true") query["isFeatured"] = true;

//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     const [restaurants, total] = await Promise.all([
//       Restaurant.find(query).skip(skip).limit(parseInt(limit)).lean(),
//       Restaurant.countDocuments(query),
//     ]);

//     res.json({ restaurants, total, page: parseInt(page), limit: parseInt(limit) });
//   } catch (err) {
//     req.log.error({ err });
//     res.status(500).json({ error: "Failed to fetch restaurants" });
//   }
// });

// router.get("/:id", async (req, res) => {
//   try {
//     const restaurant = await Restaurant.findById(req.params["id"]).lean();
//     if (!restaurant) { res.status(404).json({ error: "Restaurant not found" }); return; }
//     res.json({ restaurant });
//   } catch (err) {
//     req.log.error({ err });
//     res.status(500).json({ error: "Failed to fetch restaurant" });
//   }
// });

// export default router;


// import { Router } from "express";
// import { Restaurant } from "../models/Restaurant";

// const router = Router();

// // GET all restaurants with filtering
// router.get("/", async (req, res) => {
//   try {
//     const { 
//       category, 
//       search, 
//       featured, 
//       limit = "20", 
//       page = "1",
//       latitude,
//       longitude,
//       radius = "5000" // 5km default
//     } = req.query as Record<string, string>;

//     const query: Record<string, any> = {};
//     const filters = [];

//     // Category filter
//     if (category) {
//       filters.push({
//         $or: [
//           { cuisine: { $regex: category, $options: "i" } },
//           { tags: { $elemMatch: { $regex: category, $options: "i" } } }
//         ]
//       });
//     }

//     // Search filter
//     if (search) {
//       filters.push({
//         $or: [
//           { name: { $regex: search, $options: "i" } },
//           { cuisine: { $regex: search, $options: "i" } },
//           { "address.city": { $regex: search, $options: "i" } },
//           { "address.locality": { $regex: search, $options: "i" } }
//         ]
//       });
//     }

//     // Featured filter
//     if (featured === "true") {
//       filters.push({ isFeatured: true });
//     }

//     // Location-based filter (if you have geolocation)
//     if (latitude && longitude) {
//       filters.push({
//         location: {
//           $near: {
//             $geometry: {
//               type: "Point",
//               coordinates: [parseFloat(longitude), parseFloat(latitude)]
//             },
//             $maxDistance: parseInt(radius)
//           }
//         }
//       });
//     }

//     // Apply all filters with $and
//     if (filters.length > 0) {
//       query.$and = filters;
//     }

//     // Pagination
//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     const limitNum = parseInt(limit);

//     // Get restaurants with pagination
//     const [restaurants, total] = await Promise.all([
//       Restaurant.find(query)
//         .sort({ rating: -1 }) // Sort by rating descending
//         .skip(skip)
//         .limit(limitNum)
//         .lean(),
//       Restaurant.countDocuments(query)
//     ]);

//     // Calculate average rating and other stats if needed
//     const restaurantsWithStats = restaurants.map(restaurant => ({
//       ...restaurant,
//       averageRating: restaurant.rating || 0,
//       totalReviews: restaurant.reviews?.length || 0
//     }));

//     res.json({
//       success: true,
//       data: restaurantsWithStats,
//       pagination: {
//         total,
//         page: parseInt(page),
//         limit: limitNum,
//         totalPages: Math.ceil(total / limitNum)
//       }
//     });

//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : String(err);
//     console.error("Error fetching restaurants:", errorMessage);
//     res.status(500).json({ 
//       success: false,
//       error: "Failed to fetch restaurants",
//       message: errorMessage
//     });
//   }
// });

// // GET single restaurant by ID
// router.get("/:id", async (req, res) => {
//   try {
//     const restaurant = await Restaurant.findById(req.params.id)
//       .populate('reviews') // If you have reviews collection
//       .lean();

//     if (!restaurant) {
//       return res.status(404).json({
//         success: false,
//         error: "Restaurant not found"
//       });
//     }

//     res.json({
//       success: true,
//       data: restaurant
//     });

//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : String(err);
//     console.error("Error fetching restaurant:", errorMessage);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch restaurant",
//       message: errorMessage
//     });
//   }
// });

// // GET restaurants by cuisine type
// router.get("/cuisine/:type", async (req, res) => {
//   try {
//     const { type } = req.params;
//     const restaurants = await Restaurant.find({
//       cuisine: { $regex: type, $options: "i" }
//     })
//     .sort({ rating: -1 })
//     .limit(20)
//     .lean();

//     res.json({
//       success: true,
//       data: restaurants,
//       count: restaurants.length
//     });

//   } catch (err) {
//     console.error("Error fetching restaurants by cuisine:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch restaurants"
//     });
//   }
// });

// // GET featured restaurants
// router.get("/featured", async (req, res) => {
//   try {
//     const restaurants = await Restaurant.find({ 
//       isFeatured: true,
//       isActive: true
//     })
//     .sort({ rating: -1 })
//     .limit(10)
//     .lean();

//     res.json({
//       success: true,
//       data: restaurants
//     });

//   } catch (err) {
//     console.error("Error fetching featured restaurants:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch featured restaurants"
//     });
//   }
// });

// router.post("/", async (req, res) => {
//   try {
//     console.log("📝 Creating new restaurant...");
//     console.log("📦 Request body:", JSON.stringify(req.body, null, 2));

//     // Validate required fields
//     const requiredFields = ['name', 'cuisine', 'deliveryTime', 'minOrder', 'address'];
//     const missingFields = requiredFields.filter(field => !req.body[field]);
    
//     if (missingFields.length > 0) {
//       return res.status(400).json({
//         success: false,
//         error: `Missing required fields: ${missingFields.join(', ')}`
//       });
//     }

//     // Validate menu
//     if (!req.body.menu || req.body.menu.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'At least one menu category with items is required'
//       });
//     }

//     // Transform data to match your schema
//     const restaurantData = {
//       name: req.body.name,
//       cuisine: Array.isArray(req.body.cuisine) ? req.body.cuisine : [req.body.cuisine],
//       rating: req.body.rating || 0,
//       totalRatings: req.body.reviewCount || 0,
//       priceRange: req.body.priceRange || '₹₹',
//       deliveryTime: parseInt(req.body.deliveryTime) || 30,
//       minimumOrder: req.body.minOrder || 0,
//       deliveryFee: req.body.deliveryFee || 0,
//       isActive: true,
//       isFeatured: req.body.isFeatured || false,
//       isOpen: req.body.isOpen !== undefined ? req.body.isOpen : true,
//       address: {
//         street: req.body.address || '',
//         locality: req.body.address?.split(',')[0]?.trim() || '',
//         city: req.body.address?.split(',')[1]?.trim() || '',
//         state: req.body.address?.split(',')[2]?.trim() || '',
//         pincode: req.body.pincode || '',
//         coordinates: {
//           lat: req.body.location?.lat || 0,
//           lng: req.body.location?.lng || 0
//         }
//       },
//       location: {
//         type: 'Point',
//         coordinates: [req.body.location?.lng || 0, req.body.location?.lat || 0]
//       },
//       images: req.body.images || [],
//       logo: req.body.logo || '',
//       coverImage: req.body.coverImage || '',
//       phone: req.body.phone || '',
//       email: req.body.email || '',
//       tags: req.body.tags || [],
//       menu: req.body.menu?.map((category: any) => ({
//         category: category.title,
//         items: category.items?.map((item: any) => ({
//           name: item.name,
//           description: item.description || '',
//           price: item.price,
//           isVeg: item.isVeg || false,
//           isAvailable: true,
//           image: item.image || '',
//           customizations: item.customizations || []
//         })) || []
//       })) || []
//     };

//     // Create restaurant
//     const restaurant = new Restaurant(restaurantData);
//     await restaurant.save();

//     console.log(`✅ Restaurant created: ${restaurant._id}`);

//     res.status(201).json({
//       success: true,
//       message: 'Restaurant created successfully',
//       restaurant: restaurant
//     });

//   } catch (error) {
//     console.error('❌ Error creating restaurant:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to create restaurant',
//       message: error.message
//     });
//   }
// });

// export default router;

// routes/restaurants.ts
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